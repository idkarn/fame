import { DashboardHeader } from '#/components/dashboard-header'
import { Separator } from '#/components/ui/separator'
import { TooltipProvider } from '#/components/ui/tooltip'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <TooltipProvider>
      <div className="py-4 mx-auto max-w-7xl">
        <DashboardHeader />
        <Separator className="my-4" />
        <main className="">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
