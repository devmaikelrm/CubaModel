## CubaModel — Consultas de Cel Cuba

Aplicación web estática para gestionar consultas: autenticación básica (frontend), panel de control, carga y revisión de datos.

### Demo (GitHub Pages)
Cuando el workflow termine, el sitio quedará disponible en:
- https://devmaikelrm.github.io/CubaModel/

### Estructura
- `dashboard.html`, `login.html`, `register.html`, `subir.html`, `revisar.html`, `404.html`
- `assets/` (JS, CSS y utilidades de UI)

### Desarrollo local
- Abre `dashboard.html` u otra página directamente en el navegador, o sirve la carpeta con un servidor estático.
- Ejemplo con Python: `python -m http.server 8080` y abre `http://localhost:8080`.

### Despliegue
Este repo usa GitHub Pages con GitHub Actions. Al hacer push a `main` se construye y despliega automáticamente.

---

© 2025.
