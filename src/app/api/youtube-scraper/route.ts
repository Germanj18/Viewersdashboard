import { NextRequest, NextResponse } from 'next/server';

interface YouTubeData {
  viewers: number;
  isLive: boolean;
  title: string;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        status: 'error',
        message: 'URL de YouTube requerida',
        viewers: 0,
        isLive: false,
        title: '',
        timestamp: new Date().toISOString(),
        url: ''
      }, { status: 400 });
    }

    // Validar que sea una URL de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({
        status: 'error',
        message: 'URL de YouTube inválida',
        viewers: 0,
        isLive: false,
        title: '',
        timestamp: new Date().toISOString(),
        url
      }, { status: 400 });
    }

    console.log('🔍 Iniciando scraping de YouTube:', url);
    console.log('🌐 Entorno:', process.env.NODE_ENV);
    console.log('🏢 Vercel:', process.env.VERCEL ? 'Sí' : 'No');

    // Headers más robustos para evitar detección
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'DNT': '1'
    };

    // Timeout más largo para producción
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    try {
      // Hacer request a YouTube con headers mejorados
      const response = await fetch(url, {
        headers,
        method: 'GET',
        signal: controller.signal,
        // Agregar configuración adicional para evitar caching
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('📄 HTML length:', html.length);
      
      // Verificar si el HTML parece válido
      if (!html || html.length < 1000) {
        throw new Error('Respuesta de YouTube demasiado corta o vacía');
      }

      // Verificar si YouTube nos está bloqueando
      if (html.includes('Our systems have detected unusual traffic') || 
          html.includes('blocked') || 
          html.includes('captcha')) {
        throw new Error('YouTube está bloqueando el acceso (detección de bot)');
      }
      
      // Extraer información del HTML
      const result = extractYouTubeData(html, url);
      
      console.log('✅ Scraping completado:', result);
      
      return NextResponse.json(result);

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Timeout: YouTube tardó demasiado en responder');
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Error en scraping de YouTube:', error);
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Agregar contexto específico para errores comunes en producción
      if (errorMessage.includes('fetch')) {
        errorMessage += ' (Posible bloqueo de red en producción)';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        errorMessage += ' (YouTube responde lento desde servidor)';
      } else if (errorMessage.includes('blocked') || errorMessage.includes('unusual traffic')) {
        errorMessage += ' (YouTube detectó y bloqueó el scraping)';
      }
    }
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
      viewers: 0,
      isLive: false,
      title: '',
      timestamp: new Date().toISOString(),
      url: '',
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    }, { status: 500 });
  }
}

