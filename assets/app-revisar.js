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
      if (isSupabaseConfigured) {
        await this.fetchFiltered();
      } else {
        this.applyLocalFilters();
      }
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
    async fetchFiltered() {
      // Server-side filtering with Supabase when configured
      if (!isSupabaseConfigured) { this.applyLocalFilters(); return; }
      let query = supabase
        .from(TABLE_MODELOS)
        .select('id, modelo, bandas, operador, provincia, revisado');

      // Text search on tsvector column 'search' using websearch syntax
      const q = this.q.trim();
      if (q) query = query.textSearch('search', q, { type: 'websearch' });

      // Provincia filter
      if (this.provincia !== 'all') query = query.eq('provincia', this.provincia);

      // Bandas: requires row to contain all selected
      const wantsAll = this.bandasSel.includes('todas');
      if (!wantsAll) {
        const selected = this.bandasSel.map(b => b.toUpperCase());
        query = query.contains('bandas', selected);
      }

      // Ordering
      query = query.order('modelo', { ascending: this.ordenAsc });

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetch failed; falling back to local mock:', error);
        this.applyLocalFilters();
        return;
      }
      const rows = (data || []).map(r => ({
        id: r.id,
        modelo: r.modelo,
        bandas: Array.isArray(r.bandas) ? r.bandas : [],
        operador: r.operador || 'ETECSA',
        provincia: r.provincia,
        revisado: !!r.revisado,
      }));
      this.data = rows;
      this.filtered = rows;
    },

    applyLocalFilters() {
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
    },

    async applyFilters() {
      if (isSupabaseConfigured) {
        await this.fetchFiltered();
      } else {
        this.applyLocalFilters();
      }
    }
  }
}
window.revisarApp = revisarApp;
