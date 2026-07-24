import { deleteGame } from '#/api/games'
import { getSettings, setSettings } from '#/api/settings'
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
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import z from 'zod'

export const Route = createFileRoute('/dashboard/games/$id/config')({
  component: RouteComponent,
})

const formSchema = z.object({
  projectName: z.string().max(32),
  displayName: z.string().max(32),
  gameUrl: z.url().max(255).optional(),
})

type FormSchemaT = z.infer<typeof formSchema>

const initialData = {
  displayName: '',
  gameUrl: '',
  projectName: '',
  token: '',
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const gameId = useParams({ from: '/dashboard/games/$id/config' }).id

  const { data } = useQuery({
    queryKey: ['config', gameId],
    queryFn: () => getSettings(gameId),
    initialData,
  })

  // FIXME: unable to reset gameURL
  const saveSettings = useMutation({
    mutationFn: (newSettings: FormSchemaT) => setSettings(gameId, newSettings),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['config', gameId] }),
        queryClient.invalidateQueries({ queryKey: ['games'] }),
      ]),
  })

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(formSchema),
    values: {
      gameUrl: data.gameUrl,
      displayName: data.displayName,
      projectName: data.projectName,
    },
  })

  return (
    <div>
      <h2 className="scroll-m-20 font-heading pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-2">
        Game settings
      </h2>
      <form
        onSubmit={handleSubmit((v) => saveSettings.mutate(v))}
        className="flex flex-col gap-4"
      >
        <SettingsFormCard
          title="Public"
          formControl={control}
          fields={[
            {
              id: 'displayName',
              label: 'Display name',
              placeholder: 'Tetris rankings',
              description: 'The title used for public leadboard page',
            },
            {
              id: 'gameUrl',
              label: 'Game URL',
              placeholder: 'tetris://main',
              description:
                'The deeplink to the game used for "Go Back" button on leaderboard page',
            },
          ]}
        />
        <SettingsFormCard
          title="Internal"
          formControl={control}
          fields={[
            {
              id: 'projectName',
              label: 'Project name',
              placeholder: 'Tetris',
              description: 'The internal name used only inside dashboard',
            },
          ]}
          footer={<DeleteDialog />}
        />
        <Field>
          <Button type="submit">Save</Button>
        </Field>
      </form>
    </div>
  )
}

interface SettingsFormCardProps {
  title: string
  formControl: Control<FormSchemaT>
  fields: {
    id: keyof FormSchemaT
    label: string
    placeholder?: string
    description?: string
  }[]
  footer?: ReactNode
}

function SettingsFormCard({
  title,
  formControl,
  fields,
  footer,
}: SettingsFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {fields.map(({ id, label, placeholder, description }) => (
            <Controller
              key={id}
              name={id}
              control={formControl}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={placeholder}
                  />
                  {description && <FieldDescription children={description} />}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </FieldGroup>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

function DeleteDialog() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const gameId = useParams({
    from: '/dashboard/games/$id/config',
  }).id

  const remove = useMutation({
    mutationFn: () => deleteGame(gameId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['game', gameId],
      })
      queryClient.invalidateQueries({
        queryKey: ['games'],
      })
      navigate({
        to: '/dashboard/games',
      })
    },
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" type="button">
          Delete game
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete game?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this game from the platform. View{' '}
            <Link
              to="/dashboard/games/$id/boards"
              from="/dashboard/games/$id/config"
            >
              Boards
            </Link>{' '}
            to delete any boards linked to this game.
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
  )
}
