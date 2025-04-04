import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipHelper } from "@/components/tooltip-helper"
import { Calendar, Mail, Video, MapPin, Info, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ConsultationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
              <Link href="/services">
                <ChevronLeft className="h-4 w-4" />
                Back to Services
              </Link>
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule a Consultation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get expert help with your ESG reporting challenges or data entry issues
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Consultation Request Form</CardTitle>
              <CardDescription>
                Please provide details about your issue and preferred consultation method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Acme Inc." required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">Describe Your Issue</Label>
                  <Textarea
                    id="issue"
                    placeholder="Please describe the error you're encountering or the assistance you need..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Consultation Method</Label>
                  <RadioGroup defaultValue="email" className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="email" id="email-option" />
                      <Label htmlFor="email-option" className="flex items-center gap-2 cursor-pointer">
                        <Mail className="h-4 w-4" />
                        <span>Email Support</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="zoom" id="zoom-option" />
                      <Label htmlFor="zoom-option" className="flex items-center gap-2 cursor-pointer">
                        <Video className="h-4 w-4" />
                        <span>Zoom Meeting</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="onsite" id="onsite-option" />
                      <Label htmlFor="onsite-option" className="flex items-center gap-2 cursor-pointer">
                        <MapPin className="h-4 w-4" />
                        <span>Onsite Visit</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Tabs defaultValue="zoom" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="zoom">Zoom/Onsite Scheduling</TabsTrigger>
                    <TabsTrigger value="email">Email Preferences</TabsTrigger>
                  </TabsList>
                  <TabsContent value="zoom" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="date">Preferred Date</Label>
                          <TooltipHelper text="Please select a date at least 2 business days in advance">
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipHelper>
                        </div>
                        <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time</Label>
                        <select
                          id="time"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a time slot</option>
                          <option value="9:00">9:00 AM - 10:00 AM</option>
                          <option value="10:00">10:00 AM - 11:00 AM</option>
                          <option value="11:00">11:00 AM - 12:00 PM</option>
                          <option value="13:00">1:00 PM - 2:00 PM</option>
                          <option value="14:00">2:00 PM - 3:00 PM</option>
                          <option value="15:00">3:00 PM - 4:00 PM</option>
                          <option value="16:00">4:00 PM - 5:00 PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (for Onsite visits only)</Label>
                      <Input id="location" placeholder="Company address or meeting location" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendees">Number of Attendees</Label>
                      <Input id="attendees" type="number" min="1" placeholder="1" />
                    </div>
                  </TabsContent>
                  <TabsContent value="email" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="response-time">Expected Response Time</Label>
                      <select
                        id="response-time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="standard">Standard (24-48 hours)</option>
                        <option value="urgent">Urgent (within 24 hours)</option>
                        <option value="priority">Priority (within 12 hours)</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="follow-up-call" className="h-4 w-4 rounded border-gray-300" />
                      <Label htmlFor="follow-up-call">
                        Request a follow-up phone call after initial email response
                      </Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="additional">Additional Information</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other details that might help us prepare for your consultation..."
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

