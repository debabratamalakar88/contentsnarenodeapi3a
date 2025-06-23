import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FileText, GripVertical, Plus, Trash2 } from "lucide-react"

export default function NewRequestPage() {
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Request</CardTitle>
            <CardDescription>
              Customize the request details, add pages and questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="title">Request Title</Label>
                <Input
                  id="title"
                  type="text"
                  className="w-full"
                  defaultValue="New Client Onboarding Materials"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue="Please provide all the necessary documents and information to get you set up in our system."
                  className="min-h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mockup of a drag-and-drop builder */}
        <Card>
          <CardHeader>
            <CardTitle>Request Builder</CardTitle>
            <CardDescription>Drag and drop to reorder pages and questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Page 1 */}
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <h3 className="font-semibold">Page 1: Company Information</h3>
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Separator />
              {/* Question 1 */}
              <div className="flex items-center gap-2 pl-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <Label>Company Name</Label>
                  <Input type="text" placeholder="Short text answer" disabled />
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
              {/* Question 2 */}
              <div className="flex items-center gap-2 pl-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <Label>Business Address</Label>
                  <Textarea placeholder="Long text answer" disabled />
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" size="sm" className="ml-4"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
            </div>
            
            {/* Page 2 */}
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <h3 className="font-semibold">Page 2: Document Uploads</h3>
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Separator />
               {/* Question 3 */}
               <div className="flex items-center gap-2 pl-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <Label>Business License</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground items-center">File Upload</div>
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
               <Button variant="outline" size="sm" className="ml-4"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
            </div>

            <Button variant="secondary" className="w-full"><Plus className="h-4 w-4 mr-2" />Add Page</Button>

          </CardContent>
        </Card>
      </div>

      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Request Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button>Publish Immediately</Button>
            <Button variant="secondary">Schedule Publish</Button>
            <Button variant="outline">Save as Draft</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assign Clients</CardTitle>
          </CardHeader>
          <CardContent>
             {/* This would be a multi-select component */}
             <Label>Select one or more clients</Label>
             <Input placeholder="Search for clients..." />
             <div className="mt-2 text-sm text-muted-foreground">Assigned: Acme Inc.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
            <CardDescription>Start from a template to save time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0">
                <FileText className="mr-2 h-4 w-4" />
                Client Onboarding Questionnaire
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Choose a Different Template</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
