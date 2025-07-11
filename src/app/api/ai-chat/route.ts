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
          text: `Eres un asistente especializado en el Dashboard de Métricas para YouTube viewers. 

RESPONDE SIEMPRE:
- En español, de manera amigable y profesional
- Con respuestas concisas y directas
- Solo responde a lo que el usuario pregunta específicamente
- Evita respuestas largas con listas a menos que se soliciten

CONTEXTO DEL SISTEMA:
- Dashboard para comprar viewers de YouTube
- Tiene 10 bloques que pueden ejecutar operaciones
- Service IDs disponibles: 334 (1h), 336 (2h), 459 (4h), 460 (6h), 657 (8h)
- Los bloques pueden hacer operaciones automáticas crecientes, decrecientes o constantes
- El sistema muestra métricas como tasa de éxito, costos, etc.

CONSULTA DEL USUARIO: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 300,
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
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Respuestas locales simplificadas (fallback)
function generateLocalResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  const responses = {
    viewers: {
      keywords: ['viewer', 'cuanto', 'cantidad', 'necesito'],
      response: `Para calcular viewers, define tu objetivo y elige el Service ID adecuado. Los servicios más largos (6h-8h) suelen ser más eficientes en costo. ¿Cuál es tu meta específica?`
    },
    costos: {
      keywords: ['costo', 'precio', 'dinero', 'barato'],
      response: `Los Service IDs más largos (657 de 8h, 460 de 6h) ofrecen mejor costo por viewer. Revisa la métrica "Costo por Viewer" en tu dashboard para optimizar.`
    },
    bloques: {
      keywords: ['bloque', 'configurar', 'como'],
      response: `Cada bloque puede configurarse independientemente con cantidad, Service ID y timing. Puedes usar patrones automáticos crecientes, decrecientes o constantes. ¿Qué específicamente quieres configurar?`
    },
    automatico: {
      keywords: ['automatico', 'creciente', 'decreciente'],
      response: `Los bloques soportan operaciones automáticas: creciente (aumenta viewers), decreciente (reduce viewers) o constante (misma cantidad). ¿Qué patrón te interesa?`
    }
  };

  // Buscar la categoría más relevante
  for (const [category, data] of Object.entries(responses)) {
    if (data.keywords.some(keyword => input.includes(keyword))) {
      return data.response;
    }
  }

  return `🤖 Hola! Soy tu asistente del Dashboard de Métricas. ¿En qué puedo ayudarte específicamente?`;
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

    // Prioridad: Gemini (gratis) > OpenAI (pago) > Local
    try {
      if (process.env.GEMINI_API_KEY) {
        response = await callGemini(userMessage);
      } else if (process.env.OPENAI_API_KEY) {
        response = await callOpenAI(messages);
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
