import { Button } from '#/components/ui/button'
import { TooltipProvider } from '#/components/ui/tooltip'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

// function Dashboard() {
//   return <TooltipProvider>
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "calc(var(--spacing) * 72)",
//           "--header-height": "calc(var(--spacing) * 12)",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <Outlet />
//       </SidebarInset>
//     </SidebarProvider>
//   </TooltipProvider>
// }

function DashboardLayout() {
  return <TooltipProvider>
    <div className="px-4 mx-auto max-w-4xl">
      <div className='flex justify-between mt-4'>
        <nav className="flex gap-4">
          <Button asChild>
            <Link to='/dashboard'>Home</Link>
          </Button>
          <Button asChild>
            <Link to='/dashboard/games'>My games</Link>
          </Button>
          <Button disabled>
            <Link to='.'>Account</Link>
          </Button>
        </nav>
        <Button variant='destructive'>Log out</Button>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  </TooltipProvider>
}