# Nota importante sobre textos y codificacion

Este proyecto usa textos en espanol con tildes, ene, signos de apertura y otros caracteres UTF-8.

Antes de modificar textos, contenidos, traducciones, seeds, rutas o respuestas que incluyan caracteres como:

- `á`, `é`, `í`, `ó`, `ú`
- `ñ`
- `¿`, `¡`

se debe verificar que el archivo o dato siga guardado como UTF-8.

No convertir ni re-guardar textos con codificacion Windows-1252/ANSI. Si eso ocurre, aparecen errores como:

- `cafÃ©` en vez de `café`
- `niÃ±a` en vez de `niña`
- `Â¿DÃ³nde` en vez de `¿Dónde`

Cuando se corrijan contenidos de lectura o preguntas, revisar tanto:

- los archivos del repo, especialmente `server/routes.ts`, `client/src/pages/ReadingContentPage.tsx` y locales;
- el contenido guardado en base de datos/admin, porque produccion puede estar leyendo desde la base y no desde el fallback local.

Regla practica para futuros ajustes:

1. No cambiar textos con tildes si no es necesario.
2. Si se editan, validar que se vean bien en el navegador y en la respuesta API.
3. Si aparece `Ã`, `Â`, o simbolos raros, corregir desde la fuente real del contenido, no solo desde la vista.
