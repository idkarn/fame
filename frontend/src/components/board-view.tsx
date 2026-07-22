import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { getRanking } from '#/api/analytics'
import { Trash2Icon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { useRef, useState } from 'react'
import { deleteRecord } from '#/api/records'

interface IBoardViewProps {
  boardId: string
  open: boolean
  setOpen: (v: boolean) => void
}

export function BoardView({ boardId, open, setOpen }: IBoardViewProps) {
  const queryClient = useQueryClient()

  const [isDialogOpen, setDialogOpen] = useState(false)
  const currentPlayerId = useRef<string | null>(null)

  const { data } = useSuspenseQuery({
    queryKey: ['records', boardId],
    queryFn: () => getRanking(boardId),
  })

  const removeMutation = useMutation({
    mutationFn: () => {
      if (currentPlayerId.current === null) {
        throw new Error('record is not selected!')
      }

      return deleteRecord(boardId, currentPlayerId.current)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['records', boardId],
      }),
    onSettled: () => (currentPlayerId.current = null),
  })

  function openDialog(playerId: string) {
    setDialogOpen(true)
    currentPlayerId.current = playerId
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit board</SheetTitle>
          </SheetHeader>
          <Table>
            <TableCaption>
              This is list of all players' records in leaderboard
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>High Score</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record, idx) => (
                <TableRow key={record.playerId}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{record.playerId}</TableCell>
                  <TableCell>{record.playerName}</TableCell>
                  <TableCell>{record.score}</TableCell>
                  <TableCell>{record.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => openDialog(record.playerId)}
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SheetContent>
      </Sheet>

      <RemoveDialog
        open={isDialogOpen}
        setOpen={setDialogOpen}
        remove={removeMutation.mutate}
      />
    </>
  )
}

function RemoveDialog({
  open,
  setOpen,
  remove,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  remove: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="sm" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this recordd from the leaderboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={remove}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
