import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { amount, description, email, whatsapp, customerName, timestamp } = await request.json();

    // Validaciones
    if (!amount || !email || !whatsapp || !customerName) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Datos de la solicitud
    const requestData = {
      customerName,
      email,
      whatsapp: `+${whatsapp}`,
      amount: parseFloat(amount),
      description,
      timestamp,
      id: `takenos-${Date.now()}`,
    };

    console.log('Nueva solicitud de pago Takenos:', requestData);

    // Email para el administrador (tu email)
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed; text-align: center;">💰 Nueva Solicitud de Pago - Takenos</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Detalles del Cliente</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 30%;">Nombre:</td>
              <td style="padding: 8px 0;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td>
              <td style="padding: 8px 0;">+${whatsapp}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Monto:</td>
              <td style="padding: 8px 0; color: #059669; font-size: 18px; font-weight: bold;">$${amount} USD</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Servicio:</td>
              <td style="padding: 8px 0;">${description}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">ID Solicitud:</td>
              <td style="padding: 8px 0; font-family: monospace;">${requestData.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Fecha:</td>
              <td style="padding: 8px 0;">${new Date(timestamp).toLocaleString('es-AR')}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">⚡ Acciones a Realizar:</h4>
          <ol style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Crear link de pago en Takenos por $${amount} USD</li>
            <li>Enviar link al email: <strong>${email}</strong></li>
            <li>Enviar link por WhatsApp: <strong>+${whatsapp}</strong></li>
            <li>Confirmar recepción con el cliente</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/${whatsapp}?text=Hola%20${encodeURIComponent(customerName)},%20te%20enviamos%20el%20link%20de%20pago%20de%20Takenos%20por%20$${amount}%20USD" 
             style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
            📱 Abrir WhatsApp
          </a>
          <a href="mailto:${email}?subject=Link%20de%20Pago%20Takenos%20-%20ServiceDG&body=Hola%20${encodeURIComponent(customerName)},%0A%0ATe%20enviamos%20el%20link%20de%20pago%20de%20Takenos%20por%20$${amount}%20USD." 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
            📧 Enviar Email
          </a>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          ServiceDG - Sistema de Pagos Automatizado
        </p>
      </div>
    `;

    // Email de confirmación para el cliente
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed; text-align: center;">✅ Solicitud de Pago Recibida</h2>
        
        <p>Hola <strong>${customerName}</strong>,</p>
        
        <p>Hemos recibido tu solicitud de pago y la estamos procesando.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Resumen de tu solicitud:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Monto:</strong> $${amount} USD</li>
            <li style="padding: 5px 0;"><strong>Servicio:</strong> ${description}</li>
            <li style="padding: 5px 0;"><strong>Email:</strong> ${email}</li>
            <li style="padding: 5px 0;"><strong>WhatsApp:</strong> +${whatsapp}</li>
          </ul>
        </div>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #059669; margin: 0 0 10px 0;">📱 Próximos pasos:</h4>
          <ol style="color: #065f46; margin: 0; padding-left: 20px;">
            <li>Te enviaremos el link de pago de Takenos por email</li>
            <li>También te contactaremos por WhatsApp</li>
            <li>Podrás pagar con cualquier tarjeta en dólares</li>
            <li>Tiempo estimado: 15-30 minutos</li>
          </ol>
        </div>

        <p style="color: #6b7280;">
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>

        <p style="color: #6b7280;">
          Saludos,<br>
          <strong>Equipo ServiceDG</strong>
        </p>

        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          ServiceDG - Análisis de Datos Profesional
        </p>
      </div>
    `;

    // 📱 ENVIAR WHATSAPP AUTOMÁTICO
    if (process.env.ADMIN_WHATSAPP) {
      try {
        const whatsappMessage = `🚨 NUEVA SOLICITUD TAKENOS 🚨
        
👤 Cliente: ${customerName}
📧 Email: ${email}
📱 WhatsApp: +${whatsapp}
💰 Monto: $${amount} USD
🛍️ Servicio: ${description}
🆔 ID: ${requestData.id}
📅 ${new Date(timestamp).toLocaleString('es-AR')}

⚡ ACCIONES:
1. Crear link Takenos por $${amount} USD
2. Enviar a: ${email}
3. WhatsApp: +${whatsapp}`;

        let whatsappSent = false;

        // Opción 1: UltraMsg (más confiable)
        if (process.env.ULTRAMSG_TOKEN && process.env.ULTRAMSG_INSTANCE_ID) {
          try {
            const ultramsgUrl = `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`;
            const ultramsgResponse = await axios.post(ultramsgUrl, {
              token: process.env.ULTRAMSG_TOKEN,
              to: process.env.ADMIN_WHATSAPP,
              body: whatsappMessage
            });
            console.log('✅ WhatsApp enviado vía UltraMsg');
            whatsappSent = true;
          } catch (ultramsgError) {
            console.log('❌ Error con UltraMsg:', ultramsgError instanceof Error ? ultramsgError.message : ultramsgError);
          }
        }

        // Opción 2: WhatsMate (alternativa)
        if (!whatsappSent && process.env.WHATSMATE_CLIENT_ID && process.env.WHATSMATE_CLIENT_SECRET) {
          try {
            const whatsmateUrl = 'https://api.whatsmate.net/v3/whatsapp/single/text/message/1';
            const whatsmateResponse = await axios.post(whatsmateUrl, {
              number: process.env.ADMIN_WHATSAPP,
              message: whatsappMessage
            }, {
              headers: {
                'X-WM-CLIENT-ID': process.env.WHATSMATE_CLIENT_ID,
                'X-WM-CLIENT-SECRET': process.env.WHATSMATE_CLIENT_SECRET,
                'Content-Type': 'application/json'
              }
            });
            console.log('✅ WhatsApp enviado vía WhatsMate');
            whatsappSent = true;
          } catch (whatsmateError) {
            console.log('❌ Error con WhatsMate:', whatsmateError instanceof Error ? whatsmateError.message : whatsmateError);
          }
        }

        // Opción 3: Twilio (más profesional)
        if (!whatsappSent && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          try {
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
            const twilioResponse = await axios.post(twilioUrl, 
              new URLSearchParams({
                'From': `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                'To': `whatsapp:${process.env.ADMIN_WHATSAPP}`,
                'Body': whatsappMessage
              }),
              {
                auth: {
                  username: process.env.TWILIO_ACCOUNT_SID,
                  password: process.env.TWILIO_AUTH_TOKEN
                }
              }
            );
            console.log('✅ WhatsApp enviado vía Twilio');
            whatsappSent = true;
          } catch (twilioError) {
            console.log('❌ Error con Twilio:', twilioError instanceof Error ? twilioError.message : twilioError);
          }
        }

        if (!whatsappSent) {
          console.log('⚠️ No se pudo enviar WhatsApp - revisar configuración');
        }

      } catch (whatsappError) {
        console.log('❌ Error general enviando WhatsApp:', whatsappError instanceof Error ? whatsappError.message : whatsappError);
      }
    }

    // 📧 ENVIAR EMAIL AUTOMÁTICO
    // Logs detallados para el administrador
    console.log('🚨 NUEVA SOLICITUD DE PAGO TAKENOS 🚨');
    console.log('================================================');
    console.log('👤 Cliente:', customerName);
    console.log('📧 Email:', email);
    console.log('📱 WhatsApp:', `+${whatsapp}`);
    console.log('💰 Monto:', `$${amount} USD`);
    console.log('🛍️ Servicio:', description);
    console.log('🆔 ID:', requestData.id);
    console.log('📅 Fecha:', new Date(timestamp).toLocaleString('es-AR'));
    console.log('================================================');
    console.log('📱 ENVIAR WHATSAPP A: +' + whatsapp);
    console.log('💬 MENSAJE: Hola ' + customerName + ', te enviamos el link de pago de Takenos por $' + amount + ' USD');
    console.log('================================================');

    // Enviar email al administrador SOLO si está configurado
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL) {
      try {
        await transporter.sendMail({
          from: `"ServiceDG Pagos" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `🚨 Nueva Solicitud Takenos: $${amount} USD - ${customerName}`,
          html: adminEmailContent,
        });
        console.log('✅ Email enviado al administrador');
      } catch (emailError) {
        console.log('❌ Error enviando email al admin (continuando sin email):', emailError instanceof Error ? emailError.message : emailError);
      }
    } else {
      console.log('⚠️ Email no configurado - Solo usando logs de consola');
    }

    // Enviar email de confirmación al cliente SOLO si está configurado
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"ServiceDG" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Solicitud de Pago Recibida - ServiceDG',
          html: customerEmailContent,
        });
        console.log('✅ Email de confirmación enviado al cliente');
      } catch (emailError) {
        console.log('❌ Error enviando email al cliente (continuando sin email):', emailError instanceof Error ? emailError.message : emailError);
      }
    } else {
      console.log('⚠️ Email no configurado - Cliente no recibió confirmación por email');
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud procesada correctamente',
      requestId: requestData.id
    });

  } catch (error) {
    console.error('Error processing Takenos request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
