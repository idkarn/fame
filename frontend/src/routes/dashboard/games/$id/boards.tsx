import { deleteBoard, updateBoard, createBoard } from '#/api/boards'
import type { Board } from '#/api/boards'
import { getGame } from '#/api/games'
import { BoardView } from '#/components/board-view'
import {
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ExternalLink, MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

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
      <div className="flex justify-between">
        <h2 className="scroll-m-20 font-heading pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-2">
          Boards
        </h2>
        <NewBoardDialog />
      </div>
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

type BoardItemContextType = {
  remove: () => void
  rename: (name: string) => void
  isRenameOpen: boolean
  setRenameOpen: (v: boolean) => void
  initialName: string
  boardId: string
}

const BoardItemContext = createContext({} as BoardItemContextType)

// todo: move delete alert into shared component

function BoardItem({ board, idx }: BoardItemProps) {
  const queryClient = useQueryClient()

  const [isRenameOpen, setRenameOpen] = useState(false)

  const remove = useMutation({
    mutationFn: () => deleteBoard(board.id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['game', board.gameId],
      }),
  })

  const rename = useMutation({
    mutationFn: (name: string) =>
      updateBoard(board.id, {
        name: name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['game', board.gameId],
      })
      setRenameOpen(false)
    },
  })

  const context: BoardItemContextType = {
    isRenameOpen,
    setRenameOpen,
    remove: remove.mutate,
    rename: rename.mutate,
    initialName: board.name,
    boardId: board.id,
  }

  return (
    <TableRow>
      {/* <TableCell>{idx + 1}</TableCell>
      <TableCell>&hellip;{board.id.slice(board.id.length - 4)}</TableCell> */}
      <TableCell>{board.name}</TableCell>
      <TableCell className="text-right">
        <BoardItemContext.Provider value={context}>
          <BoardItemMenu />
        </BoardItemContext.Provider>
      </TableCell>
    </TableRow>
  )
}

function BoardItemMenu() {
  const gameId = useParams({
    from: '/dashboard/games/$id/boards',
  }).id
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const { setRenameOpen, remove, boardId } = useContext(BoardItemContext)
  const [isViewOpen, setViewOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
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
            <AlertDialogAction variant="destructive" onClick={remove}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BoardItemRenameDialog />

      <BoardView boardId={boardId} open={isViewOpen} setOpen={setViewOpen} />
    </>
  )
}

const renameFormSchema = z.object({
  name: z.string().max(32).nonempty(),
})

function BoardItemRenameDialog() {
  const {
    isRenameOpen: isOpen,
    setRenameOpen: setOpen,
    rename,
    initialName,
  } = useContext(BoardItemContext)

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(renameFormSchema),
    defaultValues: {
      name: initialName,
    },
  })

  useEffect(() => {
    if (!isOpen)
      reset({
        name: initialName,
      })
  }, [isOpen, reset, initialName])

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit(({ name }) => rename(name))}>
          <DialogHeader>
            <DialogTitle>Rename board</DialogTitle>
            <DialogDescription>
              You can change the board's name if you wanna. This name is used
              both inside dashboard and at public leaderboard
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Best of '87"
                    autoComplete="off"
                  />
                  <FieldDescription>Public name for the board</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const newBoardFormSchema = z.object({
  name: z.string().max(32).nonempty(),
})

function NewBoardDialog() {
  const queryClient = useQueryClient()
  const gameId = useParams({
    from: '/dashboard/games/$id/boards',
  }).id

  const [open, setOpen] = useState(false)

  const newBoard = useMutation({
    mutationFn: (name: string) => createBoard(gameId, name),
    onSuccess: () => {
      setOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['game', gameId],
      })
    },
  })

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(newBoardFormSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (open) reset()
    newBoard.reset()
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New board</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(({ name }) => newBoard.mutate(name))}>
          <DialogHeader>
            <DialogTitle>New board</DialogTitle>
            <DialogDescription>
              You can create new board for separate ranking
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Tetris"
                  />
                  <FieldDescription>Name for new board</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={newBoard.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={newBoard.isPending}>
              {newBoard.isPending ? 'Creating...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
