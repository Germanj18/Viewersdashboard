import { NextRequest, NextResponse } from 'next/server';

interface YouTubeData {
  viewers: number;
  isLive: boolean;
  title: string;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
  url: string;
  channelId?: string;
  channelName?: string;
  videoId?: string;
  redirectedUrl?: string;
}

interface ChannelMonitorRequest {
  url: string;
  mode: 'video' | 'channel';
  channelId?: string;
  channelUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChannelMonitorRequest = await request.json();
    const { url, mode = 'video' } = body;
    
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

    console.log(`🔍 Iniciando scraping de YouTube - Modo: ${mode}, URL: ${url}`);

    let result: YouTubeData;

    if (mode === 'channel') {
      // Modo canal: buscar streams en vivo automáticamente
      result = await findChannelLiveStream(url);
    } else {
      // Modo video: monitorear video específico sin auto-redirección
      result = await scrapeVideoWithAutoRedirect(url);
    }
    
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

// Función para monitorear video específico (sin auto-redirección)
async function scrapeVideoWithAutoRedirect(url: string): Promise<YouTubeData> {
  try {
    console.log('🎯 Monitoreando video específico:', url);
    
    // Monitorear el video actual
    const videoData = await scrapeVideoData(url);
    
    if (videoData.isLive) {
      console.log('✅ Video está en vivo');
      return videoData;
    } else {
      console.log('⚠️ Video no está en vivo');
      return {
        ...videoData,
        message: 'El video no está en vivo actualmente.'
      };
    }
    
  } catch (error) {
    console.error('❌ Error monitoreando video:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: `Error monitoreando video: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      timestamp: new Date().toISOString(),
      url
    };
  }
}

// Función para buscar streams en vivo en un canal
async function findChannelLiveStream(channelUrl: string): Promise<YouTubeData> {
  try {
    console.log('🔍 Buscando streams en vivo en canal:', channelUrl);
    
    // Normalizar URL del canal
    let normalizedUrl = channelUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://www.youtube.com/${normalizedUrl.replace(/^[@\/]/, '@')}`;
    }
    
    // Intentar diferentes estrategias para encontrar streams en vivo
    const strategies = [
      // Estrategia 1: Buscar en la página principal del canal
      async () => await searchInChannelHome(normalizedUrl),
      // Estrategia 2: Buscar en /live
      async () => await searchInChannelLive(normalizedUrl),
      // Estrategia 3: Buscar en /videos con filtro de live
      async () => await searchInChannelVideos(normalizedUrl),
      // Estrategia 4: Buscar en RSS feed
      async () => await searchInChannelRSS(normalizedUrl)
    ];

    for (let i = 0; i < strategies.length; i++) {
      console.log(`🔎 Ejecutando estrategia ${i + 1}...`);
      try {
        const liveVideoUrl = await strategies[i]();
        if (liveVideoUrl) {
          console.log('✅ Stream en vivo encontrado:', liveVideoUrl);
          // Monitorear el video en vivo encontrado
          const result = await scrapeVideoData(liveVideoUrl);
          result.redirectedUrl = liveVideoUrl;
          result.channelName = await extractChannelName(normalizedUrl);
          return result;
        }
      } catch (strategyError) {
        console.warn(`⚠️ Estrategia ${i + 1} falló:`, strategyError);
      }
    }

    // Si no encuentra stream en vivo, retornar resultado indicando que no hay stream
    const channelName = await extractChannelName(normalizedUrl);
    return {
      viewers: 0,
      isLive: false,
      title: `${channelName} - Sin streams en vivo`,
      status: 'success',
      message: 'No se encontró ningún stream en vivo en este canal',
      timestamp: new Date().toISOString(),
      url: channelUrl,
      channelName
    };

  } catch (error) {
    console.error('❌ Error buscando stream en canal:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: `Error buscando stream en canal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      timestamp: new Date().toISOString(),
      url: channelUrl
    };
  }
}

