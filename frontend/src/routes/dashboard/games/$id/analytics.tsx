import { getGame } from '#/api/games'
import { getDailyPlayers } from '#/api/stats'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '#/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import React, { useMemo } from 'react'
import { CartesianGrid, XAxis, Line, LineChart } from 'recharts'

export const Route = createFileRoute('/dashboard/games/$id/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ChartLineInteractive />
    </div>
  )
}

export const description = 'An interactive line chart'

const chartConfig = {
  views: {
    label: 'Daily Players',
  },
  total: {
    label: 'Total',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ChartLineInteractive() {
  const gameId = useParams({ from: '/dashboard/games/$id/analytics' }).id

  const {
    data: {
      boards: [{ id: boarId, name: boardName }],
    },
  } = useSuspenseQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId),
  })

  const { data: rawDailyPlayers } = useSuspenseQuery({
    queryKey: ['daily-players', boarId],
    queryFn: () => getDailyPlayers(boarId),
  })

  const chartData = useMemo(() => {
    const dates = []
    const today = new Date()
    const startDate = new Date()
    startDate.setMonth(today.getMonth() - 3)

    // 1. Convert your existing array into a Map for O(1) fast lookups
    // Key format: "YYYY-MM-DD"
    const dataMap = new Map(
      rawDailyPlayers.map((item) => {
        // Ensure we extract just the date part if it's a full ISO string
        const dateKey = new Date(item.date).toISOString().split('T')[0]
        return [dateKey, item.total]
      }),
    )

    // 2. Generate all dates and seamlessly integrate the data
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]

      // Check if we have existing data for this day
      if (dataMap.has(dateKey)) {
        // Merge the existing object into our timeline array
        dates.push({
          date: dateKey, // normalizes the date format
          total: dataMap.get(dateKey),
        })
      } else {
        // Fallback placeholder object for empty days
        dates.push({
          date: dateKey,
          total: 0,
        })
      }
    }

    return dates as {
      total: number
      date: string
    }[]
  }, [rawDailyPlayers])

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('total')

  const total = React.useMemo(
    () => ({
      total: chartData.reduce((acc, curr) => acc + curr.total, 0),
    }),
    [],
  )

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Daily Players</CardTitle>
          <CardDescription>
            Showing daily players for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {['total'].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {boardName}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
