import { useEffect, useMemo, useState } from 'preact/hooks'
import { supabase, TABLE_MODELOS } from '../lib/supabase'

type Row = { id:number; modelo:string; operador:string; provincia:string; bandas:string[]; revisado:boolean }

const PROVINCIAS_CU = [
  'Pinar del Río','Artemisa','La Habana','Mayabeque','Matanzas',
  'Cienfuegos','Villa Clara','Sancti Spíritus','Ciego de Ávila',
  'Camagüey','Las Tunas','Holguín','Granma','Santiago de Cuba',
  'Guantánamo','Isla de la Juventud'
]

export default function RevisarGrid() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [prov, setProv] = useState<'all'|string>('all')
  const [b, setB] = useState({ g2:false,g3:false,g4:false,g5:false })
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from(TABLE_MODELOS).select('*').order('id', { ascending:false })
        if (error) throw error
        setRows(data as any)
      } catch {
        setRows([])
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const need = new Set<string>()
    if (b.g2) need.add('2G'); if (b.g3) need.add('3G'); if (b.g4) need.add('4G'); if (b.g5) need.add('5G')
    return rows.filter(r => {
      if (prov !== 'all' && r.provincia !== prov) return false
      if (need.size) for (const x of need) if (!r.bandas.includes(x)) return false
      if (q.trim()) return r.modelo.toLowerCase().includes(q.trim().toLowerCase())
      return true
    })
  }, [rows, q, prov, b])

  async function toggleRevisado(item: Row) {
    setUpdating(item.id)
    try {
      const { error } = await supabase.from(TABLE_MODELOS).update({ revisado: !item.revisado }).eq('id', item.id)
      if (error) throw error
      setRows(rs => rs.map(r => r.id===item.id ? {...r, revisado: !r.revisado} : r))
    } catch {
      alert('No se pudo actualizar (¿eres admin en tabla admins?)')
    } finally { setUpdating(null) }
  }

  return (
    <div class="grid cols">
      <aside class="card">
        <div class="row sb">
          <h3 class="title">Filtros</h3>
          <button class="link" onClick={()=>{ setQ(''); setProv('all'); setB({g2:false,g3:false,g4:false,g5:false}) }}>Limpiar</button>
        </div>
        <div class="mt">
          {(['g2','g3','g4','g5'] as const).map(k=>(
            <label class="checkbox">
              <input type="checkbox" checked={b[k]} onInput={(e:any)=>setB(v=>({...v,[k]:e.target.checked}))}/>
              {k.toUpperCase().replace('G','G')}
            </label>
          ))}
        </div>
        <div class="mt">
          <span class="muted small">Provincia</span>
          <select value={prov} onInput={(e:any)=>setProv(e.target.value)}>
            <option value="all">Todas</option>
            {PROVINCIAS_CU.map(p => <option value={p}>{p}</option>)}
          </select>
        </div>
        <input class="mt" placeholder="Buscar modelo…" value={q} onInput={(e:any)=>setQ(e.target.value)} />
      </aside>

      <section>
        <div class="row sb muted small mb">{filtered.length} resultado{filtered.length===1?'':'s'}</div>
        <div class="grid cards">
          {filtered.map(it=>(
            <article class="card">
              <div class="row sb">
                <div>
                  <h4 class="subtitle">{it.modelo}</h4>
                  <p class="muted small">Operador: <b>ETECSA</b> — {it.provincia}</p>
                </div>
                <span class="badge">{it.revisado? 'Revisado':'Pendiente'}</span>
              </div>
              <div class="chips mt">
                {it.bandas.map(b => <span class="pill">{b}</span>)}
              </div>
              <div class="right mt">
                <button class="btn" disabled={updating===it.id} onClick={()=>toggleRevisado(it)}>
                  {updating===it.id? 'Guardando…' : (it.revisado? 'Marcar pendiente':'Marcar revisado')}
                </button>
              </div>
            </article>
          ))}
          {filtered.length===0 && <div class="card muted">Sin resultados.</div>}
        </div>
      </section>
    </div>
  )
}

