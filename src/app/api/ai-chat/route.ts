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
          text: `Eres un asistente especializado en el Dashboard La Casa para YouTube viewers. 

INFORMACIÓN DEL SISTEMA:
- Es un dashboard para comprar viewers de YouTube
- Los servicios disponibles son:
  * Service ID 334: 1 hora - viewers temporales
  * Service ID 335: 1.5 horas - viewers temporales  
  * Service ID 336: 2 horas - viewers temporales
  * Service ID 337: 2.5 horas - viewers temporales
  * Service ID 338: 3 horas - viewers temporales
  * Service ID 459: 4 horas - viewers temporales
  * Service ID 460: 6 horas - viewers temporales
  * Service ID 657: 8 horas - viewers temporales
- Los costos varían según la cantidad y duración
- Los usuarios pueden configurar múltiples bloques para diferentes videos

INSTRUCCIONES:
- Responde en español de manera amigable y profesional
- Da consejos específicos y prácticos
- Si preguntan sobre cálculos, proporciona ejemplos concretos
- Mantén las respuestas concisas pero informativas
- Usa emojis ocasionalmente para hacer la conversación más amigable

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
      keywords: ['viewer', 'cuanto', 'cantidad', 'necesito'],
      response: `📊 **Calculadora de Viewers**:

Para determinar cuántos viewers necesitas:

1. **Define tu meta** (ej: 1000 viewers totales)
2. **Elige la duración** según tu estrategia:
   • 1-2h: Impacto rápido, mayor costo
   • 4-6h: Balance costo-beneficio
   • 8h: Máxima eficiencia de costo

3. **Divide entre bloques**: Recomiendo 2-3 bloques para mejor control

💡 **Ejemplo**: Para 1000 viewers en 4h, usa 2 bloques de 500 viewers cada uno con Service ID 459.

¿Tienes una meta específica? ¡Puedo hacer el cálculo exacto!`
    },
    
    costos: {
      keywords: ['costo', 'precio', 'dinero', 'pagar', 'barato'],
      response: `💰 **Optimización de Costos**:

**Servicios más eficientes** (menor costo por viewer):
1. 🥇 Service ID 657 (8h) - Máxima eficiencia
2. 🥈 Service ID 460 (6h) - Buen balance
3. 🥉 Service ID 459 (4h) - Opción popular

**Tips para ahorrar**:
• Usa servicios largos (6h-8h) cuando sea posible
• Programa en horarios de menor demanda
• Divide grandes cantidades en múltiples operaciones

📊 Revisa tu "Costo por Viewer" en el dashboard para optimizar.

¿Quieres que calcule el costo para una campaña específica?`
    },
    
    estrategia: {
      keywords: ['estrategia', 'crecer', 'canal', 'youtube', 'consejos'],
      response: `🚀 **Estrategias de Crecimiento en YouTube**:

**🎯 Estrategia Básica**:
• Consistencia > Cantidad masiva
• 100-500 viewers por video regularmente
• Combina con contenido de calidad

**⏰ Timing Perfecto**:
• Publica cuando tu audiencia esté activa
• Programa viewers 30min después de publicar
• Usa servicios de 2-4h para mantener momentum

**📈 Escalamiento**:
1. Semana 1-2: 100-200 viewers por video
2. Semana 3-4: 300-500 viewers
3. Mes 2+: 500-1000+ según resultados

¿Quieres que diseñemos una estrategia personalizada para tu canal?`
    },
    
    bloques: {
      keywords: ['bloque', 'configurar', 'setup', 'como'],
      response: `⚙️ **Configuración Perfecta de Bloques**:

**🔧 Setup Básico**:
1. **URL**: Asegúrate que el video sea público
2. **Cantidad**: Divide entre 2-3 bloques para control
3. **Service ID**: Elige según tu estrategia temporal
4. **Programación**: Escalonamiento de 15-30 min

**💡 Ejemplo de Configuración**:
• Bloque 1: 400 viewers, Service ID 459 (4h)
• Bloque 2: 350 viewers, Service ID 459 (4h), +20min
• Bloque 3: 250 viewers, Service ID 336 (2h), +40min

**🚨 Mejores Prácticas**:
• No uses todos los bloques simultáneamente
• Varía las cantidades para parecer natural
• Monitorea el dashboard para ajustar

¿Necesitas ayuda configurando algo específico?`
    },
    
    metricas: {
      keywords: ['métrica', 'dashboard', 'análisis', 'datos', 'estadística'],
      response: `📊 **Interpretando las Métricas del Dashboard**:

**🎯 Métricas Clave**:
• **Tasa de Éxito**: >85% es excelente
• **Costo por Viewer**: Optimiza para reducir
• **Viewers por Hora**: Identifica patrones exitosos

**📈 Análisis de Rendimiento**:
• Compara diferentes duraciones de servicio
• Identifica bloques más eficientes
• Rastrea tendencias de costo

**🔍 Alertas Importantes**:
• Tasa de fallo alta (>20%): Revisa configuración
• Costos elevados: Considera servicios más largos
• Patrones de éxito: Replica en futuras campañas

**💡 Dashboard Tips**:
• Exporta reportes semanales
• Compara métricas mes a mes
• Usa los datos para planificar presupuestos

¿Hay alguna métrica específica que no entiendes?`
    }
  };

  // Buscar la categoría más relevante
  for (const [category, data] of Object.entries(responses)) {
    if (data.keywords.some(keyword => input.includes(keyword))) {
      return data.response;
    }
  }

  // Respuesta general
  return `🤖 **¡Hola! Soy tu asistente especializado en Dashboard La Casa**

Puedo ayudarte con:

🎯 **Cálculos de Viewers**: "¿Cuántos viewers necesito para X?"
💰 **Optimización de Costos**: "¿Cómo puedo ahorrar dinero?"
⚙️ **Configuración de Bloques**: "¿Cómo configuro mis operaciones?"
📊 **Análisis de Métricas**: "¿Qué significan estos datos?"
🚀 **Estrategias de Crecimiento**: "¿Cómo hago crecer mi canal?"

**Ejemplos de preguntas**:
• "Necesito 1500 viewers, ¿cuál es la mejor estrategia?"
• "¿Qué service ID es más barato?"
• "¿Cómo interpreto mi tasa de éxito?"

¿En qué te puedo ayudar específicamente? 😊`;
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