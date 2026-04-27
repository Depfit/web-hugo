# Hugo Gómez Salgado — Sitio Web Profesional

Web de marca personal para Hugo Gómez Salgado, CEO de VISUALATIN y Founder de Overnait. Desarrollada con HTML, CSS y JavaScript puros — sin dependencias externas, lista para subir a cualquier hosting estático.

---

## Cómo abrir

**Opción rápida:** doble clic en `index.html`. Se abre directamente en el navegador, sin servidor ni instalación.

---

## Estructura de archivos

```
hugo-gomez-web/
├── index.html              ← Página principal
├── assets/
│   ├── css/
│   │   └── style.css       ← Todos los estilos
│   ├── js/
│   │   └── main.js         ← Interactividad
│   └── images/             ← Carpeta para las fotos de Hugo
└── README.md
```

---

## Personalización — Fotos

### 1. Foto de perfil en el Hero

1. Nombrá la foto `hugo-profile.jpg` y colocala en `assets/images/`
2. En `index.html`, buscá el comentario `FOTO DE PERFIL` (Sección Hero)
3. Reemplazá `<div class="orb-inner"><span>HG</span></div>` por:
   ```html
   <div class="orb-inner"><img src="assets/images/hugo-profile.jpg" alt="Hugo Gómez Salgado"></div>
   ```
4. Agregá la clase `has-photo` al `div.profile-orb`:
   ```html
   <div class="profile-orb has-photo">
   ```

### 2. Foto en la sección "Sobre Hugo"

1. Nombrá la foto `hugo-sobre.jpg` y colocala en `assets/images/` (recomendado: portrait vertical, mínimo 680×800px)
2. En `index.html`, buscá el comentario `FOTO SOBRE` y reemplazá el `div.photo-placeholder` completo por:
   ```html
   <div class="photo-placeholder">
     <img src="assets/images/hugo-sobre.jpg" alt="Hugo Gómez Salgado">
   </div>
   ```

### 3. Fotos de Instagram (grilla)

1. Nombrá las fotos `ig-1.jpg`, `ig-2.jpg`, `ig-3.jpg`, `ig-4.jpg`, `ig-5.jpg`
2. Colocálas en `assets/images/`
3. En `index.html`, buscá el comentario `FOTOS DE INSTAGRAM` y reemplazá cada `.ig-placeholder` por:
   ```html
   <img src="assets/images/ig-1.jpg" alt="Post de Instagram">
   ```
   (repetí para ig-2.jpg ... ig-5.jpg en los siguientes `.ig-item`)

---

## Personalización — Contacto

En `index.html`, buscá la sección `#contacto` y descomentá las líneas con WhatsApp y/o email:

```html
<!-- Descomentá cuando Hugo confirme sus datos: -->
<a href="https://wa.me/54XXXXXXXXXX" ...>WhatsApp</a>
<a href="mailto:hugo@XXXXXXX.com" ...>Email</a>
```

Reemplazá `54XXXXXXXXXX` con el número argentino (sin el +) y el email real.

---

## Personalización — Textos

Todos los textos se editan directamente en `index.html`. Los bloques principales están marcados con comentarios de sección:

| Sección | Qué editar |
|---------|-----------|
| Hero | Tagline, descripción, badges |
| Sobre Hugo | Dos párrafos de bio |
| VISUALATIN | Descripción de la agencia |
| Overnait | Descripción del proyecto |
| Expertise | 4 áreas con título y párrafo |
| Contacto | Headline y bajada |
| Footer | Rol y links |

---

## Publicar en línea

### Netlify (más rápido — gratis)
1. Entrá a [netlify.com](https://netlify.com) y creá una cuenta
2. Arrastrá la carpeta `hugo-gomez-web/` completa al área **"Drop your site folder here"**
3. Obtenés una URL pública en segundos
4. Para dominio propio: Site settings → Domain management

### Vercel (también gratis)
1. Entrá a [vercel.com](https://vercel.com)
2. New Project → subí los archivos o conectá un repo de GitHub
3. Deploy automático

### GitHub Pages (gratis)
1. Creá un repositorio en GitHub (puede ser privado)
2. Subí todos los archivos de la carpeta
3. Settings → Pages → Deploy from branch → `main` → `/ (root)`
4. URL: `https://usuario.github.io/nombre-repositorio`

---

## Datos verificados utilizados

| Dato | Fuente | Estado |
|------|--------|--------|
| @hugogomezsalgado | Instagram | Confirmado |
| 391 seguidores | Instagram | Confirmado |
| 87 publicaciones | Instagram | Confirmado |
| CEO de VISUALATIN | LinkedIn | Confirmado |
| Founder de Overnait | LinkedIn | Confirmado |
| 500+ conexiones LinkedIn | LinkedIn | Confirmado |
| Buenos Aires, Argentina | LinkedIn | Confirmado |
| VISUALATIN = agencia marketing digital interactivo, Buenos Aires | LinkedIn + Facebook | Confirmado |

---

## Datos pendientes de confirmar con Hugo

Los siguientes datos mejorarían notablemente el resultado final si Hugo los aporta:

1. **Fotos** — Foto de perfil, foto de "Sobre mí", y 5 fotos del feed de Instagram
2. **Bio personal** — El texto actual es una síntesis de información pública; Hugo puede ajustarlo con su voz propia
3. **Descripción de Overnait** — Qué hace exactamente, en qué estadio está, si tiene web
4. **Email o WhatsApp de contacto** — Para agregar al botón de contacto
5. **Servicios concretos** — Si Hugo ofrece consultoría, mentoring, servicios de agencia u otros
6. **Año de fundación** de VISUALATIN y Overnait
7. **Colores de marca** — Si tiene paleta propia, se puede adaptar la web
8. **Imagen OG** — Una foto horizontal (1200×630px) para compartir en redes

---

## Recomendaciones para la versión final

- Con foto de perfil real, el hero gana inmediatamente en credibilidad e impacto
- Si Hugo tiene testimonios de clientes en LinkedIn o Google, se puede agregar una sección de validación social
- Si tiene un link de Calendly u otra herramienta de agenda, conviene agregarlo al botón de contacto
- Para el dominio, `hugogomezsalgado.com` o `hugogomez.ar` son buenas opciones
- Agregar Google Analytics o Plausible para medir visitas (dos líneas de código)

---

*Construida con HTML, CSS y JavaScript. Sin frameworks. Sin dependencias. Lista para cualquier hosting estático.*
