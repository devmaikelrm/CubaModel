import { useState } from 'preact/hooks'
import { supabase, TABLE_MODELOS } from '../lib/supabase'

const PROVINCIAS_CU = [
  'Pinar del Río','Artemisa','La Habana','Mayabeque','Matanzas',
  'Cienfuegos','Villa Clara','Sancti Spíritus','Ciego de Ávila',
  'Camagüey','Las Tunas','Holguín','Granma','Santiago de Cuba',
  'Guantánamo','Isla de la Juventud'
]

export default function SubirForm() {
  const [modelo, setModelo] = useState('')
  const [provincia, setProv] = useState('La Habana')
  const [bandas, setBandas] = useState({ g2:false,g3:false,g4:false,g5:false })
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: Event) {
    e.preventDefault()
    setErr(null)
    const sel: string[] = []
    if (bandas.g2) sel.push('2G'); if (bandas.g3) sel.push('3G')
    if (bandas.g4) sel.push('4G'); if (bandas.g5) sel.push('5G')
    if (!modelo.trim()) return setErr('El modelo es obligatorio.')
    if (sel.length===0) return setErr('Selecciona al menos una banda.')
    setLoading(true)
    try{
      const { error } = await supabase.from(TABLE_MODELOS).insert({
        modelo: modelo.trim(), operador:'ETECSA', provincia, bandas: sel, revisado:false
      })
      if (error) throw error
      setOk(true); setModelo(''); setBandas({g2:false,g3:false,g4:false,g5:false})
      setTimeout(()=>setOk(false), 1600)
    }catch(e:any){ setErr(e?.message || 'No se pudo guardar (RLS?)') }
    finally{ setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} class="card maxw">
      <h2 class="title">Subir modelos</h2>
      <div class="grid two">
        <label><span>Modelo</span><input value={modelo} onInput={(e:any)=>setModelo(e.target.value)} placeholder="Poco X6 Pro" /></label>
        <label><span>Operador</span><input value="ETECSA" disabled /></label>
      </div>
      <div class="grid two mt">
        <label>
          <span>Provincia</span>
          <select value={provincia} onInput={(e:any)=>setProv(e.target.value)}>
            {PROVINCIAS_CU.map(p => <option value={p}>{p}</option>)}
          </select>
        </label>
        <div>
          <span>Bandas</span>
          <div class="chips">
            {(['g2','g3','g4','g5'] as const).map(k=>(
              <label class="checkbox">
                <input type="checkbox" checked={bandas[k]} onInput={(e:any)=>setBandas(v=>({...v,[k]:e.target.checked}))}/>
                {k.toUpperCase().replace('G','G')}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div class="row mt">
        <button class="btn" disabled={loading}>{loading?'Guardando…':'Guardar'}</button>
        {ok && <span class="ok">Guardado ✓</span>}
        {err && <span class="err">{err}</span>}
      </div>
    </form>
  )
}

