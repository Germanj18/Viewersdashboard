# 🚀 NOTIFICACIONES AUTOMÁTICAS - OPCIONES CONFIABLES

## 📱 **OPCIÓN 1: UltraMsg (MÁS FÁCIL Y CONFIABLE)**

### 🎯 **Configuración súper fácil:**

1. **Ve a**: [ultramsg.com](https://ultramsg.com/)
2. **Regístrate gratis** con tu email
3. **Conecta tu WhatsApp**: 
   - Escanea el código QR con tu WhatsApp
   - Autoriza la conexión
4. **Obtén tus datos**:
   - `Instance ID`: aparece en tu dashboard
   - `Token`: lo generas en la sección "API Token"

5. **Configura tu `.env`**:
   ```bash
   ADMIN_WHATSAPP="+541121565335"
   ULTRAMSG_TOKEN="tu-token-aqui"
   ULTRAMSG_INSTANCE_ID="tu-instance-id-aqui"
   ```

### ✅ **Ventajas:**
- ✅ **Gratis** hasta 100 mensajes/día
- ✅ **Confiable** - siempre funciona
- ✅ **Fácil** - solo escanear QR
- ✅ **Rápido** - mensajes instantáneos

---

## 📧 **OPCIÓN 2: Email con Gmail (ALTERNATIVA)**

### **Si prefieres email en lugar de WhatsApp:**

1. **Activa verificación en 2 pasos en Gmail**
2. **Genera contraseña de aplicación**:
   - Ve a: [security.google.com](https://security.google.com)
   - Busca "Contraseñas de aplicaciones"
   - Genera una para "Correo"
3. **Configura tu `.env`**:
   ```bash
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="tu-email@gmail.com"
   SMTP_PASS="tu-contraseña-de-aplicacion"
   ADMIN_EMAIL="tu-email@gmail.com"
   ```

---

## 📧 **OPCIÓN 3: Email con Resend (MÁS FÁCIL)**

### **Email sin complicaciones:**

1. **Ve a**: [resend.com](https://resend.com)
2. **Regístrate gratis**
3. **Crea API key**
4. **Configura tu `.env`**:
   ```bash
   SMTP_HOST="smtp.resend.com"
   SMTP_USER="resend"
   SMTP_PASS="re_tu-api-key"
   ADMIN_EMAIL="tu-email@gmail.com"
   ```

---

## 🎯 **RECOMENDACIÓN: UltraMsg**

**Para recibir notificaciones automáticas por WhatsApp:**

1. **Regístrate en UltraMsg** (2 minutos)
2. **Conecta tu WhatsApp** (escanear QR)
3. **Copia tus credenciales**
4. **Ponlas en tu `.env`**
5. **¡Listo!** Recibirás WhatsApp automático

---

## 📋 **Archivo .env mínimo:**

```bash
# Solo para WhatsApp (RECOMENDADO)
ADMIN_WHATSAPP="+541121565335"
ULTRAMSG_TOKEN="tu-token-de-ultramsg"
ULTRAMSG_INSTANCE_ID="tu-instance-id"

# O solo para Email
SMTP_HOST="smtp.resend.com"
SMTP_USER="resend"
SMTP_PASS="re_tu-api-key"
ADMIN_EMAIL="tu-email@gmail.com"
```

---

## 🎉 **Mensaje que recibirás:**

```
🚨 NUEVA SOLICITUD PAYONEER 🚨

👤 Cliente: Juan Pérez
📧 Email: juan@email.com
📱 WhatsApp: +541123456789
💰 Monto: $100 USD
🛍️ Servicio: Análisis de Datos
🆔 ID: payoneer-1234567890
📅 4/7/2025 15:30:00

⚡ ACCIONES:
1. Crear link Payoneer por $100 USD
2. Enviar a: juan@email.com
3. WhatsApp: +541123456789
```

**¿Quieres configurar UltraMsg ahora?** 🚀
