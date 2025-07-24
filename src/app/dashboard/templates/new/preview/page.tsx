
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

export default function PreviewPlaceholderPage() {
    return (
        <div className="p-6 h-full flex flex-col items-center justify-center">
             <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                       <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Preview Coming Soon</CardTitle>
                    <CardDescription>
                       This is where you will be able to preview your template before publishing. This functionality is under construction.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
