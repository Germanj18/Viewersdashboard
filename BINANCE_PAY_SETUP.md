# Configuración de Binance Pay

## Descripción
Este documento explica cómo configurar Binance Pay para aceptar pagos con tarjetas de crédito/débito y criptomonedas, recibiendo USDT directamente en tu billetera.

## Requisitos Previos

### 1. Cuenta Binance Verificada
- Crear cuenta en [Binance](https://www.binance.com)
- Completar verificación KYC (Know Your Customer)
- Tener cuenta activa y en buen estado

### 2. Solicitar Acceso a Binance Pay Merchant
- Acceder a [Binance Pay Merchant](https://merchant.binance.com)
- Completar el formulario de solicitud
- Proporcionar información del negocio
- Esperar aprobación (puede tomar varios días)

### 3. Obtener Credenciales API
Una vez aprobado, obtendrás:
- **API Key**: Identificador público de tu cuenta merchant
- **API Secret**: Clave secreta para firmar peticiones

## Configuración

### 1. Variables de Entorno
Agregar a tu archivo `.env.local`:

```env
# Binance Pay
BINANCE_PAY_API_KEY="tu-api-key-aqui"
BINANCE_PAY_SECRET="tu-secret-key-aqui"
```

### 2. Webhook URL
Configurar en el panel de Binance Pay Merchant:
- **URL**: `https://tudominio.com/api/binance/webhook`
- **Eventos**: Payment Success, Payment Failed

## Características Implementadas

### ✅ Funcionalidades Actuales
- **Creación de órdenes** con múltiples monedas
- **Soporte para tarjetas** Visa/Mastercard/AMEX
- **Soporte para criptomonedas** BTC, USDT, BUSD, etc.
- **Conversión automática** a USDT
- **Códigos QR** para pagos móviles
- **Webhooks** para notificaciones en tiempo real
- **Interfaz responsive** y moderna

### 💳 Métodos de Pago Soportados
- **Tarjetas de crédito/débito**
- **Bitcoin (BTC)**
- **Tether (USDT)**
- **Binance USD (BUSD)**
- **Ethereum (ETH)**
- **Binance Coin (BNB)**

### 💰 Monedas Soportadas
- **USD** - Dólares estadounidenses
- **EUR** - Euros
- **BTC** - Bitcoin
- **USDT** - Tether
- **BUSD** - Binance USD

## Flujo de Pago

### 1. Cliente Selecciona Binance Pay
- Ve las opciones de pago disponibles
- Selecciona Binance Pay
- Ingresa monto y moneda

### 2. Creación de Orden
- Sistema genera orden en Binance Pay
- Recibe URL de checkout y código QR
- Muestra opciones de pago al cliente

### 3. Procesamiento
- Cliente paga con tarjeta o cripto
- Binance Pay procesa automáticamente
- Convierte a USDT si es necesario

### 4. Confirmación
- Webhook notifica resultado
- Sistema actualiza estado del pago
- Cliente recibe confirmación

## Comisiones de Binance Pay

### 📊 Estructura de Comisiones
- **Tarjetas de crédito**: ~2.5% + fee fijo
- **Criptomonedas**: ~0.5% - 1%
- **Conversión automática**: Incluida
- **Sin comisiones** de setup o mensuales

### 💡 Ventajas vs Otras Opciones
- **Más barato** que PayPal para cripto
- **Conversión automática** a USDT
- **Sin restricciones** geográficas
- **Procesamiento rápido**

## Testing

### 🧪 Ambiente de Pruebas
- Binance Pay no tiene sandbox público
- Usar montos pequeños para testing
- Verificar webhooks en desarrollo

### 📝 Casos de Prueba
1. **Pago con tarjeta USD** → Conversión a USDT
2. **Pago directo con USDT** → Sin conversión
3. **Pago con código QR** → Desde app móvil
4. **Webhook de confirmación** → Actualización de estado

## Troubleshooting

### 🔧 Problemas Comunes

#### Error: "Invalid signature"
- Verificar BINANCE_PAY_SECRET
- Revisar formato de timestamp
- Confirmar algoritmo HMAC SHA512

#### Error: "Insufficient permissions"
- Verificar que la cuenta merchant esté activa
- Confirmar que el API key tenga permisos
- Revisar configuración de webhook

#### Error: "Currency not supported"
- Verificar monedas soportadas
- Revisar configuración de cuenta
- Confirmar región de operación

### 📞 Soporte
- **Documentación**: [Binance Pay API Docs](https://developers.binance.com/docs/binance-pay)
- **Soporte técnico**: Via portal merchant
- **Community**: Telegram y Discord oficiales

## Seguridad

### 🔒 Mejores Prácticas
- **Nunca exponer** API Secret en frontend
- **Validar siempre** signatures de webhooks
- **Usar HTTPS** en todas las comunicaciones
- **Monitorear** transacciones sospechosas

### 🛡️ Validaciones Implementadas
- Verificación de firma HMAC
- Validación de timestamps
- Sanitización de inputs
- Logs de seguridad

## Deployment

### 🚀 Consideraciones de Producción
- **Variables de entorno** configuradas
- **Webhook URL** accessible públicamente
- **HTTPS** habilitado
- **Logs** configurados para monitoreo

### 📋 Checklist de Deploy
- [ ] Credenciales de producción configuradas
- [ ] Webhook URL actualizada en Binance Pay
- [ ] Testing de flujo completo
- [ ] Monitoreo de logs activo
- [ ] Respaldos de configuración

## Contacto

Para más información sobre la implementación:
- **Email**: support@servicedg.com
- **Documentación**: Ver código en `/api/binance/`
- **GitHub**: [Repositorio del proyecto]
