import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Flag } from "lucide-react"
import { ReportActions } from "./ReportActions"

export const metadata = { title: "Prijave — Admin" }

type ReportWithUsers = {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  details: string | null
  status: "pending" | "reviewed" | "resolved"
  created_at: string
  reporter: { full_name: string | null; email: string } | null
  reported: { full_name: string | null; email: string } | null
}

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: reportsData } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(full_name, email),
      reported:profiles!reports_reported_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })
  const reports = (reportsData ?? []) as ReportWithUsers[]

  const statusColor: Record<string, "default" | "secondary" | "outline"> = {
    pending: "default",
    reviewed: "secondary",
    resolved: "outline",
  }

  const statusLabel: Record<string, string> = {
    pending: "Na čekanju",
    reviewed: "Pregledano",
    resolved: "Rešeno",
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
        Prijave ({reports?.length ?? 0})
      </h1>
      {!reports?.length ? (
        <div className="text-center py-12 text-stone-400">
          <Flag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nema prijava</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const reporter = report.reporter
            const reported = report.reported
            return (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColor[report.status]}>{statusLabel[report.status]}</Badge>
                        <span className="text-xs text-stone-400">{formatDate(report.created_at)}</span>
                      </div>
                      <p className="text-sm">
                        <span className="text-stone-400">Prijavio:</span>{" "}
                        <span className="font-medium">{reporter?.full_name ?? reporter?.email}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-stone-400">Prijavljeni:</span>{" "}
                        <span className="font-medium text-red-600">{reported?.full_name ?? reported?.email}</span>
                      </p>
                      <p className="text-sm"><span className="text-stone-400">Razlog:</span> {report.reason}</p>
                      {report.details && <p className="text-sm text-stone-500">{report.details}</p>}
                    </div>
                    <ReportActions reportId={report.id} currentStatus={report.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
