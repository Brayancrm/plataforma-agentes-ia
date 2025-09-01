export default function handler(req, res) {
  res.status(200).json({ 
    pong: true,
    message: 'API funcionando! - Deploy forçado',
    timestamp: new Date().toISOString()
  });
}
