import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "~/lib/utils"
import { buttonVariants } from "~/components/ui/button"

interface CalendarProps {
  className?: string
  selected: Date | undefined
  onChange: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
  placeholderText?: string
  dateFormat?: string
}

function Calendar({
  className,
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText = "Select date",
  dateFormat = "yyyy-MM-dd",
}: CalendarProps) {
  // Custom navigation for DayPicker
  const customComponents = {
    // Only override the navigation buttons if you want custom icons
    // Otherwise, DayPicker uses default chevrons
    // You can style them with CSS if needed
  };

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onChange}
      fromDate={minDate}
      toDate={maxDate}
      className={cn("p-3 border rounded-md", className)}
      // components={customComponents} // Uncomment if you add custom navigation
    />
  )
}

export { Calendar }
