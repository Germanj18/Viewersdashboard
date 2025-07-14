import { NextRequest, NextResponse } from 'next/server';

interface YouTubeScrapingResult {
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
    
    if (!url || !url.includes('youtube.com')) {
      return NextResponse.json({
        viewers: 0,
        isLive: false,
        title: '',
        status: 'error',
        message: 'URL de YouTube inválida',
        timestamp: new Date().toISOString(),
        url
      } as YouTubeScrapingResult);
    }

    // Extraer video ID de la URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      return NextResponse.json({
        viewers: 0,
        isLive: false,
        title: '',
        status: 'error',
        message: 'No se pudo extraer el ID del video',
        timestamp: new Date().toISOString(),
        url
      } as YouTubeScrapingResult);
    }

    const videoId = videoIdMatch[1];
    console.log('🔍 Intentando scraping para video ID:', videoId);

    // Configurar headers para simular un navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // Hacer request a YouTube
    const response = await fetch(url, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({
        viewers: 0,
        isLive: false,
        title: '',
        status: 'error',
        message: `Error HTTP: ${response.status}`,
        timestamp: new Date().toISOString(),
        url
      } as YouTubeScrapingResult);
    }

    const html = await response.text();
    
    // Extraer información usando regex (más robusto que parsing HTML completo)
    let viewers = 0;
    let isLive = false;
    let title = '';

    // Buscar viewers en vivo
    const liveViewersMatch = html.match(/"viewCount":"(\d+)"/);
    const liveViewersMatch2 = html.match(/(\d+(?:,\d+)*)\s*watching/i);
    const liveViewersMatch3 = html.match(/"concurrent":{"runs":\[{"text":"([\d,]+)"}]/);
    
    if (liveViewersMatch3) {
      viewers = parseInt(liveViewersMatch3[1].replace(/,/g, ''));
      isLive = true;
      console.log('📺 Viewers encontrados (método 3):', viewers);
    } else if (liveViewersMatch2) {
      viewers = parseInt(liveViewersMatch2[1].replace(/,/g, ''));
      isLive = true;
      console.log('📺 Viewers encontrados (método 2):', viewers);
    } else if (liveViewersMatch) {
      viewers = parseInt(liveViewersMatch[1]);
      isLive = true;
      console.log('📺 Viewers encontrados (método 1):', viewers);
    } else {
      // Buscar viewers de video grabado
      const recordedViewsMatch = html.match(/"viewCount":{"simpleText":"([\d,]+) views?"}/);
      if (recordedViewsMatch) {
        viewers = parseInt(recordedViewsMatch[1].replace(/,/g, ''));
        isLive = false;
        console.log('📹 Video grabado, vistas:', viewers);
      }
    }

    // Extraer título
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch) {
      title = titleMatch[1]
        .replace(' - YouTube', '')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();
    }

    // Verificar si está en vivo buscando indicadores adicionales
    const liveIndicators = [
      /LIVE/i,
      /"isLive":true/i,
      /"isLiveContent":true/i,
      /watching now/i,
      /\d+\s*watching/i
    ];

    for (const indicator of liveIndicators) {
      if (indicator.test(html)) {
        isLive = true;
        break;
      }
    }

    console.log('📊 Resultado scraping:', { viewers, isLive, title: title.substring(0, 50) + '...' });

    return NextResponse.json({
      viewers,
      isLive,
      title,
      status: 'success',
      timestamp: new Date().toISOString(),
      url
    } as YouTubeScrapingResult);

  } catch (error) {
    console.error('❌ Error en scraping:', error);
    
    return NextResponse.json({
      viewers: 0,
      isLive: false,
      title: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido en scraping',
      timestamp: new Date().toISOString(),
      url: ''
    } as YouTubeScrapingResult);
  }
}
