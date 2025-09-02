import { MODELOS } from './data.js';

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
    init() {
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