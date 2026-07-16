import { deleteBoard } from '#/api/boards'
import type { Board } from '#/api/boards'
import { getGame } from '#/api/games'
import {
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialog,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/games/$id/boards')({
  component: RouteComponent,
})

function RouteComponent() {
  const gameId = useParams({ from: '/dashboard/games/$id' }).id

  const {
    data: { boards },
  } = useSuspenseQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId),
  })

  return (
    <div>
      <h2 className="scroll-m-20 font-heading pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-2">
        Boards
      </h2>
      <Table>
        <TableCaption>
          This is list of all active boards used by the game
        </TableCaption>
        <TableHeader>
          <TableRow>
            {/* <TableHead className="w-px whitespace-nowrap">#</TableHead>
          <TableHead className="w-px whitespace-nowrap">ID</TableHead> */}
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boards.map((board, idx) => (
            <BoardItem key={board.id} idx={idx} board={board} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface BoardItemProps {
  board: Board
  idx: number
}

// todo: move delete alert into shared component

function BoardItem({ board, idx }: BoardItemProps) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => deleteBoard(board.id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['game', board.gameId],
        }),
      ]),
  })

  return (
    <TableRow>
      {/* <TableCell>{idx + 1}</TableCell>
      <TableCell>&hellip;{board.id.slice(board.id.length - 4)}</TableCell> */}
      <TableCell>{board.name}</TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
              <DropdownMenuItem disabled>Open</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete board?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this board and all its records from
                the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => remove.mutate()}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}
