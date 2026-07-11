import { DashboardCard } from '#/components/dashboard-card'
import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/dashboard/games/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <DashboardCard
        value="3"
        caption="asadasd"
        title="name"
        icon={<TrendingUp />}
      />
      <DashboardCard
        value="3"
        caption="asadasd"
        title="name"
        icon={<TrendingUp />}
      />
      <DashboardCard
        value="3"
        caption="asadasd"
        title="name"
        icon={<TrendingUp />}
      />
    </div>
  )
}
