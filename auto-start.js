const { exec } = require('child_process');
const fs = require('fs');

// Função para verificar se o servidor está rodando
function checkServer() {
  return new Promise((resolve) => {
    exec('netstat -an | findstr :3000', (error, stdout) => {
      resolve(stdout.includes('3000'));
    });
  });
}

// Função para matar processos do Node.js
function killNodeProcesses() {
  return new Promise((resolve) => {
    exec('taskkill /F /IM node.exe /T', () => {
      setTimeout(resolve, 2000); // Aguarda 2s para garantir que os processos foram finalizados
    });
  });
}

// Função para iniciar o servidor
function startServer() {
  console.log('🚀 Iniciando servidor...');
  const child = exec('npm start', { cwd: __dirname });
  
  child.stdout.on('data', (data) => {
    if (data.includes('webpack compiled') || data.includes('compiled successfully')) {
      console.log('✅ Servidor iniciado com sucesso!');
      console.log('🌐 Acesse: http://localhost:3000');
    }
  });
  
  child.stderr.on('data', (data) => {
    if (!data.includes('Warning')) {
      console.error('❌ Erro:', data);
    }
  });
}

// Função principal de auto-start
async function autoStart() {
  console.log('🔄 Verificando status do servidor...');
  
  const isRunning = await checkServer();
  
  if (isRunning) {
    console.log('⚠️  Servidor já está rodando. Reiniciando...');
    await killNodeProcesses();
  }
  
  console.log('🔧 Preparando para iniciar o servidor...');
  setTimeout(startServer, 1000);
}

// Executar se chamado diretamente
if (require.main === module) {
  autoStart();
}

module.exports = { autoStart, checkServer, startServer };


