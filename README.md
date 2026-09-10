# Manufacturas Poly — sitio web

Vitrina y **galería** para **Manufacturas Poly S.A.C.** (San Juan de Lurigancho, Lima):
botones de metal y goma, remaches, parches, etiquetas de cuero, jaladores y placas.

**Es una galería, no una tienda ni un catálogo con ficha técnica.** No hay carrito,
ni precios, ni pagos. El visitante elige una familia, ve las fotos de esa familia
—cada una con su descripción— y escribe por WhatsApp o por el formulario.

El contenido tiene dos niveles, ambos editables por el dueño desde el CMS:

- **Familia** — el agrupador (Metal, Goma, Cuero… y las que quiera crear).
- **Pieza** — una foto con su descripción, dentro de una familia.

Los datos técnicos (código, acabado, medida) son **opcionales**: si el dueño los
deja vacíos, no aparecen y la pieza se ve como una foto de galería.

```
poly-web/          el sitio     → Vite + React + TS + Tailwind v4 → cPanel (estático)
poly-studio/       el panel     → Sanity Studio                   → sanity.studio
```

El sitio se compila en local y se sube el contenido de `dist/` a `public_html`.
Los pasos completos están en **[DESPLIEGUE-CPANEL.md](DESPLIEGUE-CPANEL.md)**.

---

## Arranque rápido

```bash
npm install
cp .env.example .env.local   # completar con los datos reales
npm run dev                  # http://localhost:5173
```

El sitio **funciona sin configurar nada**: si no hay CMS, muestra una galería de
ejemplo (3 familias, 17 piezas). Configurar Sanity reemplaza ese ejemplo por el
contenido real.

| Comando             | Qué hace                              |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                |
| `npm run build`     | Build de producción en `dist/`        |
| `npm run lint`      | oxlint                                |
| `npm run typecheck` | Chequeo de tipos (no corre en build)  |
| `npm run audit`     | Auditoría de vulnerabilidades         |

---

## Cómo está organizado

| Archivo                | Qué contiene                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `src/index.css`        | Sistema de diseño: colores, tipografías, texturas y animaciones   |
| `src/data.ts`          | Tipos, contacto y galería de ejemplo (respaldo del CMS)           |
| `src/visuals.tsx`      | Arte vectorial de cada pieza, logotipo e iconos                   |
| `src/ui.tsx`           | Botones, chips, campos, revelado al hacer scroll                  |
| `src/hooks.ts`         | Observador de scroll y detección de `prefers-reduced-motion`      |
| `src/lib/sanity.ts`    | Cliente de lectura del CMS y mapeo a `Family` / `Piece`           |
| `src/lib/useGallery.ts`| Trae la galería con respaldo a los ejemplos                       |
| `src/lib/color.ts`     | Aclarar/oscurecer un color (fondos de familias nuevas)            |
| `src/lib/contact.ts`   | Envío del formulario y defensas anti-bot                          |
| `src/lib/Turnstile.tsx`| Captcha opcional de Cloudflare                                    |
| `src/App.tsx`          | Secciones del sitio y composición                                 |

### Las piezas se dibujan cuando no hay foto

Si una pieza no tiene foto, el sitio la dibuja en SVG en vez de mostrar un hueco.
Cada familia elige su dibujo por defecto (botón de jean, remache, placa, parche,
etiqueta de cuero…) y el acabado —"Cobre pulido", "Níquel"— define la paleta del
metal.

Para una familia que el dueño invente ("Plásticos", "Cierres") existe el dibujo
**genérico**: un medallón con la marca, teñido con el color que él le haya puesto
a la familia. Así una familia nueva se ve terminada sin que tenga que elegir nada.

Cuando sube una foto, la foto manda.

---

## El panel del dueño (Sanity Studio)

El dueño **no toca código ni el repositorio**. Entra a una web, completa un
formulario, aprieta Publish y el sitio se actualiza solo.

### Puesta en marcha (una sola vez)

1. **Crear el proyecto** en <https://sanity.io/manage> → *Create new project*.
   Nombre: `Manufacturas Poly`. Dataset: `production`, **público**.
   Copiar el **Project ID**.

2. **Configurar el Studio**

   ```bash
   cd poly-studio
   npm install
   cp .env.example .env        # pegar el Project ID en SANITY_STUDIO_PROJECT_ID
   npx sanity login
   npm run dev                 # http://localhost:3333
   ```

3. **Configurar el sitio** — en `poly-web/.env.local`:

   ```
   VITE_SANITY_PROJECT_ID=<el mismo ID>
   VITE_SANITY_DATASET=production
   ```

4. **Permitir que el navegador lea los datos** (CORS). Sin esto el sitio no ve nada:

   ```bash
   cd poly-studio
   npx sanity cors add http://localhost:5173 --no-credentials
   npx sanity cors add https://mpsac.com.pe --no-credentials
   npx sanity cors add https://www.mpsac.com.pe --no-credentials
   ```

   `--no-credentials` es importante: da permiso de lectura anónima, no de sesión.

5. **Publicar el Studio** para que el dueño entre desde cualquier computadora:

   ```bash
   cd poly-studio
   npm run deploy              # queda en https://manufacturas-poly.sanity.studio
   ```

6. **Invitar al dueño** en sanity.io/manage → *Members* → *Invite*.

   > ⚠️ El plan **gratuito de Sanity sólo tiene dos roles**: `Administrator` y
   > `Viewer`. `Viewer` es de sólo lectura, así que no sirve: el dueño tiene que
   > entrar como **Administrator**. Los roles acotados (`Editor`) requieren el
   > plan Growth, ~US$15 por asiento al mes.
   >
   > Como Administrator puede publicar todo lo que necesita, pero también borrar
   > contenido o quitar usuarios. Mitigación: Sanity guarda historial de cambios,
   > así que un documento borrado por accidente se recupera.