// Estrategia 1: Buscar en la página principal del canal
async function searchInChannelHome(channelUrl: string): Promise<string | null> {
  try {
    console.log('📺 Buscando en página principal del canal...');
    const response = await fetch(channelUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return null;

    const html = await response.text();
    return extractLiveVideoFromChannelPage(html, channelUrl);
  } catch (error) {
    console.error('Error en searchInChannelHome:', error);
    return null;
  }
}

// Estrategia 2: Buscar en /live del canal
async function searchInChannelLive(channelUrl: string): Promise<string | null> {
  try {
    console.log('🔴 Buscando en página /live del canal...');
    const liveUrl = `${channelUrl}/live`;
    const response = await fetch(liveUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Si nos redirige a un video específico, extraer el ID del video
    if (response.url.includes('/watch?v=')) {
      return response.url;
    }
    
    return extractLiveVideoFromChannelPage(html, channelUrl);
  } catch (error) {
    console.error('Error en searchInChannelLive:', error);
    return null;
  }
}

// Estrategia 3: Buscar en la página de videos del canal
async function searchInChannelVideos(channelUrl: string): Promise<string | null> {
  try {
    console.log('📹 Buscando en página de videos del canal...');
    const videosUrl = `${channelUrl}/videos`;
    const response = await fetch(videosUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return null;

    const html = await response.text();
    return extractLiveVideoFromChannelPage(html, channelUrl);
  } catch (error) {
    console.error('Error en searchInChannelVideos:', error);
    return null;
  }
}

// Estrategia 4: Buscar en RSS feed del canal
async function searchInChannelRSS(channelUrl: string): Promise<string | null> {
  try {
    console.log('📡 Buscando en RSS feed del canal...');
    
    // Extraer channel ID de la URL
    const channelId = await extractChannelIdFromUrl(channelUrl);
    if (!channelId) return null;
    
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(rssUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return null;

    const xmlText = await response.text();
    
    // Buscar videos recientes y verificar si alguno está en vivo
    const videoIdMatches = xmlText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/g);
    
    if (videoIdMatches) {
      for (const match of videoIdMatches.slice(0, 5)) { // Verificar los 5 más recientes
        const videoId = match.replace(/<\/?yt:videoId>/g, '');
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Verificar si este video está en vivo
        const videoData = await quickCheckIfLive(videoUrl);
        if (videoData?.isLive) {
          return videoUrl;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error en searchInChannelRSS:', error);
    return null;
  }
}

// Función para extraer el nombre del canal
async function extractChannelName(channelUrl: string): Promise<string> {
  try {
    const response = await fetch(channelUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return 'Canal de YouTube';

    const html = await response.text();
    
    // Buscar el nombre del canal en el HTML
    const namePatterns = [
      /<meta property="og:title" content="([^"]+)"/,
      /<title[^>]*>([^<]+)<\/title>/,
      /"title":"([^"]+)"/
    ];

    for (const pattern of namePatterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1].replace(' - YouTube', '').trim();
      }
    }

    return 'Canal de YouTube';
  } catch (error) {
    console.error('Error extrayendo nombre del canal:', error);
    return 'Canal de YouTube';
  }
}

// Función para extraer channel ID de URL
async function extractChannelIdFromUrl(channelUrl: string): Promise<string | null> {
  try {
    // Si ya es un channel ID
    const channelIdMatch = channelUrl.match(/\/channel\/([UC][a-zA-Z0-9_-]+)/);
    if (channelIdMatch) {
      return channelIdMatch[1];
    }

    // Si es un handle (@username), necesitamos convertirlo
    if (channelUrl.includes('/@')) {
      const response = await fetch(channelUrl, {
        headers: getYouTubeHeaders(),
        method: 'GET'
      });

      if (response.ok) {
        const html = await response.text();
        const channelIdMatch = html.match(/"channelId":"([UC][a-zA-Z0-9_-]+)"/);
        if (channelIdMatch) {
          return channelIdMatch[1];
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error extrayendo channel ID:', error);
    return null;
  }
}

// Función para verificar rápidamente si un video está en vivo
async function quickCheckIfLive(videoUrl: string): Promise<{ isLive: boolean } | null> {
  try {
    const response = await fetch(videoUrl, {
      headers: getYouTubeHeaders(),
      method: 'GET'
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    const liveIndicators = [
      /"isLiveContent":true/i,
      /"isLive":true/i,
      /watching now/i,
      /viewers watching/i
    ];

    const isLive = liveIndicators.some(pattern => pattern.test(html));
    return { isLive };
  } catch (error) {
    console.error('Error en quickCheckIfLive:', error);
    return null;
  }
}

// Función para extraer video en vivo de la página del canal
function extractLiveVideoFromChannelPage(html: string, channelUrl: string): string | null {
  try {
    console.log('🔍 Analizando HTML para encontrar streams en vivo...');
    
    // 1. Buscar patrones directos de videos en vivo
    const directLivePatterns = [
      // Enlaces con "watch?v=" que incluyan texto de LIVE
      /href="\/watch\?v=([a-zA-Z0-9_-]{11})[^"]*"[^>]*>[^<]*(?:LIVE|EN VIVO|🔴|DIRECTO)/i,
      /href="\/watch\?v=([a-zA-Z0-9_-]{11})[^"]*"[^>]*data-live="true"/i,
      // Videos con badge de LIVE
      /"videoId":"([a-zA-Z0-9_-]{11})"[^}]*"isLive":true/g,
      /"videoId":"([a-zA-Z0-9_-]{11})"[^}]*"isLiveContent":true/g,
    ];

    for (const pattern of directLivePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        console.log('✅ Video ID encontrado con patrón directo:', videoId);
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // 2. Buscar en ytInitialData
    const ytDataMatch = html.match(/var ytInitialData = ({[\s\S]*?});/);
    if (ytDataMatch) {
      try {
        console.log('🔍 Analizando ytInitialData...');
        const ytData = JSON.parse(ytDataMatch[1]);
        const liveVideoId = findLiveVideoInYtData(ytData);
        if (liveVideoId) {
          console.log('✅ Video ID encontrado en ytInitialData:', liveVideoId);
          return `https://www.youtube.com/watch?v=${liveVideoId}`;
        }
      } catch (e) {
        console.warn('❌ Error parseando ytInitialData:', e);
      }
    }

    // 3. Buscar patrones más generales de videos que podrían estar en vivo
    const generalPatterns = [
      // Buscar todos los IDs de video y luego verificarlos
      /\/watch\?v=([a-zA-Z0-9_-]{11})/g,
      /"videoId":"([a-zA-Z0-9_-]{11})"/g
    ];

    const foundVideoIds = new Set<string>();
    
    for (const pattern of generalPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
          foundVideoIds.add(match[1]);
        }
        // Prevenir bucle infinito
        if (pattern.lastIndex === match.index) {
          pattern.lastIndex++;
        }
      }
      // Reset regex
      pattern.lastIndex = 0;
    }

    // Buscar indicadores de live cerca de estos IDs
    for (const videoId of Array.from(foundVideoIds).slice(0, 10)) { // Limitar a 10 videos
      const videoContext = extractVideoContext(html, videoId);
      if (isLiveContext(videoContext)) {
        console.log('✅ Video ID encontrado por contexto:', videoId);
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // 4. Buscar en diferentes secciones del HTML
    const liveIndicatorPatterns = [
      /LIVE<\/span>[^<]*<[^>]*href="\/watch\?v=([a-zA-Z0-9_-]{11})"/i,
      /EN VIVO<\/span>[^<]*<[^>]*href="\/watch\?v=([a-zA-Z0-9_-]{11})"/i,
      /🔴[^<]*<[^>]*href="\/watch\?v=([a-zA-Z0-9_-]{11})"/i,
    ];

    for (const pattern of liveIndicatorPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        console.log('✅ Video ID encontrado por indicador:', match[1]);
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }

    console.log('❌ No se encontraron streams en vivo en la página');
    return null;
  } catch (error) {
    console.error('❌ Error extrayendo video en vivo:', error);
    return null;
  }
}

// Función auxiliar para extraer contexto alrededor de un video ID
function extractVideoContext(html: string, videoId: string): string {
  const index = html.indexOf(videoId);
  if (index === -1) return '';
  
  const start = Math.max(0, index - 500);
  const end = Math.min(html.length, index + 500);
  return html.substring(start, end);
}

// Función auxiliar para determinar si el contexto indica un video en vivo
function isLiveContext(context: string): boolean {
  const liveIndicators = [
    /live/i,
    /en vivo/i,
    /directo/i,
    /watching/i,
    /viewers/i,
    /🔴/,
    /"isLive":true/i,
    /"isLiveContent":true/i,
    /badge.*live/i
  ];
  
  return liveIndicators.some(pattern => pattern.test(context));
}

// Función recursiva para buscar videos en vivo en ytInitialData
function findLiveVideoInYtData(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;

  // Buscar propiedades que indiquen video en vivo
  if (obj.videoId && (obj.isLive || obj.isLiveContent)) {
    return obj.videoId;
  }

  // Buscar en badges de "LIVE"
  if (obj.videoId && obj.badges) {
    for (const badge of obj.badges) {
      if (badge.liveBadgeRenderer || 
          (badge.metadataBadgeRenderer && 
           badge.metadataBadgeRenderer.label && 
           /live|en vivo/i.test(badge.metadataBadgeRenderer.label))) {
        return obj.videoId;
      }
    }
  }

  // Búsqueda recursiva en objetos y arrays
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = findLiveVideoInYtData(item);
        if (result) return result;
      }
    } else if (typeof value === 'object' && value !== null) {
      const result = findLiveVideoInYtData(value);
      if (result) return result;
    }
  }

  return null;
}

