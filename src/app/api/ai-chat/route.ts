import { NextRequest, NextResponse } from 'next/server';

// Opción 1: Google Gemini (GRATIS)
async function callGemini(userMessage: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Eres un asistente especializado en el Dashboard La Casa para YouTube viewers. Tienes conocimiento completo de cómo funciona la aplicación.

=== ARQUITECTURA DE LA APLICACIÓN ===

🏗️ SISTEMA DE BLOQUES:
- Los usuarios tienen 10 bloques disponibles (Bloque 1-10)
- TODOS los bloques trabajan con la MISMA URL global del video
- Si el usuario quiere cambiar de video, cambia la URL global y afecta a todos los bloques
- Los bloques funcionan de manera paralela e independiente en términos de ejecución
- Cada bloque tiene su propia configuración: cantidad, duración (Service ID), timing
- Los usuarios pueden activar/desactivar bloques individualmente
- Cada bloque mantiene su propio historial de operaciones

⚙️ CONFIGURACIÓN DE OPERACIONES:
- URL del video: Es GLOBAL para todos los bloques (un solo campo para toda la aplicación)
- Para cambiar de video: el usuario cambia la URL global y todos los bloques usarán el nuevo video
- Cantidad de viewers: Cada bloque define su propia cantidad (ej: 100, 500, 1000)
- Service ID (duración): Cada bloque puede tener diferente duración
- Los bloques pueden ejecutarse simultáneamente o de forma escalonada
- Las operaciones tienen estados: en progreso, exitosa, fallida

🔄 OPERACIONES AUTOMÁTICAS AVANZADAS:
- Cada bloque puede configurarse con PATRONES AUTOMÁTICOS:
  • **CRECIENTE**: Empezar con pocos viewers e ir aumentando (ej: 100→200→300→500)
  • **DECRECIENTE**: Empezar con muchos viewers e ir reduciendo (ej: 500→300→200→100)
  • **CONSTANTE**: Mantener la misma cantidad en cada operación (ej: 250→250→250)
- Los usuarios pueden definir: cantidad inicial, cantidad final, incremento/decremento, intervalos
- Ideal para simular crecimiento orgánico o picos naturales de audiencia
- Cada bloque ejecuta su patrón de forma independiente

🔥 OPERACIONES AUTOMÁTICAS AVANZADAS (Funcionalidad Clave):
Cada bloque puede configurarse para ejecutar MÚLTIPLES operaciones automáticas con patrón de cantidad:

- **Número de operaciones**: Cuántas operaciones automáticas ejecutar (ej: 5 operaciones)
- **Duración**: Tiempo entre cada operación automática (ej: 3 horas)
- **Cantidad inicial**: Viewers de la primera operación (ej: 500 viewers)
- **Cantidad a modificar**: Cantidad que se suma o resta en cada operación (ej: ±100)

**EJEMPLOS DE PATRONES:**

📉 **Patrón Decreciente**: 
- Configuración: 5 operaciones, 3h duración, 500 inicial, -100 modificación
- Resultado: Op1=500, Op2=400, Op3=300, Op4=200, Op5=100 viewers
- Uso: Simular momentum natural que va bajando

📈 **Patrón Creciente**: 
- Configuración: 4 operaciones, 2h duración, 200 inicial, +150 modificación  
- Resultado: Op1=200, Op2=350, Op3=500, Op4=650 viewers
- Uso: Simular crecimiento viral progresivo

➡️ **Patrón Constante**: 
- Configuración: 6 operaciones, 4h duración, 300 inicial, +0 modificación
- Resultado: Op1=300, Op2=300, Op3=300, Op4=300, Op5=300, Op6=300 viewers
- Uso: Mantener nivel constante de viewers

Esta funcionalidad permite automatizar campañas complejas sin configurar manualmente cada operación.

📊 SERVICIOS DISPONIBLES:
- Service ID 334: 1 hora de duración (viewers temporales)
- Service ID 335: 1.5 horas de duración
- Service ID 336: 2 horas de duración  
- Service ID 337: 2.5 horas de duración
- Service ID 338: 3 horas de duración
- Service ID 459: 4 horas de duración
- Service ID 460: 6 horas de duración
- Service ID 657: 8 horas de duración (más eficiente en costo)

💰 SISTEMA DE COSTOS:
- Los costos se calculan por viewer y por duración
- Servicios más largos (6h-8h) = mejor costo por viewer
- Servicios cortos (1h-2h) = más caros pero más flexibles
- El dashboard muestra "Costo por Viewer" para optimización
- Los costos se acumulan por operación exitosa

📈 DASHBOARD Y MÉTRICAS:
- Total de operaciones ejecutadas
- Tasa de éxito (porcentaje de operaciones exitosas)
- Costo total acumulado
- Total de viewers comprados
- Métricas por bloque individual
- Historial completo de operaciones con timestamps
- Alertas automáticas para fallos o hitos importantes
- Exportación de reportes (JSON, CSV, HTML)

🔄 GESTIÓN DE BLOQUES:
- Reset de bloques: Limpia historial pero mantiene configuración
- Los usuarios pueden resetear bloques individuales
- El sistema guarda historial global para métricas
- Cada reset se registra para auditoría

⏱️ HORARIOS Y TIMING:
- Los timestamps muestran hora de inicio (formato HH:MM:SS)
- Se calcula hora de finalización estimada basada en duración
- Las operaciones se pueden programar o ejecutar inmediatamente
- El sistema rastrea horarios pico para optimización

🚨 ESTADOS Y ALERTAS:
- Operaciones exitosas: ✅ Verde, se cuentan en métricas
- Operaciones fallidas: ❌ Rojo, no generan costo
- En progreso: ⏳ Amarillo, esperando resultado
- El sistema genera alertas por alta tasa de fallo (>20%)
- Notificaciones por hitos de viewers (múltiplos de 1000)

=== TU FUNCIÓN COMO ASISTENTE ===

Ayudas a los usuarios con:

1. 🎯 ESTRATEGIAS DE VIEWERS:
   - Calcular cantidades óptimas por bloque
   - Elegir el service ID más eficiente
   - Distribuir operaciones entre múltiples bloques
   - Timing y programación de operaciones

2. 💰 OPTIMIZACIÓN DE COSTOS:
   - Recomendar servicios más económicos
   - Calcular ROI de diferentes estrategias
   - Analizar métricas de costo por viewer

3. ⚙️ CONFIGURACIÓN TÉCNICA:
   - Ayudar a configurar bloques correctamente
   - Solucionar problemas de operaciones fallidas
   - Explicar cómo usar múltiples bloques simultáneamente

4. 📊 ANÁLISIS DE DATOS:
   - Interpretar métricas del dashboard
   - Identificar patrones de éxito/fallo
   - Recomendar mejoras basadas en historial

RESPONDE SIEMPRE:
- En español, de manera amigable y profesional
- Con ejemplos prácticos específicos del dashboard
- Mencionando números de bloques, service IDs, y cantidades concretas
- Usando emojis para claridad visual
- Con consejos que el usuario pueda implementar inmediatamente

CONSULTA DEL USUARIO: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'Lo siento, no pude procesar tu consulta.';
}

