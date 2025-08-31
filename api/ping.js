export default function handler(req, res) {
  res.status(200).json({ 
    pong: true,
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
}
