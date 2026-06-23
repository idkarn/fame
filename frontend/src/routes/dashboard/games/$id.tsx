import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/games/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  return <div>
    id: {params.id}
  </div>
}
