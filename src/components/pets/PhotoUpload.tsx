"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Upload, X, Star } from "lucide-react"
import type { PetPhoto } from "@/types/database"

interface Props {
  petId: string
  existingPhotos: PetPhoto[]
}

export function PhotoUpload({ petId, existingPhotos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > 6) {
      alert("Maksimalno 6 slika")
      return
    }
    setUploading(true)
    const supabase = createClient()

    for (const file of acceptedFiles) {
      const ext = file.name.split(".").pop()
      const path = `${petId}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from("pet-photos").upload(path, file, { upsert: true })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(data.path)
        const isPrimary = photos.length === 0
        const { data: newPhoto } = await supabase
          .from("pet_photos")
          .insert({ pet_id: petId, url: publicUrl, is_primary: isPrimary, position: photos.length })
          .select()
          .single()
        if (newPhoto) setPhotos((p) => [...p, newPhoto])
      }
    }
    setUploading(false)
  }, [petId, photos.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 6 - photos.length,
    disabled: uploading || photos.length >= 6,
  })

  async function deletePhoto(photoId: string) {
    const supabase = createClient()
    await supabase.from("pet_photos").delete().eq("id", photoId)
    setPhotos((p) => p.filter((ph) => ph.id !== photoId))
  }

  async function setPrimary(photoId: string) {
    const supabase = createClient()
    await supabase.from("pet_photos").update({ is_primary: false }).eq("pet_id", petId)
    await supabase.from("pet_photos").update({ is_primary: true }).eq("id", photoId)
    setPhotos((p) => p.map((ph) => ({ ...ph, is_primary: ph.id === photoId })))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
        Fotografije ({photos.length}/6)
      </p>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => setPrimary(photo.id)} className="p-1 rounded-full bg-white/20 hover:bg-white/40">
                  <Star className={`h-3 w-3 ${photo.is_primary ? "text-amber-400 fill-amber-400" : "text-white"}`} />
                </button>
                <button onClick={() => deletePhoto(photo.id)} className="p-1 rounded-full bg-white/20 hover:bg-red-400">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
              {photo.is_primary && (
                <div className="absolute top-1 left-1 bg-amber-400 rounded-full p-0.5">
                  <Star className="h-2 w-2 text-white fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length < 6 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-amber-400 bg-amber-50" : "border-stone-300 hover:border-amber-300 hover:bg-amber-50/50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 text-stone-400 mx-auto mb-1" />
          <p className="text-xs text-stone-500">
            {uploading ? "Uploading..." : isDragActive ? "Otpustite slike" : "Prevucite slike ili kliknite"}
          </p>
        </div>
      )}
    </div>
  )
}
