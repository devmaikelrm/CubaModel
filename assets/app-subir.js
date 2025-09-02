import { supabase, isSupabaseConfigured, TABLE_MODELOS } from './supabase.js';

// Form for adding new models (Supabase if configured; otherwise mock)
export function subirApp() {
  return {
    modelo: '',
    provincia: 'La Habana',
    bandas: { g2:false, g3:false, g4:false, g5:false },
    guardadoOk: false,
    async save(e) {
      e.preventDefault();
      const bandas = [];
      if(this.bandas.g2) bandas.push('2G');
      if(this.bandas.g3) bandas.push('3G');
      if(this.bandas.g4) bandas.push('4G');
      if(this.bandas.g5) bandas.push('5G');
      if(!this.modelo || bandas.length === 0) {
        alert('Escribe un modelo y selecciona al menos una banda.');
        return;
      }
      if (isSupabaseConfigured && supabase) {
        const payload = {
          modelo: this.modelo.trim(),
          operador: 'ETECSA',
          provincia: this.provincia,
          bandas: bandas,
          revisado: false,
        };
        const { error } = await supabase.from(TABLE_MODELOS).insert([payload]);
        if (error) {
          console.error('Error saving to Supabase:', error);
          alert('No se pudo guardar en Supabase. Revisa la consola.');
          return;
        }
      }
      // Local success feedback (works for both Supabase and mock)
      this.guardadoOk = true;
      setTimeout(() => { this.guardadoOk = false; }, 2000);
      this.modelo = '';
      this.bandas = { g2:false, g3:false, g4:false, g5:false };
    }
  }
}
window.subirApp = subirApp;
