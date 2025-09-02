import React, { useEffect } from 'react';

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('Erro OAuth:', error);
        window.opener?.postMessage({
          type: 'oauth-error',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (code && state) {
        console.log('✅ Código OAuth recebido');
        window.opener?.postMessage({
          type: 'oauth-callback',
          code: code,
          state: state
        }, window.location.origin);
        window.close();
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Autorizando acesso...
        </h2>
        <p className="text-gray-500">
          Aguarde enquanto configuramos o acesso ao Veo 3
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
