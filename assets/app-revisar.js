import { MODELOS } from './data.js';
import { supabase, isSupabaseConfigured, TABLE_MODELOS } from './supabase.js';

// Application for revisar.html: filtering models
export function revisarApp() {
  return {
    q: '',
    provincia: 'all',
    bandasSel: ['todas'],
    ordenAsc: true,
    live: true,
    filtered: [],
    data: MODELOS,
    async init() {
      // Try loading from Supabase if configured
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from(TABLE_MODELOS)
          .select('id, modelo, bandas, operador, provincia, revisado')
          .order('modelo', { ascending: true });
        if (!error && Array.isArray(data)) {
          // Normalize to the structure used by UI
          this.data = data.map(r => ({
            id: r.id,
            modelo: r.modelo,
            bandas: Array.isArray(r.bandas) ? r.bandas : [],
            operador: r.operador || 'ETECSA',
            provincia: r.provincia,
            revisado: !!r.revisado,
          }));
        } else {
          console.warn('Supabase load failed, using mock data:', error);
        }
      }
      this.applyFilters();
    },
    reset() {
      this.q = '';
      this.provincia = 'all';
      this.bandasSel = ['todas'];
      this.applyFilters();
    },
    toggleOrden() {
      this.ordenAsc = !this.ordenAsc;
      this.applyFilters();
    },
    onBandasChange(ev) {
      const values = Array.isArray(ev.target.value) ? ev.target.value : [ev.target.value];
      if(values.includes('todas')) {
        this.bandasSel = ['todas'];
        ev.target.value = 'todas';
      } else {
        this.bandasSel = values;
        if(!this.bandasSel.length) {
          this.bandasSel = ['todas'];
          ev.target.value = 'todas';
        }
      }
      if(this.live) this.applyFilters();
    },
    applyFilters() {
      const q = this.q.trim().toLowerCase();
      const wantsAll = this.bandasSel.includes('todas');
      const selected = this.bandasSel.map(b => b.toUpperCase());
      const out = this.data.filter(item => {
        const okQ = q ? item.modelo.toLowerCase().includes(q) : true;
        const okProv = this.provincia === 'all' ? true : (item.provincia === this.provincia);
        const okBandas = wantsAll ? true : selected.every(b => item.bandas.includes(b));
        return okQ && okProv && okBandas;
      }).sort((a,b) => this.ordenAsc ? a.modelo.localeCompare(b.modelo) : b.modelo.localeCompare(a.modelo));
      this.filtered = out;
    }
  }
}
window.revisarApp = revisarApp;
