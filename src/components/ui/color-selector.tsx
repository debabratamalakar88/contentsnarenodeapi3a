
'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export const colorPalette = [
    '#0ea5e9', '#f97316', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'
];

interface ColorSelectorProps {
  value?: string
  onChange?: (value: string) => void
}

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  const [open, setOpen] = React.useState(false)
  
  const handleSelect = (color: string) => {
    onChange?.(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: value }} />
            {value ? value : 'Select a color'}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="grid grid-cols-4 gap-2 p-2">
          {colorPalette.map((color) => (
            <button
              key={color}
              className="relative flex items-center justify-center p-2 h-10 w-10 rounded-md cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => handleSelect(color)}
            >
              {value === color && <Check className="h-5 w-5 text-white" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
