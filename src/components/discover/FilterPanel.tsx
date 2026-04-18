"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { PURPOSE_OPTIONS } from "@/lib/utils"

interface Props {
  purpose: string
  onPurposeChange: (v: string) => void
  onClose: () => void
}

export function FilterPanel({ purpose, onPurposeChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white dark:bg-stone-900 rounded-t-2xl p-6 space-y-5 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filteri</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-stone-400" /></button>
        </div>

        <div>
          <Label className="mb-2 block">Svrha uparivanja</Label>
          <Select value={purpose} onValueChange={onPurposeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PURPOSE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={onClose}>Primeni filtere</Button>
      </div>
    </div>
  )
}
