import { format, parseISO } from "date-fns"

export function formatDateRange(startDate: string, endDate: string): string {
  const parsedStartDate = parseISO(startDate)
  const parsedEndDate = parseISO(endDate)

  const formattedStartDate = format(parsedStartDate, "dd-MM-yyyy")
  const formattedEndDate = format(parsedEndDate, "dd-MM-yyyy")

  return `${formattedStartDate} ~ ${formattedEndDate}`
}

export function formatDate(date: string): string {
  const parsedDate = parseISO(date)
  const formattedDate = format(parsedDate, "dd-MM-yyyy")

  return formattedDate
}

export function formatPoints(num: number): string {
  const rounded = Math.round(num * 100) / 100
  return rounded === Math.floor(rounded)
    ? `${Math.floor(rounded)}`
    : rounded.toFixed(2)
}

export function detectType(fileName: string): string | undefined {
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "sh":
      return "shell"
    case "py":
      return "python"
    case "r":
      return "r"
    case "png":
      return "png"
    case "md":
      return "md"
    default:
      return undefined
  }
}

export function createDownloadHref(file: PersistentResultFileProps): string {
  if (file.binary) {
    return `data:${file.mimeType};base64,${file.contentBinary}`
  } else {
    return `data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`
  }
}

export const formatSeconds = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)

  const padded = (num: number) => String(num).padStart(2, "0")

  return `${padded(minutes)}:${padded(seconds)}`
}
