import { OAuth2Client } from 'google-auth-library';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${req.headers.origin}/api/auth/google/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/cloud-platform'
      ],
      prompt: 'consent'
    });

    console.log('🔐 URL de autenticação gerada:', authUrl);
    res.status(200).json({ authUrl });
  } catch (error) {
    console.error('❌ Erro ao gerar URL de autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
