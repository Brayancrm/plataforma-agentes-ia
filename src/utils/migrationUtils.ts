import { useFirestore } from '../hooks/useFirestore';
import { FIREBASE_CONFIG } from '../config/firebaseConfig';

// Interface para dados migrados
interface MigrationResult {
  success: boolean;
  message: string;
  migratedCount: number;
  errors: string[];
}

// Função para migrar dados do localStorage para o Firestore
export const migrateLocalStorageToFirestore = async (
  companyId: string,
  createDocument: any
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    message: 'Migração concluída com sucesso',
    migratedCount: 0,
    errors: []
  };

  try {
    // Migrar usuários
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length > 0) {
      for (const user of users) {
        try {
          const userData = {
            ...user,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete userData.id; // Remover ID antigo
          await createDocument('usuarios', userData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar usuário ${user.name}: ${error.message}`);
        }
      }
    }

    // Migrar empresas
    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    if (companies.length > 0) {
      for (const company of companies) {
        try {
          const companyData = {
            ...company,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete companyData.id;
          await createDocument('empresas', companyData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar empresa ${company.name}: ${error.message}`);
        }
      }
    }

    // Migrar planos
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    if (plans.length > 0) {
      for (const plan of plans) {
        try {
          const planData = {
            ...plan,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete planData.id;
          await createDocument('planos', planData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar plano ${plan.name}: ${error.message}`);
        }
      }
    }

    // Migrar clientes
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    if (clients.length > 0) {
      for (const client of clients) {
        try {
          const clientData = {
            ...client,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete clientData.id;
          await createDocument('clientes', clientData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar cliente ${client.name}: ${error.message}`);
        }
      }
    }

    // Migrar grupos de clientes
    const clientGroups = JSON.parse(localStorage.getItem('clientGroups') || '[]');
    if (clientGroups.length > 0) {
      for (const group of clientGroups) {
        try {
          const groupData = {
            ...group,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete groupData.id;
          await createDocument('grupos_clientes', groupData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar grupo ${group.name}: ${error.message}`);
        }
      }
    }

    // Migrar campanhas
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    if (campaigns.length > 0) {
      for (const campaign of campaigns) {
        try {
          const campaignData = {
            ...campaign,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete campaignData.id;
          await createDocument('campanhas', campaignData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar campanha ${campaign.name}: ${error.message}`);
        }
      }
    }

    // Migrar agentes IA
    const agents = JSON.parse(localStorage.getItem('agents') || '[]');
    if (agents.length > 0) {
      for (const agent of agents) {
        try {
          const agentData = {
            ...agent,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete agentData.id;
          await createDocument('agentes_ia', agentData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar agente ${agent.name}: ${error.message}`);
        }
      }
    }

    // Migrar produtos
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    if (products.length > 0) {
      for (const product of products) {
        try {
          const productData = {
            ...product,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete productData.id;
          await createDocument('produtos', productData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar produto ${product.name}: ${error.message}`);
        }
      }
    }

    // Migrar serviços
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    if (services.length > 0) {
      for (const service of services) {
        try {
          const serviceData = {
            ...service,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete serviceData.id;
          await createDocument('servicos', serviceData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar serviço ${service.name}: ${error.message}`);
        }
      }
    }

    // Migrar pagamentos
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    if (payments.length > 0) {
      for (const payment of payments) {
        try {
          const paymentData = {
            ...payment,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete paymentData.id;
          await createDocument('pagamentos', paymentData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar pagamento ${payment.description}: ${error.message}`);
        }
      }
    }

    // Migrar notas fiscais
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    if (invoices.length > 0) {
      for (const invoice of invoices) {
        try {
          const invoiceData = {
            ...invoice,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete invoiceData.id;
          await createDocument('notas_fiscais', invoiceData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar nota fiscal ${invoice.number}: ${error.message}`);
        }
      }
    }

    // Migrar integrações
    const integrations = JSON.parse(localStorage.getItem('integrations') || '[]');
    if (integrations.length > 0) {
      for (const integration of integrations) {
        try {
          const integrationData = {
            ...integration,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete integrationData.id;
          await createDocument('integracoes', integrationData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar integração ${integration.name}: ${error.message}`);
        }
      }
    }

    // Migrar imagens
    const images = JSON.parse(localStorage.getItem('images') || '[]');
    if (images.length > 0) {
      for (const image of images) {
        try {
          const imageData = {
            ...image,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete imageData.id;
          await createDocument('imagens', imageData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar imagem ${image.prompt}: ${error.message}`);
        }
      }
    }

    // Migrar vídeos
    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    if (videos.length > 0) {
      for (const video of videos) {
        try {
          const videoData = {
            ...video,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          delete videoData.id;
          await createDocument('videos', videoData);
          result.migratedCount++;
        } catch (error: any) {
          result.errors.push(`Erro ao migrar vídeo ${video.prompt}: ${error.message}`);
        }
      }
    }

    // Limpar localStorage após migração bem-sucedida
    if (result.errors.length === 0) {
      localStorage.clear();
      result.message = `Migração concluída com sucesso! ${result.migratedCount} itens migrados.`;
    } else {
      result.success = false;
      result.message = `Migração concluída com ${result.errors.length} erros. ${result.migratedCount} itens migrados.`;
    }

  } catch (error: any) {
    result.success = false;
    result.message = `Erro durante a migração: ${error.message}`;
    result.errors.push(error.message);
  }

  return result;
};

// Função para verificar se há dados no localStorage
export const hasLocalStorageData = (): boolean => {
  const keys = [
    'users', 'companies', 'plans', 'clients', 'clientGroups', 
    'campaigns', 'agents', 'products', 'services', 'payments', 
    'invoices', 'integrations', 'images', 'videos'
  ];
  
  return keys.some(key => {
    const data = localStorage.getItem(key);
    return data && JSON.parse(data).length > 0;
  });
};

// Função para obter estatísticas dos dados no localStorage
export const getLocalStorageStats = () => {
  const stats: Record<string, number> = {};
  
  const keys = [
    'users', 'companies', 'plans', 'clients', 'clientGroups', 
    'campaigns', 'agents', 'products', 'services', 'payments', 
    'invoices', 'integrations', 'images', 'videos'
  ];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        stats[key] = Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        stats[key] = 0;
      }
    } else {
      stats[key] = 0;
    }
  });
  
  return stats;
};

