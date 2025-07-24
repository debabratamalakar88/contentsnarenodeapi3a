
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool } from "lucide-react";

export default function BuilderPlaceholderPage() {
    return (
        <div className="p-6 h-full flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                       <PenTool className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Builder Coming Soon</CardTitle>
                    <CardDescription>
                       This is where you will add and configure questions for your template. This functionality is under construction.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
