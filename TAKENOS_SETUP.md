# Configuración de Takenos - Sistema de Pagos Semi-Manual

## Descripción
Takenos es un método de pago semi-manual que permite a los usuarios solicitar un link de pago personalizado. El cliente completa un formulario web con sus datos y el administrador recibe la información para generar y enviar el link de pago manualmente.

## Características
- 🎯 **Proceso asistido**: El usuario completa un formulario simple
- 📧 **Notificaciones automáticas**: Emails al admin y al cliente
- 💰 **Pagos en USD**: Ideal para clientes internacionales
- 🔄 **Flujo completo**: Desde solicitud hasta confirmación

## Flujo de Trabajo

### 1. Cliente (Web)
1. Selecciona "Takenos" en la página de pagos
2. Completa el formulario con:
   - Nombre completo
   - Email
   - Número de WhatsApp
   - Descripción del servicio
   - Monto en USD
3. Hace clic en "Solicitar Link de Pago"
4. Ve un estado de carga y luego confirmación
5. Recibe un email de confirmación

### 2. Administrador (Manual)
1. Recibe email con los datos del cliente
2. Genera link de pago en Takenos
3. Envía link por email y WhatsApp al cliente
4. Confirma el pago cuando se procese

## Configuración Técnica

### Variables de Entorno Requeridas
```bash
# Configuración SMTP para emails
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@servicedg.com"
```

### Configuración de Gmail
1. Habilita verificación en 2 pasos
2. Genera una "Contraseña de aplicación" para SMTP
3. Usa esta contraseña en `SMTP_PASS`

### Archivos Principales
- `src/app/components/TakenosPayment.tsx` - Componente del formulario
- `src/app/api/takenos/request-payment/route.ts` - API para procesar solicitudes
- `src/app/pago/page.tsx` - Página de selección de métodos de pago

## Cómo Usar

### Para el Cliente
1. Ingresa al dashboard
2. Va a la sección de pagos
3. Selecciona "Takenos"
4. Completa todos los campos requeridos
5. Hace clic en "Solicitar Link de Pago"
6. Espera el email y WhatsApp con el link

### Para el Administrador
1. Recibe email con subject: "🚨 Nueva Solicitud Takenos: $XX USD - Nombre Cliente"
2. Revisa los datos del cliente
3. Accede a tu cuenta de Takenos
4. Genera link de pago por el monto solicitado
5. Usa los botones del email para:
   - Enviar link por WhatsApp
   - Enviar link por email
6. Confirma que el cliente recibió el link

## Emails Automáticos

### Email al Administrador
- **Subject**: Nueva Solicitud Takenos con monto y nombre
- **Contenido**: 
  - Datos completos del cliente
  - Monto y descripción
  - Botones para WhatsApp y email
  - ID de la solicitud

### Email al Cliente
- **Subject**: Solicitud de Pago Recibida - ServiceDG
- **Contenido**:
  - Confirmación de recepción
  - Resumen de la solicitud
  - Próximos pasos
  - Tiempo estimado

## Validaciones

### Frontend
- Nombre completo requerido
- Email válido requerido
- WhatsApp mínimo 10 caracteres
- Monto mayor a 0

### Backend
- Todos los campos obligatorios
- Validación de formato de email
- Sanitización de datos
- Logging de todas las solicitudes

## Troubleshooting

### Emails no llegan
1. Verifica variables de entorno SMTP
2. Revisa que SMTP_PASS sea contraseña de aplicación
3. Confirma que ADMIN_EMAIL esté configurado
4. Verifica logs del servidor

### Formulario no envía
1. Verifica que todos los campos estén completos
2. Revisa console del navegador por errores
3. Confirma que la API route esté funcionando
4. Verifica conexión a internet

### WhatsApp no funciona
1. Verifica que el número incluya código de país
2. Confirma que el número sea válido
3. Usa el formato sugerido: +5491123456789

## Mejoras Futuras

- [ ] Integración directa con API de WhatsApp
- [ ] Dashboard de administración para ver solicitudes
- [ ] Notificaciones push para el administrador
- [ ] Integración automática con Takenos API
- [ ] Historial de solicitudes
- [ ] Estados de seguimiento (solicitado, enviado, pagado)

## Seguridad

- ✅ Validación de datos en frontend y backend
- ✅ Sanitización de inputs
- ✅ Logging de todas las operaciones
- ✅ Emails seguros con autenticación
- ✅ No se almacenan datos sensibles de pago
- ✅ Proceso manual para máxima seguridad

## Soporte

Para problemas o consultas:
- Revisa los logs del servidor
- Verifica la configuración de emails
- Contacta al equipo de desarrollo
