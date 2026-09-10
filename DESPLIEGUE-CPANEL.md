# Despliegue en cPanel — Manufacturas Poly

El sitio es **estático**: HTML, CSS, JavaScript e imágenes. No necesita Node,
ni PHP, ni base de datos en el servidor. El servidor sólo entrega archivos.

**El build se hace en tu computadora**, no en el hosting. Lo que compilás es
exactamente lo que se sube.

```
tu compu:  npm run build   →   dist/   →   zip   →   public_html/  (cPanel)
```

---

## Cómo se "desconecta" el WordPress del dominio

**No hay nada que desconectar.** Es la confusión más común y conviene entenderla
antes de tocar nada.

En cPanel, un dominio no está "linkeado a un sitio": está apuntado a **una
carpeta** del servidor, que se llama *document root*. Para el dominio principal
esa carpeta es `public_html`.

```
mpsac.com.pe  ──apunta a──►  /home/tuusuario/public_html/
                                   │
                                   └── lo que haya acá adentro, es el sitio
```

Apache sirve lo que encuentre ahí. Hoy encuentra WordPress. Cuando saques
WordPress y pongas tu `dist/`, encuentra tu sitio. **El dominio no se entera:
nunca cambió de carpeta.**

Por eso:

- ❌ No se toca el DNS.
- ❌ No se borra ni se "desasocia" el dominio.
- ❌ No hay que reapuntar nameservers.
- ✅ Sólo se reemplaza el contenido de `public_html`.

### Primero: confirmá cuál es la carpeta del dominio

cPanel → **Domains**. La columna *Document Root* te dice la carpeta exacta de
cada dominio. Para el principal casi siempre es `/home/tuusuario/public_html`,
pero si alguien lo configuró distinto (por ejemplo `public_html/wp`), **esa** es
la carpeta donde va el sitio nuevo.

Mirá también si hay **subdominios o dominios adicionales** cuya carpeta esté
dentro de `public_html` (por ejemplo `public_html/tienda`). Si los hay, **no los
muevas al backup**: los romperías.

### Y si WordPress se instaló con Softaculous / WP Toolkit

Va a quedar una "instalación" registrada apuntando a archivos que ya no existen.

**Dejala así.** Cuando intente actualizar, falla y no pasa nada: no recrea
WordPress ni pisa tu sitio.

**No uses "Remove Installation"** salvo que ya tengas descargados el backup de
archivos *y* el `.sql` de la base — ese botón borra las dos cosas de verdad y no
hay deshacer.

---

## ⚠️ ANTES DE EMPEZAR — respaldar el WordPress actual

`public_html` hoy tiene el WordPress viejo de mpsac.com.pe. **No lo borres.**

> ⚠️ **El respaldo va FUERA de `public_html`.** Todo lo que esté dentro de
> `public_html` es accesible desde internet. Si dejás el backup ahí, cualquiera
> puede abrir `mpsac.com.pe/_backup_wp/wp-config.php` — que tiene el usuario y
> la contraseña de la base de datos. Guardalo en la raíz de tu cuenta, un nivel
> más arriba, que no se sirve por web.

1. cPanel → **File Manager**.
2. **Settings** (arriba a la derecha) → tildar **Show Hidden Files (dotfiles)** →
   Save. Sin esto no vas a ver el `.htaccess` de WordPress y te lo vas a dejar.
3. Ir a la **raíz de tu cuenta** (`/home/tuusuario`, el nivel donde está
   `public_html`). Crear ahí la carpeta `_backup_wp`.
4. Entrar a `public_html` → **Select All** → **Move** → destino
   `/home/tuusuario/_backup_wp`.
5. Verificar que `public_html` quedó **completamente vacío**.

**Y la base de datos**, que es la mitad que la gente olvida: cPanel →
**phpMyAdmin** → seleccionar la base de WordPress → pestaña *Export* → *Go*.
Guardá el `.sql` en tu computadora. Los archivos sin la base no restauran nada.

Cuando el sitio nuevo esté andando y aprobado, `_backup_wp` se puede borrar.
Antes no.

> **Tu correo no se toca.** `info@mpsac.com.pe` y las demás cuentas viven en el
> servidor de mail, no en `public_html`. Mover o borrar archivos web no afecta
> el correo en absoluto.

