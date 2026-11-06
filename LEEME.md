# Web MyEliteHealth (Astro)

## Arrancar en tu Mac
```
cd "/Users/javierbarrientos/Documents/ELITE PROJECTS/WEB ASTRO"
npm install
npm run dev          # http://localhost:4321
```

## Antes de publicar (src/config.ts)
- `appStoreURL`: enlace de la App Store.
- `privacyURL` y `termsURL` ya apuntan a /legal/privacidad/ y /legal/aviso-legal/ (mismas rutas que la web antigua).
- `contactEmail`.
- `public/img/og.jpg` ya está (vista previa al compartir).
- Las funciones de las fases 2 y 3 (puntuar en reloj e iPhone a la vez, «Arbitrado», torneo recuperable) solo se anuncian si pasan la prueba en pista.

## Comparar con la web actual
```
node scripts/scrape-ambermuscle.mjs
```
Deja en ./scrape un .md por página. Pásaselo a Antigravity con el prompt de abajo.

## Publicar: GitHub + Cloudflare Pages
```
git init && git add -A && git commit -m "Web MyEliteHealth"
gh repo create MyEliteHealth-web --private --source=. --push
```
Cloudflare → Workers & Pages → Create → Pages → Connect to Git → elige el repo.
Build command: `npm run build` · Output: `dist` · Node 20+. Luego Custom domains → tu dominio.

## Prompt para Antigravity
> Proyecto Astro 5 en esta carpeta (web de lanzamiento de MyEliteHealth). NO cambies la estructura, la paleta (src/styles/global.css) ni las animaciones (src/scripts/main.js, JavaScript sin librerías).
> 1. Lee ./scrape/*.md (web antigua ambermuscle.com). Haz una lista de lo que tenía la antigua y falta en la nueva (secciones, textos legales, enlaces, contacto, datos de empresa) y añádelo en el mismo estilo, sin duplicar.
> 2. Reglas de texto, obligatorias: no usar «salud» salvo «Apple Salud»; no usar «Plus», «lesión», «dolor», «diagnóstico» ni cifras de precisión o citas científicas; precios: deporte 4,99 €, Premium 19,99 €, mejora 14,99 €, pago único.
> 3. Crea public/img/og.jpg (1200×630) con el hero.
> 4. `npm run build` sin errores y comprueba en 390 px y 1440 px que no hay scroll horizontal.

## Páginas legales (copiadas tal cual de ambermuscle.com)
/legal/privacidad/, /legal/aviso-legal/, /legal/cookies/ y sus versiones /en/legal/… Mismas URL que antes, así los enlaces de App Store Connect siguen funcionando.
**Revisión legal pendiente:** la web nueva no usa Google Analytics, ni Google Fonts (fuentes alojadas en la propia web), ni banner de cookies. La política de privacidad (3.1, 3.2) y la de cookies (4.1, 6.1, 6.3) describen cosas que ya no existen. El aviso legal (5.3) y el pie antiguo hablan de «salud», «paciente», «41 módulos científicos» y «gemelo digital»: conviene actualizarlos.

## Páginas retiradas
/medicos, /entrenadores, /alcance y /en redirigen a la portada (public/_redirects). Tenían afirmaciones que la app ya no hace (hipertensión con sensibilidad/especificidad, hormonas, edad biológica, ImmunoAge).
