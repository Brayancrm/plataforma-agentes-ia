export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('🔍 API test chamada:', req.method, req.url);
  
  res.status(200).json({ 
    success: true,
    message: 'Servidor OAuth 2.0 funcionando!',
    timestamp: new Date().toISOString(),
    projectId: process.env.VERTEX_AI_PROJECT_ID || 'não configurado',
    location: process.env.VERTEX_AI_LOCATION || 'não configurado',
    method: req.method,
    url: req.url
  });
}
