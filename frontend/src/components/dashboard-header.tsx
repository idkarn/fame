import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button'
import { DashboardNavigation } from './dashboard-navigation'
import { createGame, getAllGames } from '#/api/games'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from './ui/field'
import { Input } from './ui/input'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useEffect, useState } from 'react'

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
        <div className="flex items-center gap-4">
          <CreateGameDialog />
          <Button variant="destructive" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </div>
      {currentGameId && <DashboardNavigation />}
    </header>
  )
}

const formSchema = z.object({
  name: z.string().max(32).nonempty(),
})

function CreateGameDialog() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const newGame = useMutation({
    mutationFn: (name: string) => createGame(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['games'],
      })
      setOpen(false)
      navigate({
        to: '/dashboard/games/$id',
        params: {
          id: data.id,
        },
      })
    },
  })

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
      newGame.reset()
    }
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New game</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(({ name }) => newGame.mutate(name))}>
          <DialogHeader>
            <DialogTitle>New game</DialogTitle>
            <DialogDescription>
              You are gonna create a new game. Please choose a name for the
              project. You can change it later.
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
                  <FieldDescription>Name of your new game</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={newGame.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={newGame.isPending}>
              {newGame.isPending ? 'Creating...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
