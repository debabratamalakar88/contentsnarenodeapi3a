
'use client';

import { useState } from 'react';
import CalendarView from './CalendarView';

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full bg-background">
            <CalendarView />
        </div>
    );
}
