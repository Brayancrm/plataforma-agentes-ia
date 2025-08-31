import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useFirestore } from '../hooks/useFirestore';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';

// Exemplo de como usar os hooks do Firebase no seu dashboard
export const FirebaseUsageExample: React.FC = () => {
  const { user, login, register, logout } = useFirebaseAuth();
  const { createDocument, getDocuments, updateDocument, deleteDocument } = useFirestore();
  const { uploadFile, uploadProgress } = useFirebaseStorage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');

  // Exemplo: Criar um usuário
  const handleCreateUser = async () => {
    try {
      const userData = {
        name: userName,
        email: email,
        category: 'usuario',
        credits: 10,
        visibleSections: ['overview', 'usuarios', 'empresas'],
        createdAt: new Date()
      };

      const result = await createDocument('usuarios', userData);
      console.log('Usuário criado:', result);
      
      // Limpar campos
      setUserName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  // Exemplo: Buscar usuários
  const handleGetUsers = async () => {
    try {
      const users = await getDocuments('usuarios');
      console.log('Usuários encontrados:', users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Exemplo: Upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await uploadFile(file, `usuarios/${user?.uid}/avatar.jpg`);
        console.log('Arquivo enviado:', result);
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
      }
    }
  };

  // Exemplo: Login
  const handleLogin = async () => {
    try {
      await login(email, password);
      console.log('Login realizado com sucesso');
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  // Exemplo: Registro
  const handleRegister = async () => {
    try {
      await register(email, password, userName);
      console.log('Registro realizado com sucesso');
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Uso do Firebase</h2>
      
      {!user ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Registrar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">
              Logado como: <strong>{user.displayName || user.email}</strong>
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleCreateUser}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Criar Usuário de Exemplo
            </button>
            
            <button
              onClick={handleGetUsers}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Buscar Usuários
            </button>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload de Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
                </div>
              )}
            </div>
            
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseUsageExample;

