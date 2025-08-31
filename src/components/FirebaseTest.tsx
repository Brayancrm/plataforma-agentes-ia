import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';

const FirebaseTest: React.FC = () => {
  const { createDocument, getDocuments, loading, error } = useFirestore();
  const [testResult, setTestResult] = useState<string>('');

  const testFirebaseConnection = async () => {
    try {
      setTestResult('🔄 Testando conexão...');
      
      // Teste 1: Criar documento
      const testData = {
        name: 'Teste Firebase',
        timestamp: new Date().toISOString(),
        test: true
      };
      
      setTestResult('📤 Criando documento de teste...');
      const created = await createDocument('teste', testData);
      setTestResult(`✅ Documento criado! ID: ${created.id}`);
      
      // Teste 2: Listar documentos
      setTestResult('📥 Listando documentos...');
      const docs = await getDocuments('teste');
      setTestResult(`✅ ${docs.length} documentos encontrados!`);
      
    } catch (err: any) {
      setTestResult(`❌ Erro: ${err.message}`);
      console.error('Erro no teste:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🧪 Teste de Conexão Firebase</h2>
      
      <button
        onClick={testFirebaseConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Conexão'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>Resultado:</strong> {testResult}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
