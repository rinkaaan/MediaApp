import { format, isToday, isYesterday, parseISO } from "date-fns"
import { v4 } from "uuid"
import { ApiError } from "../../openapi-client"

export function formatDate(inputDate?: string) {
  if (!inputDate) return null
  const parsedDate = parseISO(inputDate)

  if (isToday(parsedDate)) {
    return format(parsedDate, "'Today at' h:mm a")
  } else if (isYesterday(parsedDate)) {
    return format(parsedDate, "'Yesterday at' h:mm a")
  } else {
    return format(parsedDate, "MMM d, yyyy 'at' h:mm a")
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function uuid() {
  return v4()
}

export function getApiErrorMessage(error: any) {
  const e = error as ApiError
  return e.body?.message || "An unexpected error occurred"
}

export type AsyncStatus = "pending" | "fulfilled" | "rejected"
