export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Servidor OAuth 2.0 funcionando!',
    timestamp: new Date().toISOString(),
    projectId: process.env.VERTEX_AI_PROJECT_ID || 'não configurado',
    location: process.env.VERTEX_AI_LOCATION || 'não configurado'
  });
}
