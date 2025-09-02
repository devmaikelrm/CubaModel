// List of provinces in Cuba used for filters
export const PROVINCIAS_CU = [
  'Pinar del Río','Artemisa','La Habana','Mayabeque','Matanzas',
  'Cienfuegos','Villa Clara','Sancti Spíritus','Ciego de Ávila',
  'Camagüey','Las Tunas','Holguín','Granma','Santiago de Cuba',
  'Guantánamo','Isla de la Juventud'
];
// Example models dataset with reviewed status
export const MODELOS = [
  { id:1, modelo:'Galaxy S21', bandas:['2G','3G','4G','5G'], operador:'ETECSA', provincia:'La Habana', revisado:true },
  { id:2, modelo:'Poco X6',   bandas:['2G','3G','4G','5G'], operador:'ETECSA', provincia:'Camagüey', revisado:false },
  { id:3, modelo:'Redmi 13C', bandas:['2G','3G','4G'],      operador:'ETECSA', provincia:'Holguín', revisado:true },
  { id:4, modelo:'iPhone 12', bandas:['3G','4G','5G'],      operador:'ETECSA', provincia:'Santiago de Cuba', revisado:false }
];