"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface MonthData {
  label: string
  count: number
}

interface Props {
  usersPerMonth: MonthData[]
  matchesPerMonth: MonthData[]
}

export function AdminGrowthChart({ usersPerMonth, matchesPerMonth }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border-stone-200 dark:border-stone-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Novi korisnici
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={usersPerMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a8a29e" }} />
              <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
                formatter={(v) => [v, "Korisnici"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-stone-200 dark:border-stone-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Novi mečevi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={matchesPerMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a8a29e" }} />
              <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
                formatter={(v) => [v, "Mečevi"]}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