### Qué ve el dueño

El menú lateral tiene cuatro accesos: **Familias**, **Piezas por familia**,
**Todas las piezas** y **Piezas sin foto** (para saber qué le falta fotografiar).

**Para agregar una familia:** Familias → *Create* → Nombre, apretar *Generate*
en el identificador, descripción, color y orden. Publish.

> Las familias Metal, Goma y Cuero deben conservar los identificadores `metal`,
> `goma` y `cuero`: son los que activan sus fondos especiales (denim, caucho,
> cuero). Cualquier familia nueva usa un fondo generado a partir de su color.

**Para agregar una pieza:** Piezas → *Create* → Nombre, Familia, Foto y
Descripción. Eso es todo lo que hace falta. La pestaña *Datos técnicos* trae
Código, Acabado y Medida, todos opcionales: lo que deje vacío no se muestra.

**Importante:** los cambios tardan hasta ~1 minuto en aparecer porque el sitio lee
desde la CDN de Sanity (`useCdn: true`). Es a propósito: es lo que hace que la
galería cargue instantáneo y aguante tráfico sin costo.

### Qué cuesta

Nada. El proyecto entra holgadamente en el plan gratuito de Sanity: 20 usuarios,
10.000 documentos, 1M de peticiones CDN al mes, 100 GB de tráfico y 100 GB de
imágenes. Un sitio como éste consume 2 peticiones por visita.

Los límites vigentes están en <https://www.sanity.io/pricing>.

---

## Formulario de contacto

No hay servidor propio: el correo lo despacha **Web3Forms**. Pedir una access key
gratuita en <https://web3forms.com> con el correo donde Poly quiere recibir las
solicitudes, y ponerla en `VITE_WEB3FORMS_KEY`.

Sin esa clave el formulario funciona pero no envía nada (modo demostración) y lo
dice en pantalla.

Defensas anti-bot, en capas:

1. **Honeypot** — campo oculto que sólo un bot completa.
2. **Trampa de tiempo** — un envío en menos de 3 segundos se rechaza.
3. **Límites de longitud** — validados en el navegador y recortados antes de enviar.
4. **Turnstile** (opcional) — captcha invisible de Cloudflare. Se activa solo con
   poner `VITE_TURNSTILE_SITE_KEY`; si no está, no se carga nada de Cloudflare.

---

## Seguridad

La arquitectura ya es la parte más importante: **sitio estático + CMS hosteado**.
No hay servidor propio, ni base de datos, ni panel de login que atacar.

- **Cero secretos en el cliente.** Sólo viajan `projectId` y `dataset`, que son
  públicos y de solo lectura. Nunca poner un token de escritura en una variable
  `VITE_*`: Vite las publica dentro del JavaScript que descarga el visitante.
- **Sin `dangerouslySetInnerHTML`.** Todo lo que viene del CMS se renderiza como
  texto plano; un editor no puede inyectar HTML ni scripts.
- **Cabeceras** en [`public/.htaccess`](public/.htaccess): HSTS,
  `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y
  una CSP con `script-src 'self'` (más `challenges.cloudflare.com`, inerte
  mientras Turnstile esté apagado). Vite lo copia a `dist/` en cada build, así
  que viaja con el sitio y no hay que mantenerlo a mano en el servidor.
- **Fuentes auto-hospedadas** vía `@fontsource`, así la CSP se queda en
  `font-src 'self'` y no hay pedidos a Google.
- **Dependencias vigiladas**: `npm audit` en cada push y Dependabot semanal.
- **Escritura siempre con login** de Sanity; el dataset público es sólo lectura.

`style-src` mantiene `'unsafe-inline'` porque algunos colores se calculan en línea
(el tinte de cada material). Es el punto más flojo de la CSP y el riesgo es bajo.

---

## Despliegue

Guía completa paso a paso: **[DESPLIEGUE-CPANEL.md](DESPLIEGUE-CPANEL.md)**.

Resumen:

```bash
npm run build        # lee .env.production y hornea los valores en el bundle
                     # imprime un resumen: revisá que el CMS aparezca con ✔
```

Después se comprime el **contenido** de `dist/` (no la carpeta), se sube a
`public_html` por File Manager y se extrae. El `.htaccess` va incluido.

Dos cosas que no hay que olvidar:

- **AutoSSL antes que HSTS.** El `.htaccess` manda HSTS a 2 años; si se activa
  sin certificado válido, el sitio queda inaccesible sin vuelta atrás.
- **CORS del dominio en Sanity**, o el sitio publicado muestra la galería de
  ejemplo en vez de la real:
  `npx sanity cors add https://mpsac.com.pe --no-credentials`

> `.env.production` **no está en git** (como todo `.env`). Guardá una copia
> aparte: es el único lugar donde viven los valores de producción ahora que no
> hay panel de hosting que los almacene.

---

## Pendientes del cliente

- [ ] **Número de WhatsApp Business real.** Hoy `WA` en `src/data.ts` es un
      placeholder (`51999999999`). El fijo no sirve para WhatsApp.
- [ ] Fotos reales de las piezas — las sube el dueño desde el Studio.
- [ ] Texto final de "Nosotros", si quiere ajustarlo.
- [ ] Enlaces reales de redes sociales en el pie de página.
