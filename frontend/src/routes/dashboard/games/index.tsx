import { getAllGames } from '#/api/games'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/games/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ['games'],
    queryFn: async () => await getAllGames(),
  })

  return (
    <div className="">
      {data?.map((item) => (
        <Link key={item.id} to="/dashboard/games/$id" params={{ id: item.id }}>
          {item.displayName}
        </Link>
      ))}
    </div>
  )
}
