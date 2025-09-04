import { useEffect, useState } from 'preact/hooks'

export default function ModalBienvenida({ email }: { email: string }) {
  const key = `cc_modal_v1_${email.toLowerCase()}`
  const [open, setOpen] = useState(false)
  useEffect(()=>{ if(!localStorage.getItem(key)) setOpen(true) }, [key])
  function aceptar(){ localStorage.setItem(key,'1'); setOpen(false) }
  if(!open) return null
  return (
    <div class="modal-backdrop">
      <div class="modal">
        <h3 class="title">¡Bienvenido a CubaModel!</h3>
        <p class="muted">Registra y consulta compatibilidad por bandas/provincia. Los datos pueden estar en revisión. ¡Contribuye subiendo modelos verificados!</p>
        <ul class="muted small" style="margin-top:8px">
          <li>• No garantizamos precisión completa.</li>
          <li>• Evita datos sensibles y duplicados.</li>
          <li>• Reporta inconsistencias.</li>
        </ul>
        <div class="right mt">
          <button class="btn" onClick={aceptar}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

