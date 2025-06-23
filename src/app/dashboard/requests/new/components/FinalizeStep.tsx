'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export default function FinalizeStep() {
    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 max-w-2xl mx-auto animate-in fade-in-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Finalize & Send</h2>
                <p className="text-muted-foreground">Assign clients, set a due date, and send your request.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assign Clients</CardTitle>
                    <CardDescription>Select one or more clients to send this request to.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Input placeholder="Search for clients by name or email..." />
                   <div className="mt-4 text-sm text-muted-foreground">Assigned (1): <strong>Acme Inc.</strong> (contact@acme.com)</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Due Date</CardTitle>
                    <CardDescription>Set a deadline for your clients to complete this request.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Input type="date" className="w-full max-w-sm" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Reminders</CardTitle>
                    <CardDescription>Configure automatic reminders for your clients.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reminders" defaultChecked />
                    <label
                      htmlFor="reminders"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send automatic reminders
                    </label>
                  </div>
                   <div className="text-sm text-muted-foreground">
                        Reminders will be sent 3 days before the due date, on the due date, and 3 days after. You can configure this in settings.
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="link" className="p-0">Configure reminder schedule</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
