import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreVertical, PlusCircle } from "lucide-react"
import Link from "next/link"

const templates = [
  {
    title: "Client Onboarding Questionnaire",
    category: "Onboarding",
    pages: 3,
    questions: 25,
  },
  {
    title: "Website Design Brief",
    category: "Web Design",
    pages: 5,
    questions: 42,
  },
  {
    title: "Marketing Campaign Details",
    category: "Marketing",
    pages: 2,
    questions: 18,
  },
  {
    title: "Case Study & Testimonial",
    category: "Content",
    pages: 2,
    questions: 15,
  },
  {
    title: "Podcast Guest Intake Form",
    category: "Media",
    pages: 1,
    questions: 12,
  },
  {
    title: "Standard Service Agreement",
    category: "Legal",
    pages: 4,
    questions: 10,
  },
]

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your reusable request templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex-grow">
                <CardTitle className="text-base font-semibold leading-tight">{template.title}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Preview</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 opacity-10" />
                </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-between">
              <span>{template.pages} Pages</span>
              <span>{template.questions} Questions</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