// Opción 2: OpenAI API
async function callOpenAI(messages: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Opción 3: Hugging Face (gratis)
async function callHuggingFace(userMessage: string) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: userMessage,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        },
      }),
    }
  );

  const data = await response.json();
  return data.generated_text || data[0]?.generated_text || 'Lo siento, no pude procesar tu consulta.';
}

// Respuestas inteligentes locales (fallback)
function generateLocalResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  const responses = {
    viewers: {
      keywords: ['viewer', 'cuanto', 'cantidad', 'necesito', 'meta', 'objetivo'],
      response: `📊 **Calculadora de Viewers - Dashboard La Casa**:

**🎯 Para planificar tus viewers:**

1. **Define tu meta total** (ej: 2000 viewers para tu video actual)
2. **Elige estrategia de distribución entre los 10 bloques:**
   • **2-3 Bloques**: Distribución básica (recomendado para empezar)
   • **4-6 Bloques**: Distribución avanzada (mejor control)
   • **7-10 Bloques**: Para campañas masivas (uso escalonado)

3. **Todos los bloques usarán la misma URL global del video**
4. **Configura diferentes cantidades y Service IDs por bloque:**
   • Bloque 1: Service ID 336 (2h) - 800 viewers  
   • Bloque 2: Service ID 459 (4h) - 700 viewers, +30min
   • Bloque 3: Service ID 657 (8h) - 500 viewers, +1h

**💡 Ejemplo Práctico:**
Para 2000 viewers en TU VIDEO ACTUAL:
- **URL Global**: Tu video de YouTube (afecta todos los bloques)
- **Bloque 1**: 800 viewers, Service ID 459 (4h)
- **Bloque 2**: 700 viewers, Service ID 460 (6h), +30min  
- **Bloque 3**: 500 viewers, Service ID 336 (2h), +1h

¿Cuál es tu meta específica de viewers?`
    },
    
    costos: {
      keywords: ['costo', 'precio', 'dinero', 'pagar', 'barato', 'economico', 'ahorro'],
      response: `💰 **Optimización de Costos - Dashboard La Casa**:

**🥇 Servicios más eficientes** (menor costo por viewer):
1. **Service ID 657 (8h)** - Máxima eficiencia económica
2. **Service ID 460 (6h)** - Excelente balance precio/tiempo
3. **Service ID 459 (4h)** - Popular y efectivo

**💡 Estrategias de Ahorro:**
• **Usa servicios largos**: 6h-8h para campañas grandes
• **Divide operaciones**: Múltiples bloques = mejor control
• **Programa en horarios óptimos**: Evita horas pico costosas
• **Monitorea "Costo por Viewer"**: Optimiza basado en métricas

**📊 Ejemplo de Optimización:**
❌ Ineficiente: 1000 viewers en Service ID 334 (1h)
✅ Eficiente: 1000 viewers en Service ID 657 (8h)
💰 Ahorro: Hasta 40% menos costo por viewer

**� En el Dashboard revisa:**
- Métrica "Costo por Viewer" 
- Comparativa por Service ID
- Historial de operaciones exitosas

¿Quieres que calcule el costo óptimo para tu campaña?`
    },
    
    estrategia: {
      keywords: ['estrategia', 'crecer', 'canal', 'youtube', 'consejos', 'plan', 'campana'],
      response: `🚀 **Estrategias Avanzadas - Dashboard La Casa**:

**🎯 Estrategia Multi-Bloque (Recomendada):**
• **Semana 1**: Configurar 2-3 bloques para tu video actual (200-300 viewers c/u)
• **Semana 2**: Escalar a 4-5 bloques para el mismo video (400-500 viewers)  
• **Cambio de video**: Actualizar URL global y ajustar estrategia
• **Mes 2+**: Optimizar basado en métricas del dashboard

**⏰ Timing Perfecto para UN VIDEO:**
• **Publicar video** → **Cambiar URL global** → Esperar 15-30min 
• **Activar Bloque 1** (cantidad inicial)
• **+30min** → **Activar Bloque 2** (Service ID diferente)
• **+1h** → **Activar Bloque 3** para sostener momentum

**🎬 Workflow por Video:**
1. **Video Nuevo**: Actualizar URL global en el dashboard
2. **Configurar bloques**: Diferentes cantidades/duraciones para el mismo video
3. **Ejecutar escalonado**: No todos los bloques a la vez
4. **Siguiente video**: Cambiar URL global y repetir proceso

**� Configuración por Tipo de Canal:**
• **Nuevo canal**: 100-300 viewers, Service ID 336-459
• **Canal establecido**: 500-1000 viewers, Service ID 459-460
• **Canal grande**: 1000+ viewers, Service ID 460-657

**📈 Escalamiento Inteligente:**
1. **Analizar métricas** en dashboard después de cada campaña
2. **Replicar bloques exitosos** (alta tasa de éxito)
3. **Ajustar Service IDs** basado en costo por viewer
4. **Usar múltiples videos** para distribución de riesgo

**🎨 Distribución Creativa:**
- Video principal: 60% de viewers totales
- Videos secundarios: 40% distribuidos

¿Qué tipo de canal tienes? ¿Nuevo o establecido?`
    },
    
    bloques: {
      keywords: ['bloque', 'configurar', 'setup', 'como', 'operacion', 'ejecutar'],
      response: `⚙️ **Guía Completa de Bloques - Dashboard La Casa**:

**🏗️ Sistema de Bloques (1-10 disponibles):**
• Cada bloque = 1 operación independiente para la URL global
• TODOS los bloques usan la MISMA URL del video (configuración global)
• Para cambiar de video: actualizar la URL global (afecta todos los bloques)
• Pueden ejecutarse simultáneamente o programados

**🔧 Configuración Paso a Paso:**
1. **Configurar URL Global**: Una sola URL para todos los bloques
2. **Seleccionar Bloque** (ej: Bloque 3)  
3. **Cantidad**: Número de viewers para este bloque específico
4. **Service ID**: Duración deseada (336, 459, 460, 657)
5. **Activar**: Ejecutar inmediatamente o programar

**� OPERACIONES AUTOMÁTICAS AVANZADAS:**

**📈 PATRÓN CRECIENTE** (Simula crecimiento orgánico):
- Bloque 1: 100 viewers → 200 → 350 → 500 (automático)
- Bloque 2: 150 viewers → 300 → 450 → 600 (automático)
- **Uso**: Videos nuevos, estrenos, contenido viral

**📉 PATRÓN DECRECIENTE** (Simula picos naturales):
- Bloque 3: 800 viewers → 600 → 400 → 200 (automático)
- Bloque 4: 500 viewers → 350 → 200 → 100 (automático)
- **Uso**: Eventos en vivo, tendencias que decaen

**📊 PATRÓN CONSTANTE** (Audiencia estable):
- Bloque 5: 300 viewers → 300 → 300 → 300 (automático)
- **Uso**: Mantener posicionamiento, audiencia base

**💡 Configuraciones Recomendadas:**

**Para 1 Video (Estrategia Automática Combinada):**
- **URL Global**: Tu video de YouTube
- **Bloque 1**: Patrón CRECIENTE (100→500 viewers, Service ID 459)
- **Bloque 2**: Patrón CONSTANTE (300 viewers, Service ID 336)
- **Bloque 3**: Patrón DECRECIENTE (600→200 viewers, Service ID 460)

**🚨 Mejores Prácticas:**
• **Combina patrones**: Creciente + Constante + Decreciente
• **Monitorea estado**: ✅ Exitoso, ❌ Fallido, ⏳ En progreso
• **Los patrones son independientes**: Cada bloque ejecuta su propio patrón
• **Reset solo si necesario**: Limpia historial pero mantiene config

**📊 Seguimiento:**
- Cada bloque muestra su propia tasa de éxito
- Timestamps de inicio y finalización estimada
- Costo individual por bloque
- Progreso del patrón automático

¿Qué configuración específica necesitas ayuda?`
    },
    
    automatico: {
      keywords: ['automatico', 'patron', 'creciente', 'decreciente', 'progresivo', 'escalon'],
      response: `🔄 **Patrones Automáticos Avanzados - Dashboard La Casa**:

**🤖 SISTEMA DE OPERACIONES AUTOMÁTICAS:**
Los bloques pueden ejecutar secuencias automáticas sin intervención manual.

**📈 PATRÓN CRECIENTE** (Crecimiento Orgánico):

Bloque 1: 100 > 200 > 350 > 500 > 700 viewers
Bloque 2: 50 > 100 > 200 > 400 > 600 viewers

• **Ideal para**: Videos nuevos, lanzamientos, contenido viral
• **Incremento configurable**: +50, +100, +150 por operación
• **Timing**: Cada operación separada por intervalos definidos

**📉 PATRÓN DECRECIENTE** (Picos Naturales):

Bloque 3: 1000 > 750 > 500 > 300 > 150 viewers
Bloque 4: 800 > 600 > 400 > 250 > 100 viewers

• **Ideal para**: Eventos en vivo, tendencias que decaen
• **Decremento configurable**: -250, -200, -150 por operación
• **Simula**: Comportamiento real de audiencia

**📊 PATRÓN CONSTANTE** (Estabilidad):

Bloque 5: 300 > 300 > 300 > 300 > 300 viewers
Bloque 6: 500 > 500 > 500 > 500 > 500 viewers

• **Ideal para**: Mantener posicionamiento, audiencia base
• **Consistencia**: Misma cantidad en cada ejecución

**🎯 ESTRATEGIA COMBINADA EJEMPLAR:**

**Para UN VIDEO (URL Global):**
- **Bloque 1**: Creciente 100>500 (Service ID 459) - Arranque orgánico
- **Bloque 2**: Creciente 200>800 (Service ID 460) - Momentum principal  
- **Bloque 3**: Constante 400 (Service ID 336) - Estabilidad base
- **Bloque 4**: Decreciente 600>200 (Service ID 657) - Pico natural
- **Bloque 5**: Constante 250 (Service ID 459) - Sostén final

**⚙️ CONFIGURACIÓN PRÁCTICA:**
1. **Definir patrón** por bloque (creciente/decreciente/constante)
2. **Cantidad inicial y final** (ej: 100>500)
3. **Incremento/decremento** (ej: +75 cada operación)
4. **Intervalo entre operaciones** (ej: cada 2 horas)
5. **Service ID** (duración de cada operación individual)

**📋 VENTAJAS DEL SISTEMA:**
• **Comportamiento realista**: Simula audiencia orgánica
• **Múltiples estrategias simultáneas**: 10 bloques = 10 patrones diferentes
• **Set & Forget**: Una vez configurado, se ejecuta automáticamente
• **Flexibilidad total**: Cada bloque con su propio patrón

¿Quieres que te ayude a diseñar una estrategia automática específica?`
    },
    
    metricas: {
      keywords: ['métrica', 'dashboard', 'análisis', 'datos', 'estadística', 'tasa', 'exito'],
      response: `📊 **Análisis Completo de Métricas - Dashboard La Casa**:

**🎯 Métricas Críticas del Dashboard:**

**1. Tasa de Éxito** (Más importante):
• **>90%**: Excelente configuración
• **80-89%**: Buena, pero optimizable  
• **70-79%**: Revisar configuración
• **<70%**: Problemas críticos - revisar URLs/configuración

**2. Costo por Viewer**:
• Métrica clave para optimización
• Compara entre Service IDs
• Objetivo: Reducir constantemente

**3. Total de Operaciones**:
• Historial completo de todos los bloques
• Incluye exitosas + fallidas
• Útil para planificar presupuestos

**📈 Análisis por Bloque:**
• Cada bloque muestra rendimiento individual
• Identifica bloques más exitosos
• Replica configuraciones ganadoras

**🔍 Alertas del Sistema:**
• **🔴 Tasa alta de fallo (>20%)**: Revisar configuración
• **🟡 Costos elevados**: Considerar Service IDs más largos
• **🟢 Hitos alcanzados**: Celebrar múltiplos de 1000 viewers

**📋 Reportes Exportables:**
• **JSON**: Datos completos para análisis
• **CSV**: Para Excel y análisis estadístico
• **HTML**: Reporte ejecutivo visual

**💡 Interpretación Práctica:**
Si tu tasa de éxito baja:
1. Verificar URLs de videos (deben ser públicos)
2. Reducir cantidades por operación
3. Usar Service IDs más conservadores (4h-6h)
4. Espaciar operaciones en el tiempo

**🎯 Optimization Tips:**
- Exportar reporte semanal
- Comparar costos por Service ID
- Identificar horarios más exitosos
- Replicar configuraciones con >95% éxito

¿Qué métrica específica te preocupa o quieres optimizar?`
    },
    
    problemas: {
      keywords: ['error', 'fallo', 'problema', 'no funciona', 'ayuda', 'arreglar'],
      response: `🚨 **Solución de Problemas - Dashboard La Casa**:

**❌ Operaciones Fallidas - Causas Comunes:**

**1. URL del Video:**
• ✅ Debe ser público en YouTube
• ❌ Videos privados/eliminados fallan
• 🔧 Verificar: Abrir URL en ventana incógnita

**2. Configuración de Cantidad:**
• ❌ Cantidades muy altas pueden fallar
• ✅ Empezar con 100-500 viewers
• 🔧 Dividir en múltiples bloques si necesitas más

**3. Service ID Problemático:**
• ❌ Service IDs cortos (1h-2h) más propensos a fallos
• ✅ Usar Service ID 459 (4h) o 460 (6h) para estabilidad
• 🔧 Cambiar a duración más larga

**4. Sobrecarga del Sistema:**
• ❌ Muchos bloques simultáneos
• ✅ Máximo 3-4 bloques activos
• 🔧 Espaciar operaciones 15-30min

**🔧 Pasos de Diagnóstico:**
1. **Revisar Dashboard**: ¿Qué bloques fallan más?
2. **Verificar URLs**: ¿Son videos públicos recientes?
3. **Analizar cantidades**: ¿Son realistas para el canal?
4. **Revisar timing**: ¿Muchas operaciones simultáneas?

**📊 Si tu Tasa de Éxito <80%:**
• **Reset bloques problemáticos**
• **Reducir cantidades a 200-400 viewers**
• **Usar Service ID 459 (4h) exclusivamente**
• **Espaciar operaciones mínimo 30min**

**🚀 Configuración de Emergencia (Alta Confiabilidad):**
- **Bloque 1**: 300 viewers, Service ID 459 (4h)
- Esperar resultado exitoso antes de continuar
- **Bloque 2**: 250 viewers, Service ID 460 (6h), +45min

**💡 Prevención de Problemas:**
• Probar con cantidades pequeñas primero
• Usar videos con engagement orgánico
• No saturar el sistema con muchos bloques
• Monitorear métricas constantemente

¿Qué error específico estás experimentando?`
    }
  };

  // Buscar la categoría más relevante
  for (const [category, data] of Object.entries(responses)) {
    if (data.keywords.some(keyword => input.includes(keyword))) {
      return data.response;
    }
  }

  // Respuesta general
  return `🤖 **¡Hola! Soy tu Asistente Especializado en Dashboard La Casa**

**🏗️ Sistema de Bloques:** Tienes 10 bloques disponibles que trabajan con la URL global del video

**🎯 Puedo ayudarte con:**

**📊 Planificación de Campañas:**
• "Necesito 2000 viewers para mi video, ¿cómo los distribuyo?"
• "¿Cuántos bloques usar para 5 videos diferentes?"
• "¿Qué Service ID es mejor para mi estrategia?"

**💰 Optimización de Costos:**
• "¿Cuál es el Service ID más económico?"
• "¿Cómo reducir mi costo por viewer?"
• "¿Conviene usar Service ID 657 (8h) o 459 (4h)?"

**⚙️ Configuración Técnica:**
• "¿Cómo configurar el Bloque 3 correctamente?"
• "¿Puedo ejecutar 5 bloques simultáneamente?"
• "Mi tasa de éxito es 70%, ¿qué hago?"

**� Análisis de Métricas:**
• "¿Qué significan mis métricas del dashboard?"
• "¿Por qué mis operaciones fallan?"
• "¿Cómo interpretar la tasa de éxito por bloque?"

**🚀 Estrategias Avanzadas:**
• "¿Cómo hacer crecer mi canal con múltiples bloques?"
• "¿Cuál es el timing perfecto para activar operaciones?"
• "¿Cómo escalar de 500 a 2000 viewers por video?"

**🔧 Solución de Problemas:**
• "El Bloque 2 siempre falla, ¿por qué?"
• "¿Debo resetear un bloque con baja tasa de éxito?"
• "¿Cómo configurar operaciones más confiables?"

**💡 Ejemplos de consultas específicas:**
• "Quiero 1500 viewers en 3 videos, ¿cómo uso los bloques?"
• "Mi Service ID 336 tiene 80% éxito pero Service ID 459 tiene 95%, ¿cambio?"
• "¿Es mejor 1 bloque con 1000 viewers o 3 bloques con 333 cada uno?"

¿En qué aspecto específico del Dashboard La Casa necesitas ayuda? 😊`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Formato de mensajes inválido' },
        { status: 400 }
      );
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    let response: string;

    // Prioridad: Gemini (gratis) > OpenAI (pago) > Hugging Face (gratis) > Local
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log('🟢 Usando Gemini API (gratis)');
        response = await callGemini(userMessage);
      } else if (process.env.OPENAI_API_KEY) {
        console.log('🟡 Usando OpenAI API (pago)');
        response = await callOpenAI(messages);
      } else if (process.env.HUGGINGFACE_API_KEY) {
        console.log('🟠 Usando Hugging Face API (gratis)');
        response = await callHuggingFace(userMessage);
      } else {
        throw new Error('No API keys configured');
      }
    } catch (error) {
      console.log('🔴 API externa falló, usando respuestas locales:', error);
      response = generateLocalResponse(userMessage);
    }

    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Error en AI chat API:', error);
    
    return NextResponse.json(
      { 
        response: '❌ Lo siento, hubo un error. ¿Podrías intentar reformular tu pregunta?' 
      },
      { status: 500 }
    );
  }
}