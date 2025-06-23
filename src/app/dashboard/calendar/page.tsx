import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View your upcoming deadlines and schedule.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The calendar feature is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-96">
            <CalendarIcon className="h-24 w-24 text-muted-foreground" />
            <p className="text-muted-foreground">Check back later to see your scheduled content requests and deadlines.</p>
        </CardContent>
      </Card>
    </div>
  )
}
