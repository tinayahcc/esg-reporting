"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipHelper } from "@/components/tooltip-helper";
import {
  Leaf,
  Users,
  Building2,
  Save,
  Info,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { esg } from "@/lib/api-client";

// Status types for submissions
type SubmissionStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

// Submission type
type Submission = {
  id: string;
  type: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE";
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  reviewer: { name: string } | null;
  rejectionReason: string | null;
  companyId: string;
  company: { name: string };
};

export default function ReportPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState("ENVIRONMENTAL");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formStatus, setFormStatus] = useState<SubmissionStatus>("DRAFT");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form data states
  const [environmentalData, setEnvironmentalData] = useState({
    carbonEmissions: "",
    energyUsage: "",
    renewableEnergy: "",
    wasteRecycled: "",
    waterUsage: "",
    paperUsage: "",
  });

  const [socialData, setSocialData] = useState({
    genderDiversity: "",
    employeeTurnover: "",
    trainingHours: "",
    payEquityRatio: "",
    communityInvestment: "",
    employeeSatisfaction: "",
  });

  const [governanceData, setGovernanceData] = useState({
    boardDiversity: "",
    ethicsViolations: "",
    policyCoverage: "",
    dataBreaches: "",
    complianceScore: "",
    riskAssessment: "",
  });

  // Check if user is admin
  const isAdmin = session?.user?.role === "ADMIN";

  // Load submissions when component mounts
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadSubmissions();
    }
  }, [sessionStatus, activeTab]);

  // Load submissions from API
  const loadSubmissions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await esg.getSubmissions({ type: activeTab })
      setSubmissions(data)

      // Set form status based on latest submission
      if (data.length > 0) {
        setFormStatus(data[0].status);
      } else {
        setFormStatus("DRAFT");
      }
    } catch (error: any) {
      setError(error.message || "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Prepare data based on active tab
      let formData;

      if (activeTab === "ENVIRONMENTAL") {
        formData = {
          carbonEmissions:
            Number.parseFloat(environmentalData.carbonEmissions) || null,
          energyUsage: Number.parseFloat(environmentalData.energyUsage) || null,
          renewableEnergy:
            Number.parseFloat(environmentalData.renewableEnergy) || null,
          wasteRecycled:
            Number.parseFloat(environmentalData.wasteRecycled) || null,
          waterUsage: Number.parseFloat(environmentalData.waterUsage) || null,
          paperUsage: Number.parseFloat(environmentalData.paperUsage) || null,
        };
      } else if (activeTab === "SOCIAL") {
        formData = {
          genderDiversity:
            Number.parseFloat(socialData.genderDiversity) || null,
          employeeTurnover:
            Number.parseFloat(socialData.employeeTurnover) || null,
          trainingHours: Number.parseFloat(socialData.trainingHours) || null,
          payEquityRatio: Number.parseFloat(socialData.payEquityRatio) || null,
          communityInvestment:
            Number.parseFloat(socialData.communityInvestment) || null,
          employeeSatisfaction:
            Number.parseFloat(socialData.employeeSatisfaction) || null,
        };
      } else {
        formData = {
          boardDiversity:
            Number.parseFloat(governanceData.boardDiversity) || null,
          ethicsViolations:
            Number.parseInt(governanceData.ethicsViolations) || null,
          policyCoverage:
            Number.parseFloat(governanceData.policyCoverage) || null,
          dataBreaches: Number.parseInt(governanceData.dataBreaches) || null,
          complianceScore:
            Number.parseFloat(governanceData.complianceScore) || null,
          riskAssessment: governanceData.riskAssessment || null,
        };
      }

      // Submit data to API
      await esg.submitData({
        type: activeTab as any,
        data: formData,
      });

      // Show success alert
      setShowSuccessAlert(true);

      // Reload submissions
      await loadSubmissions();

      // Reset form if needed
      if (activeTab === "ENVIRONMENTAL") {
        setEnvironmentalData({
          carbonEmissions: "",
          energyUsage: "",
          renewableEnergy: "",
          wasteRecycled: "",
          waterUsage: "",
          paperUsage: "",
        });
      } else if (activeTab === "SOCIAL") {
        setSocialData({
          genderDiversity: "",
          employeeTurnover: "",
          trainingHours: "",
          payEquityRatio: "",
          communityInvestment: "",
          employeeSatisfaction: "",
        });
      } else {
        setGovernanceData({
          boardDiversity: "",
          ethicsViolations: "",
          policyCoverage: "",
          dataBreaches: "",
          complianceScore: "",
          riskAssessment: "",
        });
      }

      // Hide alert after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } catch (error: any) {
      setError(error.message || "Failed to submit data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle admin review action
  const handleAdminAction = async (
    id: string,
    action: "APPROVED" | "REJECTED",
    reason?: string
  ) => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError("");

    try {
      await esg.reviewSubmission({
        submissionId: id,
        status: action,
        rejectionReason: reason,
      });

      // Reload submissions
      await loadSubmissions();
    } catch (error: any) {
      setError(error.message || `Failed to ${action.toLowerCase()} submission`);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Draft
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pending Review
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Needs Revision
          </Badge>
        );
    }
  };

  // Handle input change for environmental data
  const handleEnvironmentalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setEnvironmentalData((prev) => ({
      ...prev,
      [id.replace("environmental-", "")]: value,
    }));
  };

  // Handle input change for social data
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSocialData((prev) => ({
      ...prev,
      [id.replace("social-", "")]: value,
    }));
  };

  // Handle input change for governance data
  const handleGovernanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setGovernanceData((prev) => ({
      ...prev,
      [id.replace("governance-", "")]: value,
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                  <Link href="/dashboard">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                ESG Data Reporting
              </h1>
              <p className="text-muted-foreground">
                Enter your Environmental, Social, and Governance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={formStatus} />
              <Button type="submit" form="esg-form" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Data"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showSuccessAlert && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Submission Successful</AlertTitle>
              <AlertDescription>
                Your ESG data has been submitted and is pending review by our
                ESG team. You'll be notified once it's approved.
              </AlertDescription>
            </Alert>
          )}

          {submissions.length > 0 &&
            submissions[0].status === "REJECTED" &&
            submissions[0].rejectionReason && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle>Revision Required</AlertTitle>
                <AlertDescription>
                  {submissions[0].rejectionReason}
                </AlertDescription>
              </Alert>
            )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Submission History</CardTitle>
              <CardDescription>
                Previous data submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">Loading submissions...</div>
              ) : (
                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          {submission.status === "PENDING" && (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          {submission.status === "APPROVED" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {submission.status === "REJECTED" && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {new Date(
                                submission.submittedAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {submission.status === "PENDING"
                                ? "Awaiting review"
                                : `${
                                    submission.status === "APPROVED"
                                      ? "Approved"
                                      : "Reviewed"
                                  } by ${
                                    submission.reviewer?.name
                                  } on ${new Date(
                                    submission.reviewedAt!
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={submission.status} />

                          {/* Admin actions (for ESG team members only) */}
                          {submission.status === "PENDING" && isAdmin && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() =>
                                  handleAdminAction(submission.id, "APPROVED")
                                }
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  const reason = prompt(
                                    "Please provide a reason for rejection:"
                                  );
                                  if (reason) {
                                    handleAdminAction(
                                      submission.id,
                                      "REJECTED",
                                      reason
                                    );
                                  }
                                }}
                                disabled={isLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}

                          {/* Show lock icon for company users on pending submissions */}
                          {submission.status === "PENDING" && !isAdmin && (
                            <div className="flex items-center text-muted-foreground text-xs">
                              <Lock className="h-3 w-3 mr-1" /> Awaiting ESG
                              team review
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No submission history for this category yet.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs
            defaultValue="ENVIRONMENTAL"
            className="mb-8"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="ENVIRONMENTAL"
                className="data-[state=active]:bg-[#e2f2df] data-[state=active]:text-[#14ae5c]"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Environmental
              </TabsTrigger>
              <TabsTrigger
                value="SOCIAL"
                className="data-[state=active]:bg-[rgba(128,0,128,0.1)] data-[state=active]:text-[#8000ff]"
              >
                <Users className="h-4 w-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger
                value="GOVERNANCE"
                className="data-[state=active]:bg-[rgba(255,140,0,0.1)] data-[state=active]:text-[#ff8c00]"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Governance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ENVIRONMENTAL" className="space-y-6">
              <Card>
                <CardHeader className="bg-[#e2f2df] bg-opacity-50">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-[#14ae5c]" />
                    <CardTitle>Environmental Data</CardTitle>
                  </div>
                  <CardDescription>
                    Report your company's impact on the natural world
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form
                    id="esg-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-carbonEmissions">
                              Carbon Emissions
                            </Label>
                            <TooltipHelper text="Total greenhouse gas emissions measured in tons of CO2 equivalent. Include direct (Scope 1) and indirect (Scope 2) emissions.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-carbonEmissions"
                              placeholder="0.0"
                              type="number"
                              step="0.1"
                              value={environmentalData.carbonEmissions}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              tons CO2e
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-energyUsage">
                              Energy Usage
                            </Label>
                            <TooltipHelper text="Total energy consumption from all sources including electricity, natural gas, and other fuels.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-energyUsage"
                              placeholder="0"
                              type="number"
                              value={environmentalData.energyUsage}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              kWh
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-renewableEnergy">
                              Renewable Energy
                            </Label>
                            <TooltipHelper text="Percentage of total energy consumption that comes from renewable sources.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-renewableEnergy"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={environmentalData.renewableEnergy}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-wasteRecycled">
                              Waste Recycled
                            </Label>
                            <TooltipHelper text="Percentage of total waste that is recycled or composted rather than sent to landfill.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-wasteRecycled"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={environmentalData.wasteRecycled}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-waterUsage">
                              Water Usage
                            </Label>
                            <TooltipHelper text="Total water consumption in gallons.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-waterUsage"
                              placeholder="0"
                              type="number"
                              value={environmentalData.waterUsage}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              gallons
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="environmental-paperUsage">
                              Paper Usage
                            </Label>
                            <TooltipHelper text="Total paper consumption measured in reams.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="environmental-paperUsage"
                              placeholder="0"
                              type="number"
                              value={environmentalData.paperUsage}
                              onChange={handleEnvironmentalChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              reams
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    Data will be reviewed by our ESG team before being published
                    to your dashboard
                  </div>
                  <Button
                    type="submit"
                    form="esg-form"
                    className="bg-[#14ae5c] hover:bg-[#14ae5c]/90"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Environmental Data"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="SOCIAL" className="space-y-6">
              <Card>
                <CardHeader className="bg-[rgba(128,0,128,0.1)]">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#8000ff]" />
                    <CardTitle>Social Data</CardTitle>
                  </div>
                  <CardDescription>
                    Report your impact on people and communities
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form
                    id="esg-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-genderDiversity">
                              Gender Diversity
                            </Label>
                            <TooltipHelper text="Percentage of women in your workforce.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-genderDiversity"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={socialData.genderDiversity}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              % women
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-employeeTurnover">
                              Employee Turnover
                            </Label>
                            <TooltipHelper text="Percentage of employees who left the company in the reporting period.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-employeeTurnover"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={socialData.employeeTurnover}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-trainingHours">
                              Training Hours
                            </Label>
                            <TooltipHelper text="Average number of training hours per employee during the reporting period.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-trainingHours"
                              placeholder="0"
                              type="number"
                              min="0"
                              value={socialData.trainingHours}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              hrs/employee
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-payEquityRatio">
                              Pay Equity Ratio
                            </Label>
                            <TooltipHelper text="Ratio of women's to men's compensation (1.0 means equal pay).">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-payEquityRatio"
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0"
                              max="2"
                              value={socialData.payEquityRatio}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              women:men
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-communityInvestment">
                              Community Investment
                            </Label>
                            <TooltipHelper text="Percentage of profit invested in community initiatives.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-communityInvestment"
                              placeholder="0.0"
                              type="number"
                              step="0.1"
                              min="0"
                              value={socialData.communityInvestment}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              % of profit
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="social-employeeSatisfaction">
                              Employee Satisfaction
                            </Label>
                            <TooltipHelper text="Average employee satisfaction score on a scale of 1-5.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="social-employeeSatisfaction"
                              placeholder="0.0"
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={socialData.employeeSatisfaction}
                              onChange={handleSocialChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              /5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    Data will be reviewed by our ESG team before being published
                    to your dashboard
                  </div>
                  <Button
                    type="submit"
                    form="esg-form"
                    className="bg-[#8000ff] hover:bg-[#8000ff]/90"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Social Data"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="GOVERNANCE" className="space-y-6">
              <Card>
                <CardHeader className="bg-[rgba(255,140,0,0.1)]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-[#ff8c00]" />
                    <CardTitle>Governance Data</CardTitle>
                  </div>
                  <CardDescription>
                    Report your business ethics and leadership practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form
                    id="esg-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-boardDiversity">
                              Board Diversity
                            </Label>
                            <TooltipHelper text="Percentage of board members from underrepresented groups (women, minorities, etc.).">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="governance-boardDiversity"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={governanceData.boardDiversity}
                              onChange={handleGovernanceChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-ethicsViolations">
                              Ethics Violations
                            </Label>
                            <TooltipHelper text="Number of ethics violations or incidents reported during the period.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="governance-ethicsViolations"
                              placeholder="0"
                              type="number"
                              min="0"
                              value={governanceData.ethicsViolations}
                              onChange={handleGovernanceChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              incidents
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-policyCoverage">
                              Policy Coverage
                            </Label>
                            <TooltipHelper text="Percentage of key governance areas covered by formal policies.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="governance-policyCoverage"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={governanceData.policyCoverage}
                              onChange={handleGovernanceChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-dataBreaches">
                              Data Breaches
                            </Label>
                            <TooltipHelper text="Number of data breaches or security incidents during the reporting period.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="governance-dataBreaches"
                              placeholder="0"
                              type="number"
                              min="0"
                              value={governanceData.dataBreaches}
                              onChange={handleGovernanceChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              incidents
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-complianceScore">
                              Compliance Score
                            </Label>
                            <TooltipHelper text="Percentage compliance with applicable regulations and standards.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              id="governance-complianceScore"
                              placeholder="0"
                              type="number"
                              min="0"
                              max="100"
                              value={governanceData.complianceScore}
                              onChange={handleGovernanceChange}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Label htmlFor="governance-riskAssessment">
                              Risk Assessment Frequency
                            </Label>
                            <TooltipHelper text="How often comprehensive risk assessments are conducted.">
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipHelper>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              id="governance-riskAssessment"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={governanceData.riskAssessment}
                              onChange={handleGovernanceChange}
                            >
                              <option value="">Select frequency</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Quarterly">Quarterly</option>
                              <option value="Bi-annually">Bi-annually</option>
                              <option value="Annually">Annually</option>
                              <option value="As needed">As needed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    Data will be reviewed by our ESG team before being published
                    to your dashboard
                  </div>
                  <Button
                    type="submit"
                    form="esg-form"
                    className="bg-[#ff8c00] hover:bg-[#ff8c00]/90"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Governance Data"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
