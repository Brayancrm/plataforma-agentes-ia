import { Client, CSVImport, CSVError } from '../types';

export interface CSVRow {
  Nome: string;
  CPF: string;
  Telefone: string;
  Email?: string;
  Grupo?: string;
  Observacoes?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: CSVError[];
  clients: Client[];
}

export class CSVImportService {
  // Validar CPF brasileiro
  static validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  }

  // Validar telefone brasileiro
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    // Telefone deve ter 10 ou 11 dígitos (com DDD)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  // Validar email
  static validateEmail(email: string): boolean {
    if (!email) return true; // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar linha do CSV
  static validateRow(row: CSVRow, rowNumber: number): { isValid: boolean; errors: CSVError[] } {
    const errors: CSVError[] = [];

    // Validar nome
    if (!row.Nome || row.Nome.trim().length === 0) {
      errors.push({
        row: rowNumber,
        field: 'Nome',
        message: 'Nome é obrigatório',
        value: row.Nome
      });
    }

    // Validar CPF
    if (!row.CPF || !this.validateCPF(row.CPF)) {
      errors.push({
        row: rowNumber,
        field: 'CPF',
        message: 'CPF inválido',
        value: row.CPF
      });
    }

    // Validar telefone
    if (!row.Telefone || !this.validatePhone(row.Telefone)) {
      errors.push({
        row: rowNumber,
        field: 'Telefone',
        message: 'Telefone inválido',
        value: row.Telefone
      });
    }

    // Validar email (se fornecido)
    if (row.Email && !this.validateEmail(row.Email)) {
      errors.push({
        row: rowNumber,
        field: 'Email',
        message: 'Email inválido',
        value: row.Email
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Processar arquivo CSV
  static async processCSV(file: File, companyId: string): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvContent = event.target?.result as string;
          const result = this.parseCSV(csvContent, companyId);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo CSV'));
      };

      reader.readAsText(file);
    });
  }

  // Parsear conteúdo CSV
  static parseCSV(csvContent: string, companyId: string): ImportResult {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validar cabeçalhos obrigatórios
    const requiredHeaders = ['Nome', 'CPF', 'Telefone'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Cabeçalhos obrigatórios não encontrados: ${missingHeaders.join(', ')}`);
    }

    const clients: Client[] = [];
    const errors: CSVError[] = [];
    let successRows = 0;
    let errorRows = 0;

    // Processar cada linha (começando da linha 1, pois linha 0 são os cabeçalhos)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Pular linhas vazias

      const values = this.parseCSVLine(line);
      const row: CSVRow = {
        Nome: values[headers.indexOf('Nome')] || '',
        CPF: values[headers.indexOf('CPF')] || '',
        Telefone: values[headers.indexOf('Telefone')] || '',
        Email: values[headers.indexOf('Email')] || '',
        Grupo: values[headers.indexOf('Grupo')] || '',
        Observacoes: values[headers.indexOf('Observacoes')] || ''
      };

      const validation = this.validateRow(row, i);
      
      if (validation.isValid) {
        const client: Client = {
          id: `temp_${Date.now()}_${i}`,
          name: row.Nome.trim(),
          cpf: row.CPF.replace(/\D/g, ''),
          phone: row.Telefone.replace(/\D/g, ''),
          email: row.Email?.trim() || undefined,
          group: row.Grupo?.trim() || undefined,
          observations: row.Observacoes?.trim() || undefined,
          companyId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        clients.push(client);
        successRows++;
      } else {
        errors.push(...validation.errors);
        errorRows++;
      }
    }

    return {
      success: errors.length === 0,
      totalRows: lines.length - 1, // -1 para excluir cabeçalhos
      successRows,
      errorRows,
      errors,
      clients
    };
  }

  // Parsear linha CSV considerando aspas
  static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  // Gerar relatório de importação
  static generateImportReport(result: ImportResult): string {
    let report = `Relatório de Importação CSV\n`;
    report += `=============================\n\n`;
    report += `Total de linhas: ${result.totalRows}\n`;
    report += `Linhas processadas com sucesso: ${result.successRows}\n`;
    report += `Linhas com erro: ${result.errorRows}\n\n`;

    if (result.errors.length > 0) {
      report += `Erros encontrados:\n`;
      report += `----------------\n`;
      result.errors.forEach(error => {
        report += `Linha ${error.row}, Campo "${error.field}": ${error.message}\n`;
        if (error.value) {
          report += `  Valor: "${error.value}"\n`;
        }
      });
    }

    return report;
  }

  // Exportar erros para CSV
  static exportErrorsToCSV(errors: CSVError[]): string {
    if (errors.length === 0) return '';

    let csv = 'Linha,Campo,Mensagem,Valor\n';
    errors.forEach(error => {
      csv += `${error.row},"${error.field}","${error.message}","${error.value || ''}"\n`;
    });

    return csv;
  }

  // Simular upload para servidor
  static async uploadToServer(importResult: ImportResult): Promise<CSVImport> {
    // Simulação de upload - em produção, isso seria uma chamada para a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const csvImport: CSVImport = {
          id: `import_${Date.now()}`,
          companyId: importResult.clients[0]?.companyId || '',
          fileName: 'clientes.csv',
          totalRows: importResult.totalRows,
          processedRows: importResult.totalRows,
          successRows: importResult.successRows,
          errorRows: importResult.errorRows,
          status: importResult.success ? 'completed' : 'failed',
          errors: importResult.errors,
          startedAt: new Date(),
          completedAt: new Date(),
          createdAt: new Date()
        };
        
        resolve(csvImport);
      }, 2000); // Simular delay de 2 segundos
    });
  }
}

export default CSVImportService;
