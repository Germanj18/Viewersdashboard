# ServiceDG Dashboard - Sistema de Pagos

Dashboard profesional para servicios de análisis de datos con sistema de pagos integrado usando Mercado Pago y Stripe.

## 🚀 Características

- **Dashboard de Analytics**: Visualización de datos y métricas
- **Sistema de Pagos Dual**:
  - **Mercado Pago**: Pagos en ARS con checkout oficial
  - **Stripe**: Pagos en USD con tarjetas internacionales
- **Autenticación**: Sistema seguro con NextAuth
- **UI Moderna**: Interfaz responsive con soporte para modo oscuro
- **Base de Datos**: PostgreSQL con Prisma ORM

## 🛠️ Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y configura las variables:

```bash
cp .env.example .env.local
```

#### Variables Requeridas:

```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="your-mercadopago-access-token"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="your-mercadopago-public-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
```

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 💳 Configuración de Pagos

### Mercado Pago

1. Crea una cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén tus credenciales de prueba/producción
3. Configura las variables `MERCADOPAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

**Características:**
- Pagos en pesos argentinos (ARS)
- Checkout oficial de Mercado Pago
- Soporte para todos los métodos de pago locales
- Financiación disponible

### Stripe

1. Crea una cuenta en [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtén tus claves API de prueba/producción
3. Configura las variables `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Características:**
- Pagos en dólares estadounidenses (USD)
- Tarjetas de crédito/débito internacionales
- Procesamiento global
- Máxima seguridad

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/           # Panel administrativo
│   ├── api/             # APIs del backend
│   │   ├── mercadopago/ # APIs de Mercado Pago
│   │   └── stripe/      # APIs de Stripe
│   ├── components/      # Componentes React
│   ├── pago/           # Páginas de pago
│   └── lib/            # Utilidades
├── public/             # Archivos estáticos
└── migrations/         # Migraciones de base de datos
```

## 🚀 Despliegue

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue:

- **Vercel**: Ve a Project Settings > Environment Variables
- **Railway**: Usa el dashboard de Railway
- **Heroku**: Usa `heroku config:set`

### Consideraciones de Seguridad

1. **Nunca** expongas las claves secretas en el frontend
2. Usa HTTPS en producción
3. Valida todos los pagos en el backend
4. Implementa webhooks para confirmación de pagos

## 🧪 Testing

### Tarjetas de Prueba Mercado Pago:
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 7557 3453 0604

### Tarjetas de Prueba Stripe:
- **Visa**: 4242 4242 4242 4242
- **Visa (Declined)**: 4000 0000 0000 0002
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

**Notas importantes:**
- Usa cualquier fecha futura para expiración (ej: 12/34)
- Usa cualquier CVC de 3 dígitos (ej: 123)
- En el estado de cuenta aparecerá como "*SERVICEDG"

## 📞 Soporte

Para soporte técnico, contacta a ServiceDG.

---

**ServiceDG** - Soluciones profesionales de análisis de datos
