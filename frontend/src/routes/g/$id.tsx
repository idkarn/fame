import { getRanking } from '#/api/analytics'
import { getGame, getPublicGame } from '#/api/games'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/g/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const gameId = useParams({
    from: '/g/$id',
  }).id

  const { data, isSuccess } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => await getPublicGame(gameId),
  })

  return (
    <div className="py-4 mx-auto max-w-4xl">
      {isSuccess ? (
        <>
          <h1>{data.displayName}</h1>
          <Tabs defaultValue={data.boards[0].id}>
            <TabsList>
              {data.boards.map((board) => (
                <TabsTrigger key={board.id} value={board.id}>
                  {board.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {data.boards.map((board) => (
              <TabsContent key={board.id} value={board.id}>
                <BoardContent boardId={board.id} />
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : null}
    </div>
  )
}

function BoardContent({ boardId }: { boardId: string }) {
  const { data } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getRanking(boardId),
    staleTime: 1000 * 60 * 1, // Data stays fresh for 1 minute
  })

  return (
    <Table>
      <TableCaption>
        This is list of all players' records in leaderboard
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Display Name</TableHead>
          <TableHead>High Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((record, idx) => (
          <TableRow key={record.playerId}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{record.playerName}</TableCell>
            <TableCell>{record.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
