import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Flag } from "lucide-react"
import { ReportActions } from "./ReportActions"
import { ReportStatusFilter } from "./ReportStatusFilter"
import { AdminPagination } from "../AdminPagination"
import { Suspense } from "react"

export const metadata = { title: "Prijave — Admin" }

const PAGE_SIZE = 20

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

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const supabase = await createClient()

  const [allCountsRes, filteredRes] = await Promise.all([
    supabase.from("reports").select("status"),
    (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase.from("reports") as any)
        .select(`*, reporter:profiles!reports_reporter_id_fkey(full_name, email), reported:profiles!reports_reported_id_fkey(full_name, email)`, { count: "exact" })
        .order("created_at", { ascending: false })
      if (status && status !== "all") q = q.eq("status", status)
      const from = (page - 1) * PAGE_SIZE
      return q.range(from, from + PAGE_SIZE - 1)
    })(),
  ])

  const allReports = (allCountsRes.data ?? []) as { status: string }[]
  const pendingCount = allReports.filter((r) => r.status === "pending").length
  const reviewedCount = allReports.filter((r) => r.status === "reviewed").length
  const resolvedCount = allReports.filter((r) => r.status === "resolved").length

  const reports = (filteredRes.data ?? []) as ReportWithUsers[]
  const total = filteredRes.count ?? 0

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Prijave</h1>
        <p className="text-sm text-stone-500 mt-1">{allReports.length} ukupno</p>
      </div>

      <Suspense>
        <ReportStatusFilter
          current={status ?? "all"}
          counts={{ all: allReports.length, pending: pendingCount, reviewed: reviewedCount, resolved: resolvedCount }}
        />
      </Suspense>

      {!reports.length ? (
        <div className="text-center py-16 text-stone-400">
          <Flag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nema prijava za izabrani filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const reporter = report.reporter
            const reported = report.reported
            return (
              <Card key={report.id} className="border-stone-200 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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
                      {report.details && <p className="text-sm text-stone-500 truncate">{report.details}</p>}
                    </div>
                    <ReportActions reportId={report.id} currentStatus={report.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Suspense>
        <AdminPagination page={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
