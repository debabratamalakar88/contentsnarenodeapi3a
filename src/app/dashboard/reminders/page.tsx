import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BellRing } from "lucide-react"

export default function RemindersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-muted-foreground">
          Manage your automated reminders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The reminders feature is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-96">
            <BellRing className="h-24 w-24 text-muted-foreground" />
            <p className="text-muted-foreground">Here you will be able to manage automatic reminder schedules for your requests.</p>
        </CardContent>
      </Card>
    </div>
  )
}
