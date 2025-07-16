import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, email, whatsapp, customerName, timestamp } = await request.json();

    // Validar datos requeridos
    if (!amount || !email || !whatsapp || !customerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Configurar el transportador de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Preparar el contenido del email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    const adminWhatsApp = process.env.ADMIN_WHATSAPP || '+1234567890';

    const emailContent = `
      Nueva Solicitud de Pago - Takenos/Payoneer
      
      📋 DETALLES DE LA SOLICITUD:
      • Cliente: ${customerName}
      • Email: ${email}
      • WhatsApp: +${whatsapp}
      • Monto: $${amount} USD
      • Servicio: ${description}
      • Fecha: ${new Date(timestamp).toLocaleString('es-ES')}
      
      🎯 PRÓXIMOS PASOS:
      1. Contactar al cliente por WhatsApp: +${whatsapp}
      2. Enviar link personalizado de Payoneer
      3. Confirmar el pago una vez completado
      
      ⚡ Tiempo de respuesta esperado: 15-30 minutos
    `;

    // Enviar email al administrador
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `💰 Nueva Solicitud Payoneer - $${amount} USD - ${customerName}`,
      text: emailContent,
    });

    // Aquí podrías integrar con la API de CallMeBot para WhatsApp si está configurada
    if (process.env.CALLMEBOT_API_KEY && adminWhatsApp) {
      try {
        const whatsappMessage = encodeURIComponent(
          `🚨 Nueva solicitud de pago Payoneer:\n` +
          `💰 Monto: $${amount} USD\n` +
          `👤 Cliente: ${customerName}\n` +
          `📧 Email: ${email}\n` +
          `📱 WhatsApp: +${whatsapp}\n` +
          `⏰ ${new Date().toLocaleString('es-ES')}`
        );

        // Enviar notificación por WhatsApp (usando CallMeBot o similar)
        await fetch(
          `https://api.callmebot.com/whatsapp.php?phone=${adminWhatsApp.replace('+', '')}&text=${whatsappMessage}&apikey=${process.env.CALLMEBOT_API_KEY}`
        );
      } catch (whatsappError) {
        console.warn('Error enviando WhatsApp:', whatsappError);
        // No fallar si WhatsApp falla, solo el email es crítico
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente',
    });

  } catch (error) {
    console.error('Error procesando solicitud Takenos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