---

## Paso 1 — Preparar las variables de producción

El archivo `.env.production` (en la raíz del proyecto) tiene los valores que se
**hornean dentro del JavaScript** al compilar. Ya está creado con el CMS
configurado. Revisá que diga:

```
VITE_SANITY_PROJECT_ID=pbfa14to
VITE_SANITY_DATASET=production
VITE_WEB3FORMS_KEY=          ← completar cuando tengas la key
```

> **Este archivo NO está en git** (como cualquier `.env`). Guardá una copia
> aparte: sin él, un build futuro sale sin CMS y el sitio muestra la galería de
> ejemplo en vez de la real.
>
> Todo lo que va acá es **público por diseño**: cualquiera puede leerlo en el
> código fuente del sitio. Nunca pongas un token de escritura de Sanity.

---

## Paso 2 — Compilar

```bash
npm run build
```

Antes de empaquetar imprime un resumen. **Leelo:**

```
┌─ Configuración horneada en este build ─────────────
  ✔ CMS Sanity: pbfa14to / production
  ✖ Formulario: modo demostración (no envía correos)
  ✔ Captcha: apagado
└────────────────────────────────────────────────────
```

Si el CMS aparece con ✖, **no subas ese build**: falta el `.env.production`.

Al terminar queda la carpeta `dist/` con todo el sitio, incluido el `.htaccess`
(se copia solo desde `public/`).

---

## Paso 3 — Comprimir el CONTENIDO de dist, no la carpeta

Este es el error más común. Si comprimís la carpeta, en el servidor te queda
`public_html/dist/index.html` y el sitio no carga.

**Windows (Explorador):** entrá *dentro* de `dist`, `Ctrl+A` para seleccionar
todo lo de adentro, clic derecho → *Enviar a* → *Carpeta comprimida*.

**O con este comando, que es el método confiable:**

```bash
python -c "import pathlib,zipfile; r=pathlib.Path('dist'); z=zipfile.ZipFile('poly-site.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9); [z.write(f, f.relative_to(r).as_posix()) for f in sorted(r.rglob('*')) if f.is_file()]; z.close()"
```

> ⚠️ **No uses `tar -a -c -f algo.zip`.** El `tar` que trae Windows ignora la
> extensión y escribe un **tar** con nombre `.zip`. Se sube sin problemas y
> recién falla al extraer, con el error *"End-of-central-directory signature
> not found"*.
>
> Para comprobar que el archivo es un zip de verdad, tiene que empezar con las
> letras `PK`:
> ```bash
> head -c 2 poly-site.zip     # debe imprimir: PK
> ```

Verificá el zip antes de subirlo: al abrirlo tenés que ver `index.html` y
`assets/` en la raíz, **no** una carpeta `dist`.

---

## Paso 4 — Subir y extraer

1. cPanel → **File Manager** → `public_html` (tiene que estar vacío salvo `_backup_wp`).
2. Botón **Upload** → elegir `poly-site.zip` → esperar el 100%.
3. Volver a `public_html`, clic derecho sobre el zip → **Extract** → extraer en
   `/public_html`.
4. Borrar el `poly-site.zip` del servidor.
5. Comprobar que `public_html` tenga: `index.html`, `assets/`, `favicon.svg`,
   `.htaccess` y `_backup_wp/`.

---

## Paso 5 — Verificar el .htaccess

Con *Show Hidden Files* activado, tiene que existir `public_html/.htaccess`.

**Si no está** (porque el zip se lo comió), crealo: File Manager → **+ File** →
nombre `.htaccess` → clic derecho → **Edit** → pegar el contenido de
[`public/.htaccess`](public/.htaccess) de este proyecto → **Save**.

**Si quedó el `.htaccess` del WordPress**, reemplazalo por el nuevo. El de
WordPress tiene reglas de rewrite que rompen el sitio.

### Prueba de humo

Abrí el sitio. Si ves **Error 500**, el hosting no permite alguna directiva.
Es raro pero pasa: abrí el `.htaccess` y comentá con `#` el bloque de la
sección 1 (`Options -Indexes` y el `<IfModule mod_authz_core.c>`). Guardá y
recargá. Si vuelve, ese era el problema y el resto del archivo funciona igual.

