# Guía de Integración con Mercado Pago - Checkout API

## ## 🔄 Cómo funciona el nuevo modelo

### Flujo del usuario (SIN redirecciones):
1. Usuario hace clic en "Pagos" en el panel admin
2. Completa el formulario con monto y descripción
3. Hace clic en "Procesar Pago"
4. **El checkout aparece DIRECTAMENTE en tu página**
5. Usuario completa el pago sin salir de tu sitio
6. Ve el resultado inmediatamente

### Flujo técnico:
1. Frontend carga el SDK de Mercado Pago
2. Frontend envía datos a `/api/mercadopago/create-order`
3. API crea una "preferencia" optimizada para Checkout API
4. Frontend renderiza el checkout en el contenedor `.mercadopago-checkout`
5. Usuario completa el pago en tu página
6. Mercado Pago envía notificaciones al webhook
7. Tu aplicación procesa la notificaciónntó?

Se implementó el **nuevo modelo Checkout API con Orders** de Mercado Pago que incluye:

1. **Botón "Pagos"** en el panel de administración
2. **Página de pagos** (`/pago`) con formulario para configurar monto y descripción
3. **Checkout integrado** - El pago se procesa **DIRECTAMENTE en tu página** (sin redireccionar)
4. **API de Orders** usando el modelo más moderno de Mercado Pago
5. **Webhook** para recibir notificaciones de pago
6. **Páginas de resultado** (éxito, fallo, pendiente)

## ✨ Ventajas del nuevo modelo:

- **✅ Sin redirecciones** - El cliente no sale de tu página
- **✅ Mejor UX** - Experiencia más fluida y profesional
- **✅ Más métodos de pago** - Incluye todos los métodos disponibles
- **✅ Responsive** - Se adapta perfectamente a móviles
- **✅ Cuotas disponibles** - Hasta 12 cuotas sin interés

## 📋 Pasos para configurar Mercado Pago

### Paso 1: Crear cuenta en Mercado Pago
1. Ve a [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Crea una cuenta o inicia sesión
3. Ve a "Tus aplicaciones" → "Crear aplicación"
4. Selecciona "Checkout API" como modelo de integración

### Paso 2: Obtener credenciales (AMBAS son necesarias)
1. En tu aplicación, ve a "Credenciales"
2. **Para pruebas**:
   - Access Token de SANDBOX: `TEST-1234567890-abcdef-...`
   - Public Key de SANDBOX: `TEST-abcdef-1234567890-...`
3. **Para producción**:
   - Access Token de PRODUCCIÓN: `APP_USR-1234567890-abcdef-...`
   - Public Key de PRODUCCIÓN: `APP_USR-abcdef-1234567890-...`

### Paso 3: Configurar variables de entorno
Edita el archivo `.env` y reemplaza estas líneas:

**Para pruebas (recomendado primero):**
```
MERCADOPAGO_ACCESS_TOKEN="TEST-1234567890-abcdef-..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-abcdef-1234567890-..."
```

**Para producción:**
```
MERCADOPAGO_ACCESS_TOKEN="APP_USR-1234567890-abcdef-..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-abcdef-1234567890-..."
```

### Paso 4: Configurar URLs en Mercado Pago
En tu aplicación de Mercado Pago, configura:
- **URL de notificaciones**: `https://tu-dominio.com/api/mercadopago/webhook`
- **URLs de redirección**:
  - Éxito: `https://tu-dominio.com/pago/success`
  - Fallo: `https://tu-dominio.com/pago/failure`
  - Pendiente: `https://tu-dominio.com/pago/pending`

## 🔄 Cómo funciona

### Flujo del usuario:
1. Usuario hace clic en "Pagos" en el panel admin
2. Completa el formulario con monto y descripción
3. Hace clic en "Procesar Pago"
4. Se abre una nueva ventana con el checkout de Mercado Pago
5. Usuario completa el pago con su método preferido
6. Es redirigido a la página de resultado correspondiente

### Flujo técnico:
1. Frontend envía datos a `/api/mercadopago/create-payment`
2. API crea una "preferencia" en Mercado Pago
3. Mercado Pago devuelve una URL de pago (`init_point`)
4. Usuario es redirigido a esa URL para pagar
5. Mercado Pago envía notificaciones al webhook (`/api/mercadopago/webhook`)
6. Tu aplicación puede procesar la notificación y actualizar su base de datos

## 💰 Métodos de pago disponibles

Con Mercado Pago, tus clientes pueden pagar con:
- **Tarjetas de crédito**: Visa, Mastercard, American Express
- **Tarjetas de débito**: Visa Débito, Maestro
- **Dinero en cuenta de Mercado Pago**
- **Efectivo**: Rapipago, Pago Fácil, Otros
- **Transferencia bancaria**

## 🧪 Modo de pruebas

Para probar sin dinero real:
1. Usa credenciales de SANDBOX (TEST-...)
2. Usa estos datos de tarjetas de prueba:

**Tarjeta aprobada:**
- Número: 4509 9535 6623 3704
- Código: 123
- Vencimiento: 11/25

**Tarjeta rechazada:**
- Número: 4013 5406 8274 6260
- Código: 123
- Vencimiento: 11/25

## 🔔 Notificaciones de pago

El webhook en `/api/mercadopago/webhook` recibe notificaciones cuando:
- Se aprueba un pago
- Se rechaza un pago
- Cambia el estado de un pago

Puedes personalizar esta función para:
- Enviar emails de confirmación
- Actualizar tu base de datos
- Activar servicios para el cliente
- Generar facturas

## 🛡️ Seguridad

- Las credenciales están en variables de entorno (no en código)
- Las transacciones son procesadas por Mercado Pago (PCI compliant)
- Los webhooks validan que vengan de Mercado Pago
- No manejas datos sensibles de tarjetas

## 📊 Dashboard y reportes

En tu cuenta de Mercado Pago puedes:
- Ver todas las transacciones
- Exportar reportes
- Configurar transferencias automáticas a tu banco
- Ver estadísticas de ventas

## 🔧 Personalización

Puedes personalizar:
- **Montos**: Cambiar en el componente `MercadoPagoPayment`
- **Descripción**: Modificar el texto por defecto
- **Estilos**: Adaptar la UI a tu marca
- **Lógica post-pago**: Agregar acciones en el webhook

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica las variables de entorno
3. Consulta la documentación de Mercado Pago
4. Contacta soporte de Mercado Pago

¡Listo! Ya tienes un sistema de pagos completo integrado. 🎉
