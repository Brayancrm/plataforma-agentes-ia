export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { action, agentId, agentName, agentPrompt } = req.body;

    console.log('🔗 WhatsApp Connect API:', { action, agentId, agentName });

    if (action === 'connect') {
      // Para usar WhatsApp Web OFICIAL, você precisa de um servidor dedicado (VPS)
      // A Vercel serverless não suporta whatsapp-web.js adequadamente
      return res.status(200).json({
        success: false,
        error: 'Para usar WhatsApp Web oficial, você precisa de um servidor dedicado (VPS). A Vercel serverless não suporta whatsapp-web.js.',
        recommendation: 'Use o script vps-deploy-complete.sh para fazer deploy em um VPS com servidor persistente.',
        connection: {
          id: null,
          agentId: agentId,
          agentName: agentName,
          status: 'error',
          timestamp: new Date().toISOString(),
          message: 'WhatsApp Web oficial requer servidor dedicado'
        }
      });
    }

    if (action === 'disconnect') {
      return res.status(200).json({
        success: true,
        message: 'Desconectado',
        connection: {
          id: null,
          agentId: agentId,
          status: 'disconnected',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === 'status') {
      return res.status(200).json({
        success: true,
        connection: {
          id: null,
          agentId: agentId,
          status: 'disconnected',
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Ação não reconhecida',
      validActions: ['connect', 'disconnect', 'status']
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Método não permitido'
  });
}