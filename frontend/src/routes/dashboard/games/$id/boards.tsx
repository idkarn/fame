import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/games/$id/boards')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/games/$id/boards"!</div>
}
