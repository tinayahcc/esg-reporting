"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ESGScoreCard } from "@/components/esg-score-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Leaf,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronRight,
  PlusCircle,
  FileX,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { esg } from "@/lib/api-client"

// This would normally come from an API or database
// For demo purposes, we're simulating data availability
const DATA_STATUS = {
  ENVIRONMENTAL: false,
  SOCIAL: false,
  GOVERNANCE: false,
}

interface Submission  {
  id: string;
  type: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  reviewer: { name: string } | null;
  rejectionReason: string | null;
  companyId: string;
  company: { name: string };
};

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [scores, setScores] = useState<{
    environmentalScore: number | null
    socialScore: number | null
    governanceScore: number | null
    overallScore: number | null
  }>({
    environmentalScore: null,
    socialScore: null,
    governanceScore: null,
    overallScore: null,
  })
  const [dataStatus, setDataStatus] = useState(DATA_STATUS)

  // Load ESG scores when component mounts
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadESGScores()
      loadSubmissionStatus()
    }
  }, [sessionStatus])

  // Load ESG scores from API
  const loadESGScores = async () => {
    setIsLoading(true)
    setError("")

    try {
      const data = await esg.getScores()
      setScores({
        environmentalScore: data.environmentalScore,
        socialScore: data.socialScore,
        governanceScore: data.governanceScore,
        overallScore: data.overallScore,
      })
    } catch (error: any) {
      // If 404, it means no scores yet, which is fine
      if (error.message !== "No ESG scores found") {
        setError(error.message || "Failed to load ESG scores")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load submission status to determine which data is available
  const loadSubmissionStatus = async () => {
    try {
      // Get all submissions
      const submissions: Submission[]  = await esg.getSubmissions()

      // Check if there are approved submissions for each type
      const hasEnvironmental = submissions.some((sub: Submission) => sub.type === "ENVIRONMENTAL" && sub.status === "APPROVED")

      const hasSocial = submissions.some((sub: Submission) => sub.type === "SOCIAL" && sub.status === "APPROVED")

      const hasGovernance = submissions.some((sub: Submission) => sub.type === "GOVERNANCE" && sub.status === "APPROVED")

      setDataStatus({
        ENVIRONMENTAL: hasEnvironmental,
        SOCIAL: hasSocial,
        GOVERNANCE: hasGovernance,
      })
    } catch (error: any) {
      console.error("Failed to load submission status:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ESG Dashboard</h1>
              <p className="text-muted-foreground">
                Track and improve your Environmental, Social, and Governance metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/analytics">
                  View Analytics
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/report">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Report Data
                </Link>
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <ESGScoreCard
              title="Environmental"
              score={scores.environmentalScore || 0}
              color="environmental"
              description="Your environmental score measures your company's impact on the natural world, including carbon emissions, energy usage, and waste management."
            />
            <ESGScoreCard
              title="Social"
              score={scores.socialScore || 0}
              color="social"
              description="Your social score evaluates how your company manages relationships with employees, suppliers, customers, and the communities where you operate."
            />
            <ESGScoreCard
              title="Governance"
              score={scores.governanceScore || 0}
              color="governance"
              description="Your governance score assesses your company's leadership, policies, audits, internal controls, and transparency practices."
            />
          </div>

          <Tabs defaultValue="ENVIRONMENTAL" className="mb-8">
            <TabsList>
              <TabsTrigger value="ENVIRONMENTAL">Environmental</TabsTrigger>
              <TabsTrigger value="SOCIAL">Social</TabsTrigger>
              <TabsTrigger value="GOVERNANCE">Governance</TabsTrigger>
            </TabsList>

            <TabsContent value="ENVIRONMENTAL" className="space-y-6">
              {dataStatus.ENVIRONMENTAL ? (
                <Card>
                  <CardHeader className="bg-[#e2f2df] bg-opacity-50">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-6 w-6 text-[#14ae5c]" />
                      <CardTitle>Environmental Performance</CardTitle>
                    </div>
                    <CardDescription>Tracking your company's impact on the natural world</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        {
                          title: "Carbon Emissions",
                          value: "12.5",
                          unit: "tons CO2e",
                          change: "-5%",
                          positive: true,
                        },
                        {
                          title: "Energy Usage",
                          value: "4,250",
                          unit: "kWh",
                          change: "+8%",
                          positive: false,
                        },
                        {
                          title: "Waste Recycled",
                          value: "68",
                          unit: "%",
                          change: "+12%",
                          positive: true,
                        },
                        {
                          title: "Water Usage",
                          value: "1,250",
                          unit: "gallons",
                          change: "-3%",
                          positive: true,
                        },
                        {
                          title: "Renewable Energy",
                          value: "25",
                          unit: "%",
                          change: "+10%",
                          positive: true,
                        },
                        {
                          title: "Paper Usage",
                          value: "120",
                          unit: "reams",
                          change: "-15%",
                          positive: true,
                        },
                      ].map((metric, index) => (
                        <Card key={index} className="border-none shadow-none">
                          <CardHeader className="p-0 pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#14ae5c]">{metric.value}</span>
                              <span className="text-sm text-muted-foreground">{metric.unit}</span>
                            </div>
                            <div
                              className={`flex items-center mt-1 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}
                            >
                              {metric.positive ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {metric.change} from last period
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Environmental Data Submitted</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't submitted any environmental data yet. Start tracking your environmental impact by
                      reporting your first data set.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/report">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit Environmental Data
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="SOCIAL" className="space-y-6">
              {dataStatus.SOCIAL ? (
                <Card>
                  <CardHeader className="bg-[rgba(128,0,128,0.1)]">
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-[#8000ff]" />
                      <CardTitle>Social Performance</CardTitle>
                    </div>
                    <CardDescription>Measuring your impact on people and communities</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        {
                          title: "Gender Diversity",
                          value: "42",
                          unit: "% women",
                          change: "+7%",
                          positive: true,
                        },
                        {
                          title: "Employee Turnover",
                          value: "18",
                          unit: "%",
                          change: "+3%",
                          positive: false,
                        },
                        {
                          title: "Training Hours",
                          value: "24",
                          unit: "hrs/employee",
                          change: "+15%",
                          positive: true,
                        },
                        {
                          title: "Pay Equity Ratio",
                          value: "0.94",
                          unit: "women:men",
                          change: "+0.02",
                          positive: true,
                        },
                        {
                          title: "Community Investment",
                          value: "2.5",
                          unit: "% of profit",
                          change: "+0.5%",
                          positive: true,
                        },
                        {
                          title: "Employee Satisfaction",
                          value: "4.2",
                          unit: "/5",
                          change: "+0.3",
                          positive: true,
                        },
                      ].map((metric, index) => (
                        <Card key={index} className="border-none shadow-none">
                          <CardHeader className="p-0 pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#8000ff]">{metric.value}</span>
                              <span className="text-sm text-muted-foreground">{metric.unit}</span>
                            </div>
                            <div
                              className={`flex items-center mt-1 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}
                            >
                              {metric.positive ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {metric.change} from last period
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Social Data Submitted</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't submitted any social data yet. Start tracking your social impact by reporting your
                      first data set.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/report">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit Social Data
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="GOVERNANCE" className="space-y-6">
              {dataStatus.GOVERNANCE ? (
                <Card>
                  <CardHeader className="bg-[rgba(255,140,0,0.1)]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-[#ff8c00]" />
                      <CardTitle>Governance Performance</CardTitle>
                    </div>
                    <CardDescription>Evaluating your business ethics and leadership practices</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        {
                          title: "Board Diversity",
                          value: "35",
                          unit: "%",
                          change: "+10%",
                          positive: true,
                        },
                        {
                          title: "Ethics Violations",
                          value: "0",
                          unit: "incidents",
                          change: "0",
                          positive: true,
                        },
                        {
                          title: "Policy Coverage",
                          value: "85",
                          unit: "%",
                          change: "+5%",
                          positive: true,
                        },
                        {
                          title: "Data Breaches",
                          value: "0",
                          unit: "incidents",
                          change: "0",
                          positive: true,
                        },
                        {
                          title: "Compliance Score",
                          value: "92",
                          unit: "%",
                          change: "+4%",
                          positive: true,
                        },
                        {
                          title: "Risk Assessment",
                          value: "Quarterly",
                          unit: "",
                          change: "No change",
                          positive: true,
                        },
                      ].map((metric, index) => (
                        <Card key={index} className="border-none shadow-none">
                          <CardHeader className="p-0 pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#ff8c00]">{metric.value}</span>
                              <span className="text-sm text-muted-foreground">{metric.unit}</span>
                            </div>
                            <div
                              className={`flex items-center mt-1 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}
                            >
                              {metric.positive ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {metric.change} from last period
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Governance Data Submitted</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't submitted any governance data yet. Start tracking your governance practices by
                      reporting your first data set.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/report">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit Governance Data
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