// Función para monitorear un video específico
async function scrapeVideoData(url: string): Promise<YouTubeData> {
  try {
    console.log('🎯 Iniciando scraping con anti-detección para:', url);
    
    // Validar que sea una URL de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      throw new Error('URL de YouTube inválida');
    }
    
    // Aplicar delay inicial aleatorio
    await randomDelay();
    
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Verificar si YouTube está bloqueando el acceso
    if (html.includes('blocked') || html.includes('captcha') || html.includes('unusual traffic')) {
      console.log('⚠️ Posible bloqueo detectado - ajustando estrategia');
      
      // Esperar más tiempo y reintentar con headers diferentes
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Segundo intento con estrategia diferente
      const response2 = await fetchWithRetry(url, {
        headers: {
          ...getYouTubeHeaders('https://www.google.com'),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (response2.ok) {
        const html2 = await response2.text();
        return extractYouTubeData(html2, url);
      }
    }

    return extractYouTubeData(html, url);

  } catch (error) {
    console.error('❌ Error en scrapeVideoData:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      timestamp: new Date().toISOString(),
      url
    };
  }
}

  } catch (error) {
    console.error('❌ Error haciendo scraping del video:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
      url
    };
  }
}

// User agents rotativos para evitar detección
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];

// Controlador de rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos mínimo entre requests

