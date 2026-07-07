import { DashboardHeader } from '#/components/dashboard-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
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
        <main className="mt-4">
          <nav>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">this is overview</TabsContent>
              <TabsContent value="analytics">this is analytics</TabsContent>
            </Tabs>
          </nav>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
