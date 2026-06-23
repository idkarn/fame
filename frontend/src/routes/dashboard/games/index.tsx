import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/games/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="">
    <Link to="/dashboard/games/$id" params={{ id: 'example' }}>Example</Link>
  </div>
}
