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
  FieldSeparator,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
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
  backURL: z.url().max(255).optional(),
  background: z.hex(),
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const resp = await fetch('/config', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!resp.ok) {
        console.log(await resp.text())
        throw new Error('something went wrong!')
      }
      return (await resp.json()) as z.infer<typeof formSchema>
    },
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: data,
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
  }

  return (
    <div>
      <h2 className="scroll-m-20 font-heading pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-2">
        Game settings
      </h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <SettingsFormCard
          title="Public"
          formControl={form.control}
          fields={[
            {
              id: 'displayName',
              label: 'Display name',
              placeholder: 'Tetris rankings',
              description: 'The title used for public leadboard page',
            },
            {
              id: 'backURL',
              label: 'Game URL',
              placeholder: 'tetris://main',
              description:
                'The deeplink to the game used for "Go Back" button on leaderboard page',
            },
          ]}
        />
        <SettingsFormCard
          title="Internal"
          formControl={form.control}
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
      </form>
    </div>
  )
}

interface SettingsFormCardProps {
  title: string
  formControl: Control<z.infer<typeof formSchema>>
  fields: {
    id: keyof z.infer<typeof formSchema>
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
            <Link to="/dashboard/games/$id/boards" from="/dashboard/games/$id">
              Boards
            </Link>{' '}
            to delete any boards linked to this game.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