// Función para generar delays aleatorios anti-detección
function getRandomDelay(): number {
  return Math.floor(Math.random() * 1500) + 500; // Entre 500ms y 2s
}

// Función para esperar con delay aleatorio
async function randomDelay(): Promise<void> {
  const delay = getRandomDelay();
  console.log(`⏳ Aplicando delay anti-detección: ${delay}ms`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

// Headers mejorados para simular navegador real
function getYouTubeHeaders(referer?: string) {
  // Rate limiting - asegurar intervalo mínimo entre requests
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    console.log(`🛡️ Rate limiting activo - esperando ${waitTime}ms`);
  }
  lastRequestTime = now;

  // Seleccionar user agent aleatorio
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  // Headers más completos para simular navegador real
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };

  // Agregar referer si se proporciona
  if (referer) {
    headers['Referer'] = referer;
  }

  // Simular cookies de sesión básicas
  const sessionCookies = [
    'YSC=DwKYllHNwuw',
    'VISITOR_INFO1_LIVE=Gt6OEzkgVQg',
    'PREF=f4=4000000&tz=America.Argentina.Buenos_Aires'
  ];
  headers['Cookie'] = sessionCookies.join('; ');

  console.log(`🔄 Usando User-Agent: ${userAgent.substring(0, 50)}...`);
  
  return headers;
}

// Función de fetch mejorada con retry y anti-detección
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Intento ${attempt}/${maxRetries} - Fetching: ${url}`);
      
      // Aplicar delay aleatorio antes del request (excepto en el primer intento)
      if (attempt > 1) {
        await randomDelay();
      }

      // Configurar headers anti-detección
      const headers = getYouTubeHeaders(url.includes('youtube.com') ? 'https://www.youtube.com' : undefined);
      
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
        // Timeout de 15 segundos
        signal: AbortSignal.timeout(15000)
      });

      // Si la respuesta es exitosa, retornar
      if (response.ok) {
        console.log(`✅ Request exitoso en intento ${attempt}`);
        return response;
      }

      // Si es un error 429 (Too Many Requests), esperar más tiempo
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000 + (attempt * 2000);
        console.log(`⚠️ Rate limit detectado (429) - esperando ${waitTime}ms antes del siguiente intento`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Si es un error 403/404, no reintentar
      if (response.status === 403 || response.status === 404) {
        console.log(`❌ Error ${response.status} - no reintentando`);
        return response;
      }

      console.log(`⚠️ Intento ${attempt} falló con status ${response.status}`);
      
      // Para otros errores, esperar antes del siguiente intento
      if (attempt < maxRetries) {
        const waitTime = 1000 * attempt + Math.random() * 2000;
        console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

    } catch (error) {
      console.log(`❌ Error en intento ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      const waitTime = 2000 * attempt + Math.random() * 3000;
      console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`Falló después de ${maxRetries} intentos`);
}

// Función principal de scraping mejorada
async function scrapeVideoData(url: string): Promise<YouTubeData> {
  try {
    console.log('🎯 Iniciando scraping con anti-detección para:', url);
    
    // Aplicar delay inicial aleatorio
    await randomDelay();
    
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Verificar si YouTube está bloqueando el acceso
    if (html.includes('blocked') || html.includes('captcha') || html.includes('unusual traffic')) {
      console.log('⚠️ Posible bloqueo detectado - ajustando estrategia');
      
      // Esperar más tiempo y reintentar con headers diferentes
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Segundo intento con estrategia diferente
      const response2 = await fetchWithRetry(url, {
        headers: {
          ...getYouTubeHeaders('https://www.google.com'),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (response2.ok) {
        const html2 = await response2.text();
        return extractYouTubeData(html2, url);
      }
    }

    return extractYouTubeData(html, url);

  } catch (error) {
    console.error('❌ Error en scrapeVideoData:', error);
    return {
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      timestamp: new Date().toISOString(),
      url
    };
  }
}
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