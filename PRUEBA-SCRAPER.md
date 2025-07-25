# 🧪 Guía de Prueba - Scraper Mejorado

## Canal de Prueba: @somoslacasa
**URL:** https://www.youtube.com/@somoslacasa

## Pasos para Probar:

### 1. Abrir el Monitor de YouTube
- Navegar a la página del monitor en el dashboard
- Asegurarse de que el servidor esté corriendo

### 2. Configurar el Monitor
- **URL:** `https://www.youtube.com/@somoslacasa` o `@somoslacasa`
- **Modo:** Seleccionar "Canal (Auto-Detección)"
- **Intervalo:** 1 minuto (para pruebas rápidas)

### 3. Iniciar Monitoreo
- Hacer clic en "🔴 Iniciar Monitor"
- Revisar la consola del navegador (F12) para ver logs detallados

### 4. Qué Buscar:

#### ✅ Si funciona correctamente:
- **Título:** Debería mostrar el título real del stream (no "Stream de YouTube")
- **Viewers:** Número real de viewers del stream en vivo
- **Estado:** 🔴 En Vivo (si hay stream activo)
- **Canal:** "Somos La Casa" o nombre similar

#### ❌ Si hay problemas:
- Revisar logs en consola para ver qué estrategias se ejecutan
- Verificar si hay errores de red o bloqueos
- Comprobar si el canal tiene streams activos

### 5. Logs Esperados en Consola:
```
🔍 Iniciando scraping con anti-detección - Modo: channel
🔍 Buscando streams en vivo en canal: https://www.youtube.com/@somoslacasa
🔗 URL normalizada: https://www.youtube.com/@somoslacasa
🏠 Detectado canal de prueba @somoslacasa - logs detallados activados
🔎 Ejecutando estrategia 1/4...
📺 Buscando en página principal del canal...
🌐 Intento 1/3 - Fetching: https://www.youtube.com/@somoslacasa
🔄 Usando User-Agent: Mozilla/5.0...
✅ Request exitoso en intento 1
📄 HTML recibido, tamaño: [número]
🔍 Analizando HTML para encontrar streams en vivo...
```

### 6. Casos de Prueba:

#### Caso 1: Canal con Stream Activo
- Debería detectar automáticamente el stream
- Mostrar título real y viewers
- Logs de "✅ Video en vivo encontrado"

#### Caso 2: Canal sin Stream Activo
- Debería mostrar "Sin streams en vivo"
- Viewers: 0
- Estado: ⏹️ Offline

### 7. Pruebas Adicionales:
- Probar con diferentes URLs del mismo canal
- Verificar que funcione el modo video directo también
- Comprobar que los títulos se extraen correctamente

## Notas de Debugging:
- Los logs detallados aparecen en la consola del navegador
- Si hay bloqueos de CORS, se verán en Network tab
- Los delays anti-detección pueden hacer que tarde unos segundos
