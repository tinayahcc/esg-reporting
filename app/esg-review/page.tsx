"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, Users, Building2, Clock, CheckCircle, XCircle, AlertCircle, Search, Download } from "lucide-react"
import { esg } from "@/lib/api-client"

// Submission type
type Submission = {
  id: string
  type: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE"
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  submittedAt: string
  reviewedAt: string | null
  reviewerId: string | null
  reviewer: { name: string } | null
  rejectionReason: string | null
  companyId: string
  company: { name: string }
}

export default function ESGReviewPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("PENDING")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Check if user is admin
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session?.user?.role !== "esg_team") {
        // Redirect non-admin users
        router.push("/dashboard")
      } else {
        loadSubmissions()
      }
    }
  }, [sessionStatus, activeTab])

  // Load submissions from API  
  const loadSubmissions = async () => {
    setIsLoading(true)
    setError("")

    try {
      const data = await esg.getSubmissions()
      setSubmissions(data)

      // Filter submissions based on active tab
      filterSubmissions(data, activeTab, searchTerm, selectedType)
    } catch (error: any) {
      setError(error.message || "Failed to load submissions")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter submissions based on status, search term, and type
  const filterSubmissions = (subs: Submission[], status: string, search: string, type: string | null) => {
    let filtered = subs

    // Filter by status
    if (status !== "ALL") {
      filtered = filtered.filter((sub) => sub.status === status)
    }

    // Filter by search term (company name)
    if (search) {
      filtered = filtered.filter((sub) => sub.company.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Filter by ESG type
    if (type) {
      filtered = filtered.filter((sub) => sub.type === type)
    }

    setFilteredSubmissions(filtered)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    filterSubmissions(submissions, value, searchTerm, selectedType)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    filterSubmissions(submissions, activeTab, value, selectedType)
  }

  // Handle type filter
  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type)
    filterSubmissions(submissions, activeTab, searchTerm, type)
  }

  // Handle admin review action
  const handleReviewAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setIsLoading(true)
    setError("")

    try {
      let rejectionReason = null

      if (action === "REJECTED") {
        rejectionReason = prompt("Please provide a reason for rejection:")
        if (!rejectionReason) {
          setIsLoading(false)
          return // Cancelled
        }
      }

      await esg.reviewSubmission({
        submissionId: id,
        status: action,
        rejectionReason,
      })

      // Reload submissions
      await loadSubmissions()
    } catch (error: any) {
      setError(error.message || `Failed to ${action.toLowerCase()} submission`)
    } finally {
      setIsLoading(false)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Draft
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending Review
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  // Type badge component
  const TypeBadge = ({ type }: { type: string }) => {
    switch (type) {
      case "ENVIRONMENTAL":
        return (
          <div className="flex items-center gap-1">
            <Leaf className="h-4 w-4 text-[#14ae5c]" />
            <span className="text-[#14ae5c]">Environmental</span>
          </div>
        )
      case "SOCIAL":
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-[#8000ff]" />
            <span className="text-[#8000ff]">Social</span>
          </div>
        )
      case "GOVERNANCE":
        return (
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 text-[#ff8c00]" />
            <span className="text-[#ff8c00]">Governance</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ESG Review Dashboard</h1>
              <p className="text-muted-foreground">Review and approve ESG submissions from companies</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submission Filters</CardTitle>
              <CardDescription>Filter submissions by company name and ESG type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="mb-2 block">
                    Search by Company
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search company name..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Filter by Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedType === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTypeFilter(null)}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedType === "ENVIRONMENTAL" ? "default" : "outline"}
                      size="sm"
                      className="text-[#14ae5c]"
                      onClick={() => handleTypeFilter("ENVIRONMENTAL")}
                    >
                      <Leaf className="h-4 w-4 mr-1" />
                      Environmental
                    </Button>
                    <Button
                      variant={selectedType === "SOCIAL" ? "default" : "outline"}
                      size="sm"
                      className="text-[#8000ff]"
                      onClick={() => handleTypeFilter("SOCIAL")}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Social
                    </Button>
                    <Button
                      variant={selectedType === "GOVERNANCE" ? "default" : "outline"}
                      size="sm"
                      className="text-[#ff8c00]"
                      onClick={() => handleTypeFilter("GOVERNANCE")}
                    >
                      <Building2 className="h-4 w-4 mr-1" />
                      Governance
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="PENDING" className="mb-8" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="PENDING">Pending Review</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="ALL">All Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === "PENDING" && "Submissions Pending Review"}
                    {activeTab === "APPROVED" && "Approved Submissions"}
                    {activeTab === "REJECTED" && "Rejected Submissions"}
                    {activeTab === "ALL" && "All Submissions"}
                  </CardTitle>
                  <CardDescription>
                    {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-6">Loading submissions...</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md gap-4"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {submission.status === "PENDING" && <Clock className="h-5 w-5 text-yellow-500" />}
                                {submission.status === "APPROVED" && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {submission.status === "REJECTED" && <XCircle className="h-5 w-5 text-red-500" />}
                                <h3 className="font-medium">{submission.company.name}</h3>
                                <StatusBadge status={submission.status} />
                              </div>
                              <div className="flex items-center gap-4">
                                <TypeBadge type={submission.type} />
                                <span className="text-sm text-muted-foreground">
                                  Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                </span>
                                {submission.reviewedAt && (
                                  <span className="text-sm text-muted-foreground">
                                    Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {submission.status === "REJECTED" && submission.rejectionReason && (
                                <div className="text-sm text-red-600 mt-1">Reason: {submission.rejectionReason}</div>
                              )}
                            </div>

                            <div className="flex gap-2 self-end md:self-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // View submission details (in a real app, this would open a modal or navigate to a details page)
                                  alert(`View details for submission ${submission.id}`)
                                }}
                              >
                                View Details
                              </Button>

                              {submission.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                    onClick={() => handleReviewAction(submission.id, "APPROVED")}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => handleReviewAction(submission.id, "REJECTED")}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No submissions found matching your filters.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

