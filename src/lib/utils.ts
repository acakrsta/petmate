import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "Upravo"
  if (mins < 60) return `pre ${mins}min`
  if (hours < 24) return `pre ${hours}h`
  if (days < 7) return `pre ${days}d`
  return formatDate(date)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const SPECIES_OPTIONS = [
  { value: "dog", label: "Pas" },
  { value: "cat", label: "Mačka" },
  { value: "rabbit", label: "Zec" },
  { value: "bird", label: "Ptica" },
  { value: "hamster", label: "Hrčak" },
  { value: "other", label: "Ostalo" },
]

export const SIZE_OPTIONS = [
  { value: "small", label: "Mali (do 10kg)" },
  { value: "medium", label: "Srednji (10–25kg)" },
  { value: "large", label: "Veliki (25–45kg)" },
  { value: "xlarge", label: "Extra veliki (45kg+)" },
]

export const PURPOSE_OPTIONS = [
  { value: "walk", label: "Šetnja" },
  { value: "breeding", label: "Parenje" },
  { value: "socializing", label: "Druženje" },
  { value: "any", label: "Sve" },
]

export const INTEREST_OPTIONS = [
  { value: "walks", label: "Voli šetnje" },
  { value: "socializing", label: "Druži se sa psima" },
  { value: "water", label: "Voli vodu" },
  { value: "fetch", label: "Donošenje lopte" },
  { value: "cuddles", label: "Mazenje" },
  { value: "indoor", label: "Kućni ljubimac" },
]

export const PRODUCT_TYPE_OPTIONS = [
  { value: "food", label: "Hrana" },
  { value: "equipment", label: "Oprema" },
  { value: "toys", label: "Igračke" },
  { value: "grooming", label: "Grooming" },
]

export const FREE_DAILY_SWIPE_LIMIT = 20
