import type { ReactNode } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

interface DashboardCardProps {
  title: string
  caption: string
  value: string
  icon: ReactNode
}

export function DashboardCard({
  title,
  caption,
  value,
  icon,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h4 className="uppercase">{title}</h4>
        </CardTitle>
        <CardAction className="border aspect-square p-1">{icon}</CardAction>
      </CardHeader>
      <CardContent>
        <p className="font-black text-4xl">{value}</p>
      </CardContent>
      <CardFooter>
        <small>{caption}</small>
      </CardFooter>
    </Card>
  )
}
