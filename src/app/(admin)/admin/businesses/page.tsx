import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessApproveButton } from "./BusinessApproveButton"
import type { Veterinarian, PetShop } from "@/types/database"

export const metadata = { title: "Poslovni profili — Admin" }

export default async function AdminBusinessesPage() {
  const supabase = await createClient()

  const [vetsRes, shopsRes] = await Promise.all([
    supabase.from("veterinarians").select("*").order("created_at", { ascending: false }),
    supabase.from("pet_shops").select("*").order("created_at", { ascending: false }),
  ])

  const vets = (vetsRes.data ?? []) as Veterinarian[]
  const shops = (shopsRes.data ?? []) as PetShop[]

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">Poslovni profili</h1>

      <Tabs defaultValue="vets">
        <TabsList className="mb-4">
          <TabsTrigger value="vets">Veterinari ({vets?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="shops">Pet shopovi ({shops?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="vets">
          <div className="space-y-3">
            {vets.map((vet) => (
              <Card key={vet.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{vet.name}</p>
                      {vet.is_approved ? (
                        <Badge variant="secondary">Odobreno</Badge>
                      ) : (
                        <Badge variant="default">Na čekanju</Badge>
                      )}
                    </div>
                    <p className="text-sm text-stone-500">{vet.address}, {vet.city}</p>
                    {vet.phone && <p className="text-sm text-stone-400">{vet.phone}</p>}
                    {vet.specializations?.length && (
                      <p className="text-xs text-stone-400 mt-1">{vet.specializations.join(", ")}</p>
                    )}
                  </div>
                  <BusinessApproveButton
                    id={vet.id}
                    table="veterinarians"
                    isApproved={vet.is_approved}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shops">
          <div className="space-y-3">
            {shops.map((shop) => (
              <Card key={shop.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{shop.name}</p>
                      {shop.is_approved ? (
                        <Badge variant="secondary">Odobreno</Badge>
                      ) : (
                        <Badge variant="default">Na čekanju</Badge>
                      )}
                    </div>
                    <p className="text-sm text-stone-500">{shop.address}, {shop.city}</p>
                    {shop.product_types?.length && (
                      <p className="text-xs text-stone-400 mt-1">{shop.product_types.join(", ")}</p>
                    )}
                  </div>
                  <BusinessApproveButton
                    id={shop.id}
                    table="pet_shops"
                    isApproved={shop.is_approved}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
