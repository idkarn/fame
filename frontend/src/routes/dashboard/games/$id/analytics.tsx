import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/games/$id/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/games/$id/analytics"!</div>
}
