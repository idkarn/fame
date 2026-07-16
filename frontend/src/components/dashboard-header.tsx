import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useQuery } from '@tanstack/react-query'
import { Button } from './ui/button'
import { DashboardNavigation } from './dashboard-navigation'
import { getAllGames } from '#/api/games'

export function DashboardHeader() {
  const navigate = useNavigate()
  const { id: gameId } = useParams({ strict: false })
  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: async () => await getAllGames(),
  })

  const currentGameId: string = games?.find(({ id }) => id === gameId)?.id ?? ''

  function onGameChange(newValue: string) {
    navigate({
      to: '/dashboard/games/$id',
      params: {
        id: newValue,
      },
    })
  }

  function onLogout() {
    navigate({
      href: '/api/logout',
    })
  }

  return (
    <header>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-2xl font-bold">Fame</h1>
          <Select value={currentGameId} onValueChange={onGameChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent>
              {games?.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="destructive" onClick={onLogout}>
          Log out
        </Button>
      </div>
      {currentGameId && <DashboardNavigation />}
    </header>
  )
}
