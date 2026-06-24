import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "#/components/ui/input-otp";
import { createFileRoute } from "@tanstack/react-router";
import { QRCode } from '@ttsalpha/qrcode'
import { useEffect, useState } from "react";

export const Route = createFileRoute('/login/')({ component: Login })

function Login() {
    const [url, setURL] = useState("")
    const [code, setCode] = useState("")
    const [ok, setOk] = useState(false)
    
    useEffect(() => {
      async function getUrl() {
        const res = await fetch("/api/auth/otp?email=wasd")
        if (res.ok) {
          const data = await res.text()
          console.log("data", data)
          setURL(data)
        }
      }
      void getUrl()
    }, [])

    useEffect(() => {
      async function check() {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          body: JSON.stringify({
            email: "wasd",
            code: code
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          setOk(true)
        }
        const data = await res.text()
        console.log(data)
      }
      if (code.length == 6) {
        void check()
      }
    }, [code])

    return <div>
        {url && <QRCode value={url} />}
        <InputOTP maxLength={6} value={code} onChange={v => setCode(v)}>
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
    </div>
}