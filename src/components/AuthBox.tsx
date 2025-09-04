import { useState } from 'preact/hooks'
import { supabase } from '../lib/supabase'

export function LoginBox() {
  const [email, setEmail] = useState(''), [pass, setPass] = useState('')
  const [msg, setMsg] = useState(''), [loading, setLoading] = useState(false)
  async function onSubmit(e: Event){ e.preventDefault(); setMsg(''); setLoading(true)
    try{ const { error } = await supabase.auth.signInWithPassword({ email:email.trim().toLowerCase(), password:pass })
      if (error) throw error; location.assign('/CubaModel/') }
    catch(e:any){ setMsg(e?.message || 'No se pudo iniciar sesión.') }
    finally{ setLoading(false) } }
  return (
    <form onSubmit={onSubmit} class="card maxw">
      <h2 class="title">Entrar</h2>
      <input placeholder="Correo" value={email} onInput={(e:any)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" class="mt" value={pass} onInput={(e:any)=>setPass(e.target.value)} />
      <button class="btn mt" disabled={loading}>{loading?'Entrando…':'Entrar'}</button>
      {!!msg && <p class="err mt">{msg}</p>}
      <p class="muted small mt">¿No tienes cuenta? <a class="link" href="/CubaModel/register">Crear cuenta</a></p>
      <p class="muted small">¿Olvidaste tu contraseña? <a class="link" href="/CubaModel/forgot">Recuperar</a></p>
    </form>
  )
}

export function RegisterBox() {
  const [email, setEmail] = useState(''), [p1, setP1] = useState(''), [p2, setP2] = useState('')
  const [msg, setMsg] = useState(''), [loading, setLoading] = useState(false)
  async function onSubmit(e: Event){ e.preventDefault(); setMsg('');
    if(p1.length<6) return setMsg('Mínimo 6 caracteres.'); if(p1!==p2) return setMsg('No coinciden.');
    setLoading(true); try{
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password: p1,
        options: { emailRedirectTo: 'https://devmaikelrm.github.io/CubaModel/login' }
      }); if (error) throw error; setMsg('Cuenta creada. Revisa tu correo para confirmar.')
      setTimeout(()=>location.assign('/CubaModel/login'), 1200)
    }catch(e:any){ setMsg(e?.message || 'No se pudo crear la cuenta.') } finally{ setLoading(false) } }
  return (
    <form onSubmit={onSubmit} class="card maxw">
      <h2 class="title">Crear cuenta</h2>
      <input placeholder="Correo" value={email} onInput={(e:any)=>setEmail(e.target.value)} />
      <div class="grid two mt">
        <input type="password" placeholder="Contraseña (mín. 6)" value={p1} onInput={(e:any)=>setP1(e.target.value)} />
        <input type="password" placeholder="Repetir contraseña" value={p2} onInput={(e:any)=>setP2(e.target.value)} />
      </div>
      <button class="btn mt" disabled={loading}>{loading?'Creando…':'Crear cuenta'}</button>
      {!!msg && <p class="muted small mt">{msg}</p>}
      <p class="muted small">¿Ya tienes cuenta? <a class="link" href="/CubaModel/login">Entrar</a></p>
    </form>
  )
}

export function ForgotBox() {
  const [email, setEmail] = useState(''), [msg, setMsg] = useState(''), [loading, setLoading] = useState(false)
  async function onSubmit(e: Event){ e.preventDefault(); setMsg(''); setLoading(true)
    try{ const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: 'https://devmaikelrm.github.io/CubaModel/reset'
    }); if (error) throw error; setMsg('Revisa tu correo para continuar.') }
    catch(e:any){ setMsg(e?.message || 'No se pudo enviar.') } finally{ setLoading(false) } }
  return (
    <form onSubmit={onSubmit} class="card maxw">
      <h2 class="title">Recuperar acceso</h2>
      <input placeholder="Correo" value={email} onInput={(e:any)=>setEmail(e.target.value)} />
      <button class="btn mt" disabled={loading}>{loading?'Enviando…':'Enviar enlace'}</button>
      {!!msg && <p class="muted small mt">{msg}</p>}
    </form>
  )
}

export function ResetBox() {
  const [p1, setP1] = useState(''), [p2, setP2] = useState(''), [msg, setMsg] = useState(''), [ok, setOk] = useState(false)
  async function onSubmit(e: Event){ e.preventDefault(); setMsg('');
    if(p1.length<6) return setMsg('Mínimo 6 caracteres.'); if(p1!==p2) return setMsg('No coinciden.');
    const { error } = await supabase.auth.updateUser({ password: p1 }); if (error) setMsg(error.message); else { setOk(true); setMsg('Contraseña actualizada.') } }
  return (
    <form onSubmit={onSubmit} class="card maxw">
      <h2 class="title">Restablecer contraseña</h2>
      <input type="password" placeholder="Nueva contraseña" value={p1} onInput={(e:any)=>setP1(e.target.value)} />
      <input type="password" placeholder="Repetir contraseña" value={p2} onInput={(e:any)=>setP2(e.target.value)} class="mt" />
      <button class="btn mt">Guardar</button>
      {!!msg && <p class={ok?'ok':'err'}>{msg}</p>}
      <p class="muted small mt"><a class="link" href="/CubaModel/login">Volver a entrar</a></p>
    </form>
  )
}