function extractYouTubeData(html: string, url: string): YouTubeData {
  try {
    console.log('🔍 Analizando HTML para extracción de datos...');
    
    // Extraer título del video con múltiples patrones
    let title = '';
    
    // Patrón 1: Meta property og:title
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1].trim();
    }
    
    // Patrón 2: Title tag tradicional
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(' - YouTube', '').trim();
      }
    }
    
    // Patrón 3: JSON data
    if (!title) {
      const jsonMatches = html.match(/var ytInitialData = ({.*?});/);
      if (jsonMatches) {
        try {
          const data = JSON.parse(jsonMatches[1]);
          const foundTitle = findTitleInObject(data);
          if (foundTitle) title = foundTitle;
        } catch (e) {
          console.warn('Error parseando ytInitialData para título:', e);
        }
      }
    }

    console.log('📝 Título extraído:', title || 'No encontrado');

    // Buscar indicadores de stream en vivo con más patrones
    const liveIndicators = [
      /watching now/i,
      /viewers watching/i,
      /en directo/i,
      /live now/i,
      /"isLiveContent":true/i,
      /"isLive":true/i,
      /"videoDetails":[^}]*"isLive":true/i,
      /LIVE/i,
      /🔴/,
      /"badges":[^]]*"LIVE"/i
    ];

    const isLive = liveIndicators.some(pattern => pattern.test(html));
    console.log('🔴 Stream en vivo detectado:', isLive);

    // Extraer número de viewers con patrones ampliados
    let viewers = 0;
    
    if (isLive) {
      console.log('🔍 Buscando viewers para stream en vivo...');
      
      // Patrones para viewers en vivo (mejorados para producción)
      const viewerPatterns = [
        // Patrones JSON específicos
        /"viewCount":{"videoViewCountRenderer":{"viewCount":{"simpleText":"([^"]+)"/,
        /"concurrentViewers":"([^"]+)"/,
        /"videoViewCountRenderer":{"viewCount":{"simpleText":"([^"]+)"/,
        
        // Patrones en texto natural
        /(\d+(?:,\d+)*)\s*watching/i,
        /(\d+(?:,\d+)*)\s*viewers?/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*watching/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*viewers?/i,
        
        // Patrones más específicos
        /"viewCount":"([^"]+)"/i,
        /"shortViewCountText":{"simpleText":"([^"]+)"/,
        /watching now.*?(\d+(?:,\d+)*)/i,
        /(\d+(?:,\d+)*)\s*people watching/i,
        
        // Patrones para HTML simplificado (servidores)
        /data-views="([^"]+)"/i,
        /viewers="([^"]+)"/i,
        /"watchingCount":"([^"]+)"/i
      ];

      for (const pattern of viewerPatterns) {
        const match = html.match(pattern);
        if (match) {
          let viewerText = match[1];
          viewers = parseViewerCount(viewerText);
          if (viewers > 0) {
            console.log(`👥 Viewers encontrados con patrón: ${viewerText} → ${viewers}`);
            break;
          }
        }
      }

      // Buscar en JSON embebido (mejorado)
      if (viewers === 0) {
        console.log('🔍 Buscando en JSON embebido...');
        
        // Buscar múltiples tipos de JSON
        const jsonPatterns = [
          /var ytInitialData = ({.*?});/,
          /window\["ytInitialData"\] = ({.*?});/,
          /ytInitialData":\s*({.*?}),"/
        ];
        
        for (const jsonPattern of jsonPatterns) {
          const jsonMatch = html.match(jsonPattern);
          if (jsonMatch) {
            try {
              const data = JSON.parse(jsonMatch[1]);
              viewers = findViewersInObject(data);
              if (viewers > 0) {
                console.log(`👥 Viewers encontrados en JSON: ${viewers}`);
                break;
              }
            } catch (e) {
              console.warn('Error parseando JSON pattern:', e);
            }
          }
        }
      }
      
      // Último recurso: buscar números grandes en el HTML
      if (viewers === 0) {
        console.log('🔍 Último recurso: buscando números en HTML...');
        const numberMatches = html.match(/\b(\d{2,})\b/g);
        if (numberMatches) {
          // Buscar números que parezcan viewers (entre 10 y 100,000)
          const possibleViewers = numberMatches
            .map(n => parseInt(n, 10))
            .filter(n => n >= 10 && n <= 100000)
            .sort((a, b) => b - a); // Ordenar descendente
            
          if (possibleViewers.length > 0) {
            viewers = possibleViewers[0]; // Tomar el número más alto
            console.log(`👥 Viewers estimados por números grandes: ${viewers}`);
          }
        }
      }
    } else {
      console.log('🔍 Buscando views totales para video grabado...');
      // Para videos no en vivo, buscar views totales
      const viewPatterns = [
        /(\d+(?:,\d+)*)\s*views?/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*views?/i,
        /"viewCount":"([^"]+)"/,
        /"viewCountText":{"simpleText":"([^"]+)"/
      ];

      for (const pattern of viewPatterns) {
        const match = html.match(pattern);
        if (match) {
          viewers = parseViewerCount(match[1]);
          if (viewers > 0) {
            console.log(`👁️ Views encontradas: ${viewers}`);
            break;
          }
        }
      }
    }

    console.log(`📊 Datos extraídos - Título: "${title}", Viewers: ${viewers}, Live: ${isLive}`);

    return {
      viewers,
      isLive,
      title,
      status: 'success',
      timestamp: new Date().toISOString(),
      url
    };

  } catch (error) {
    console.error('Error extrayendo datos:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: 'Error procesando respuesta de YouTube',
      timestamp: new Date().toISOString(),
      url
    };
  }
}

function findTitleInObject(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  
  const titleKeys = ['title', 'videoTitle', 'name', 'headline'];
  
  for (const key of titleKeys) {
    if (obj[key]) {
      const value = typeof obj[key] === 'object' ? obj[key].simpleText || obj[key].runs?.[0]?.text : obj[key];
      if (value && typeof value === 'string') {
        return value.toString().trim();
      }
    }
  }
  
  // Búsqueda recursiva
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const result = findTitleInObject(value);
      if (result) return result;
    }
  }
  
  return null;
}

function findViewersInObject(obj: any): number {
  if (!obj || typeof obj !== 'object') return 0;
  
  const keys = ['concurrentViewers', 'viewCount', 'watching', 'viewers'];
  
  for (const key of keys) {
    if (obj[key]) {
      const value = typeof obj[key] === 'object' ? obj[key].simpleText || obj[key].runs?.[0]?.text : obj[key];
      if (value) {
        const parsed = parseViewerCount(value.toString());
        if (parsed > 0) return parsed;
      }
    }
  }
  
  // Búsqueda recursiva
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const result = findViewersInObject(value);
      if (result > 0) return result;
    }
  }
  
  return 0;
}

function parseViewerCount(text: string): number {
  if (!text) return 0;
  
  // Limpiar texto
  text = text.replace(/[^\d,.KMB]/gi, '');
  
  // Manejar notación con K, M, B
  const multipliers: { [key: string]: number } = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000
  };
  
  const match = text.match(/^([\d,.]+)([KMB])?$/i);
  if (match) {
    let number = parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2]?.toUpperCase();
    
    if (suffix && multipliers[suffix]) {
      number *= multipliers[suffix];
    }
    
    return Math.round(number);
  }
  
  // Fallback: solo números
  const numMatch = text.match(/[\d,]+/);
  if (numMatch) {
    return parseInt(numMatch[0].replace(/,/g, ''), 10) || 0;
  }
  
  return 0;
}