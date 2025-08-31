import { OAuth2Client } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorização não fornecido' });
    }

    console.log('🔄 Recebido código de autorização, trocando por tokens...');
    
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${req.headers.origin}/api/auth/google/callback`
    );

    // Trocar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Tokens obtidos com sucesso!');
    console.log('🔑 Access Token:', tokens.access_token ? '✅ Presente' : '❌ Ausente');
    console.log('🔄 Refresh Token:', tokens.refresh_token ? '✅ Presente' : '❌ Ausente');
    
    // Em produção, você deve armazenar os tokens em um banco de dados
    // Por enquanto, vamos apenas retornar sucesso
    
    res.status(200).json({ 
      success: true, 
      message: 'Autenticação OAuth 2.0 concluída com sucesso!',
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
  } catch (error) {
    console.error('❌ Erro no callback OAuth:', error);
    res.status(500).json({ 
      error: 'Erro na autenticação OAuth 2.0',
      details: error.message 
    });
  }
}