---

## Paso 6 — Activar el certificado HTTPS

cPanel → **Security** → **SSL/TLS Status** → seleccionar `mpsac.com.pe` y
`www.mpsac.com.pe` → **Run AutoSSL**. Tarda unos minutos.

> **Importante y en este orden.** El `.htaccess` incluye HSTS
> (`Strict-Transport-Security`), que le dice al navegador *"de acá en adelante
> entrá siempre por HTTPS, durante 2 años"*. Si activás eso **antes** de tener
> el certificado, los visitantes quedan con el sitio inaccesible y no hay forma
> de revertirlo desde el servidor.
>
> Por eso: **primero AutoSSL, después comprobás que `https://mpsac.com.pe` abre
> con el candado, y recién ahí dejás el HSTS activo.** Si necesitás subir el
> sitio antes de tener el certificado, comentá con `#` esa línea del
> `.htaccess` y descomentala cuando el HTTPS ande.

Cuando funcione, verificá que `http://mpsac.com.pe` redirija solo a `https://`.

---

## Paso 7 — Autorizar el dominio en Sanity (CORS)

Sin esto, el sitio en producción no puede leer la galería: se ve, pero con las
piezas de ejemplo.

```bash
cd poly-studio
npx sanity cors add https://mpsac.com.pe --no-credentials
npx sanity cors add https://www.mpsac.com.pe --no-credentials
```

`--no-credentials` da permiso de **lectura anónima**, no de sesión. Es lo que
corresponde: el sitio sólo lee.

Comprobar con `npx sanity cors list`.

---

## Paso 8 — Revisión final en el sitio publicado

Abrí `https://mpsac.com.pe` y la consola del navegador (**F12**):

- [ ] **Sin errores de Content Security Policy.** Si aparece alguno, decime cuál
      y ajusto la CSP del `.htaccess`.
- [ ] La galería muestra las familias y piezas reales del CMS, no las de ejemplo.
- [ ] Los botones de WhatsApp abren el chat con el mensaje pre-escrito.
- [ ] El formulario envía (o avisa que está en modo demostración).
- [ ] En el celular se ve bien.
- [ ] `http://mpsac.com.pe` redirige a `https://`.
- [ ] Una ruta inventada (`/cualquier-cosa`) muestra el sitio, no un error de Apache.

Para confirmar las cabeceras de seguridad:
<https://securityheaders.com/?q=mpsac.com.pe> — debería dar **A** o **A+**.

---

## Actualizar el sitio más adelante

**Si sólo cambian fotos, piezas o familias:** no hay nada que hacer. El dueño publica
desde el Studio y el sitio se actualiza solo — los datos no están en el hosting.

**Si cambia el código o el diseño:**

```bash
npm run build
```

y repetir los pasos 3 y 4. Sólo hace falta reemplazar `index.html` y la carpeta
`assets/`; el `.htaccess` no cambia salvo que yo lo modifique.

> Como los archivos de `assets/` llevan un hash en el nombre, los viejos quedan
> huérfanos en el servidor. Cada tantos despliegues conviene borrar el contenido
> de `assets/` antes de extraer el zip nuevo, para que no se acumulen.

---

## Si algo sale mal

| Síntoma | Causa habitual |
| --- | --- |
| Página en blanco, 404 en los `.js` | Se subió la carpeta `dist` en vez de su contenido |
| Error 500 | Una directiva del `.htaccess` no permitida — ver Paso 5 |
| Se ve el sitio pero con la galería de ejemplo | Falta el CORS del dominio (Paso 7) o el `.env.production` al compilar |
| Sigue apareciendo el WordPress viejo | Quedó un `index.php`, o el navegador tiene caché — probá en ventana privada |
| Se ve el sitio de otro dominio | El *Document Root* del dominio no es `public_html` — revisalo en cPanel → Domains |
| Errores de CSP en consola | Un servicio externo nuevo sin permiso en la CSP |
| El sitio no carga después de activar HTTPS | HSTS activo sin certificado válido — ver Paso 6 |
| Todo roto y hay que volver atrás | Mover lo de `_backup_wp` de vuelta a `public_html` |
