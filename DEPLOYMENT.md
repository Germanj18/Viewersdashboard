# Guía de Deployment para Vercel

## Variables de Entorno Requeridas en Vercel

Asegúrate de configurar estas variables en tu dashboard de Vercel:

### Base de Datos
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

### NextAuth
```
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Mercado Pago
```
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-production-token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your-mercadopago-production-public-key
```

### Stripe
```
STRIPE_SECRET_KEY=sk_live_your-stripe-production-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-production-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-production-webhook-secret
```

### Configuración General
```
NODE_ENV=production
```

## Pasos para Deploy

1. **Conecta tu repositorio** con Vercel
2. **Configura las variables de entorno** en Project Settings > Environment Variables
3. **Verifica la base de datos** esté accesible desde Vercel
4. **Deploy automáticamente** se ejecutará en cada push a main

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL accesible
- [ ] Claves de Stripe en modo producción
- [ ] Claves de Mercado Pago en modo producción
- [ ] NEXTAUTH_URL apunta al dominio correcto
- [ ] Build local exitoso (`npm run build`)

## Troubleshooting

Si el deploy falla:

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las variables estén configuradas
3. Asegúrate de que la base de datos esté accesible
4. Verifica que las dependencias estén instaladas correctamente

## URLs Importantes

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Mercado Pago Developers**: https://www.mercadopago.com.ar/developers
