export default function handler(req, res) {
  res.status(200).json({
    isAuthenticated: false,
    hasAccessToken: false,
    hasRefreshToken: false,
    projectId: process.env.VERTEX_AI_PROJECT_ID || 'não configurado',
    location: process.env.VERTEX_AI_LOCATION || 'não configurado'
  });
}
