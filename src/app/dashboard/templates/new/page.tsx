import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical, Plus, Trash2, Text, Heading2, CheckSquare, List, UploadCloud, Calendar } from "lucide-react"

const fieldTypes = [
    { icon: Text, label: "Text" },
    { icon: Heading2, label: "Textarea" },
    { icon: CheckSquare, label: "Checkbox" },
    { icon: List, label: "Dropdown" },
    { icon: UploadCloud, label: "File Upload" },
    { icon: Calendar, label: "Date" },
]

export default function NewTemplatePage() {
  return (
    <div className="grid flex-1 items-start gap-4 p-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
            <CardDescription>
              Build a reusable template for your future requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                type="text"
                className="w-full"
                placeholder="e.g., Website Discovery Questionnaire"
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              <h3 className="font-semibold">Page 1: Basic Information</h3>
            </div>
            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Separator />
          
          <div className="flex items-center gap-2 pl-4">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <div className="flex-1 p-4 border border-dashed rounded-lg">
                <Label>Your Name</Label>
                <Input type="text" placeholder="Short text field" disabled />
            </div>
            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center gap-2 pl-4">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <div className="flex-1 p-4 border border-dashed rounded-lg">
                <Label>About your project</Label>
                <Textarea placeholder="Long text field" disabled />
            </div>
            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center gap-2 pl-4">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <div className="flex-1 p-4 border border-dashed rounded-lg space-y-2">
                <Label>Services Needed</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms1" disabled />
                    <label htmlFor="terms1" className="text-sm font-medium leading-none">Web Design</label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="terms2" disabled />
                    <label htmlFor="terms2" className="text-sm font-medium leading-none">SEO</label>
                </div>
            </div>
            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" size="sm" className="ml-4"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
        </div>
        <Button variant="secondary" className="w-full"><Plus className="h-4 w-4 mr-2" />Add Page</Button>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle>Template Fields</CardTitle>
                <CardDescription>Drag fields onto a page to add them.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {fieldTypes.map(field => (
                    <div key={field.label} className="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-move hover:bg-muted">
                        <field.icon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm">{field.label}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="web-design">Web Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <Button className="w-full">Save Template</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
