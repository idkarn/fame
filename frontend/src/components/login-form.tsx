import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createContext, useContext, useEffect, useState } from 'react'
import { QRCode } from '@ttsalpha/qrcode'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './ui/input-otp'
import z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { redirect, useNavigate } from '@tanstack/react-router'

type LoginContextType = {
  email: string
  setEmail: (v: string) => void
  modalOpen: boolean
  openModal: () => void
  closeModal: () => void
  checkOTP: (code: string) => Promise<boolean>
}

const LoginContext = createContext({} as LoginContextType)

// async function getUrl() {
//       const res = await fetch(`/api/auth/opt?email=${email}`)
//       if (res.ok) {
//         const data = await res.text()
//         console.log('data', data)
//         setUrl(data)
//       }
//     }

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  async function checkOTP(code: string): Promise<boolean> {
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      body: JSON.stringify({
        email,
        code,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (res.ok) {
      return true
    }
    const data = await res.text()
    console.log(data)
    return false
  }

  const context = {
    email,
    setEmail,
    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    checkOTP,
  }

  return (
    <LoginContext.Provider value={context}>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailForm />
          </CardContent>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </Card>
        <OTPDialog />
      </div>
    </LoginContext.Provider>
  )
}

// function OTPDialog() {
//   const { modalOpen, closeModal } = useContext(LoginContext)

//   return (
//     <div>
//       {/* {url && <QRCode value={url} />} */}
//       <Dialog open={modalOpen} onOpenChange={closeModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter your OTP</DialogTitle>
//           </DialogHeader>
//           <OTPForm />
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DialogClose>
//             <Button type="submit">Submit</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

function EmailForm() {
  const { openModal, setEmail } = useContext(LoginContext)

  const formSchema = z.object({
    email: z.email(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setEmail(data.email)
    openModal()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="my@email.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit">Continue</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

function OTPDialog() {
  const { checkOTP, modalOpen, closeModal } = useContext(LoginContext)
  const navigate = useNavigate()

  const formSchema = z.object({
    code: z.string().length(6),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  function onSubmit({ code }: z.infer<typeof formSchema>) {
    checkOTP(code).then((r) => {
      if (r) {
        navigate({
          to: '/dashboard',
        })
      }
    })
  }

  return (
    <Dialog open={modalOpen} onOpenChange={closeModal}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Enter your OTP</DialogTitle>
          </DialogHeader>

          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>OTP</FieldLabel>
                <InputOTP
                  maxLength={6}
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
