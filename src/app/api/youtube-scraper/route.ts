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

// Configuración para proxies y anti-detección
const PROXY_CONFIG = {
  // ScraperAPI (opción recomendada)
  scraperapi: {
    enabled: process.env.SCRAPERAPI_KEY ? true : false,
    key: process.env.SCRAPERAPI_KEY,
    endpoint: 'http://api.scraperapi.com'
  },
  // Bright Data
  brightdata: {
    enabled: process.env.BRIGHTDATA_USER ? true : false,
    user: process.env.BRIGHTDATA_USER,
    pass: process.env.BRIGHTDATA_PASS,
    endpoint: 'brd.superproxy.io:22225'
  },
  // Backend propio
  customProxy: {
    enabled: process.env.CUSTOM_PROXY_URL ? true : false,
    url: process.env.CUSTOM_PROXY_URL
  }
};

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

    // Usar estrategias múltiples para evadir detección
    const result = await attemptScrapingWithStrategies(url);
    
    console.log('✅ Scraping completado:', result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error en scraping de YouTube:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido',
      viewers: 0,
      isLive: false,
      title: '',
      timestamp: new Date().toISOString(),
      url: ''
    }, { status: 500 });
  }
}

function extractYouTubeData(html: string, url: string): YouTubeData {
  try {
    // Extraer título del video
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(' - YouTube', '').trim();
    }

    // Buscar indicadores de stream en vivo
    const liveIndicators = [
      /watching now/i,
      /viewers watching/i,
      /en directo/i,
      /live now/i,
      /"isLiveContent":true/i,
      /"isLive":true/i
    ];

    const isLive = liveIndicators.some(pattern => pattern.test(html));

    // Extraer número de viewers con múltiples patrones
    let viewers = 0;
    
    if (isLive) {
      // Patrones para viewers en vivo
      const viewerPatterns = [
        /"viewCount":{"videoViewCountRenderer":{"viewCount":{"simpleText":"([^"]+)"/,
        /"concurrentViewers":"([^"]+)"/,
        /"watching now"/i,
        /(\d+(?:,\d+)*)\s*watching/i,
        /(\d+(?:,\d+)*)\s*viewers?/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*watching/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*viewers?/i
      ];

      for (const pattern of viewerPatterns) {
        const match = html.match(pattern);
        if (match) {
          let viewerText = match[1];
          viewers = parseViewerCount(viewerText);
          if (viewers > 0) {
            console.log(`� Viewers encontrados con patrón: ${viewerText} → ${viewers}`);
            break;
          }
        }
      }

      // Buscar en JSON embebido
      if (viewers === 0) {
        const jsonMatches = html.match(/var ytInitialData = ({.*?});/);
        if (jsonMatches) {
          try {
            const data = JSON.parse(jsonMatches[1]);
            viewers = findViewersInObject(data);
          } catch (e) {
            console.warn('Error parseando ytInitialData:', e);
          }
        }
      }
    } else {
      // Para videos no en vivo, buscar views totales
      const viewPatterns = [
        /(\d+(?:,\d+)*)\s*views?/i,
        /(\d+(?:\.\d+)?[KMB]?)\s*views?/i,
        /"viewCount":"([^"]+)"/
      ];

      for (const pattern of viewPatterns) {
        const match = html.match(pattern);
        if (match) {
          viewers = parseViewerCount(match[1]);
          if (viewers > 0) break;
        }
      }
    }

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

// Función para scraping con diferentes estrategias
async function attemptScrapingWithStrategies(url: string): Promise<YouTubeData> {
  const strategies = [
    () => scrapWithProxy(url),
    () => scrapWithVercelRegions(url),
    () => scrapWithDelays(url),
    () => scrapDirect(url) // Fallback original
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🔄 Estrategia ${i + 1}/${strategies.length}`);
      const result = await strategies[i]();
      
      // Verificar si obtenemos datos válidos
      if (result.status === 'success' && (result.viewers > 10 || result.title)) {
        console.log(`✅ Éxito con estrategia ${i + 1}`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Estrategia ${i + 1} falló:`, error);
      if (i < strategies.length - 1) {
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Si todas fallan, retornar error
  return {
    viewers: 0,
    isLive: false,
    title: '',
    status: 'error',
    message: 'Todas las estrategias de scraping fallaron',
    timestamp: new Date().toISOString(),
    url
  };
}

// 1. Scraping con proxy
async function scrapWithProxy(url: string): Promise<YouTubeData> {
  if (PROXY_CONFIG.scraperapi.enabled) {
    const proxyUrl = `${PROXY_CONFIG.scraperapi.endpoint}?api_key=${PROXY_CONFIG.scraperapi.key}&url=${encodeURIComponent(url)}&render=true&country_code=US`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(proxyUrl, {
      headers: getRandomHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }
    
    const html = await response.text();
    return extractYouTubeData(html, url);
  }
  
  throw new Error('Proxy no configurado');
}

// 2. Scraping con diferentes regiones de Vercel
async function scrapWithVercelRegions(url: string): Promise<YouTubeData> {
  // Simular request desde diferentes regiones usando headers
  const regionHeaders = {
    'X-Forwarded-For': getRandomIP(),
    'CF-IPCountry': getRandomCountry(),
    ...getRandomHeaders()
  };
  
  // Usar diferentes dominios de YouTube por región
  const regionalUrls = [
    url,
    url.replace('youtube.com', 'youtube.co.uk'),
    url.replace('youtube.com', 'youtube.ca'),
    url + '&gl=US',
    url + '&gl=GB'
  ];
  
  for (const regionalUrl of regionalUrls) {
    try {
      const response = await fetch(regionalUrl, {
        headers: regionHeaders,
        redirect: 'follow'
      });
      
      if (response.ok) {
        const html = await response.text();
        const result = extractYouTubeData(html, url);
        if (result.viewers > 0 || result.title) {
          return result;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Todas las regiones fallaron');
}

// 3. Scraping con delays inteligentes
async function scrapWithDelays(url: string): Promise<YouTubeData> {
  // Delay aleatorio de 3-8 segundos
  const delay = 3000 + Math.random() * 5000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return scrapDirect(url);
}

// 4. Scraping directo (método original)
async function scrapDirect(url: string): Promise<YouTubeData> {
  const response = await fetch(url, {
    headers: getRandomHeaders(),
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  return extractYouTubeData(html, url);
}

// Funciones auxiliares
function getRandomHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0'
  ];

  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

  return {
    'User-Agent': randomUA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };
}

function getRandomIP(): string {
  // Generar IP aleatoria (para header X-Forwarded-For)
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function getRandomCountry(): string {
  const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT'];
  return countries[Math.floor(Math.random() * countries.length)];
}