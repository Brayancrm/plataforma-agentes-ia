import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';
import CSVImportService, { ImportResult, CSVRow } from '../services/csvImportService';
import { Client } from '../types';

interface CSVImportComponentProps {
  companyId?: string;
  onImportComplete: (clients: Client[]) => void;
}

const CSVImportComponent: React.FC<CSVImportComponentProps> = ({ companyId, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      alert('Por favor, selecione um arquivo CSV válido.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setImportResult(null);
    } else {
      alert('Por favor, solte um arquivo CSV válido.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setImporting(true);
      const result = await CSVImportService.processCSV(file, companyId || 'default-company');
      setImportResult(result);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar arquivo CSV. Verifique o formato.');
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = async () => {
    if (!importResult) return;

    try {
      setImporting(true);
      await CSVImportService.uploadToServer(importResult);
      
      // Chamar callback com clientes importados
      onImportComplete(importResult.clients);
      
      // Resetar estado
      setFile(null);
      setImportResult(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert(`Importação concluída com sucesso! ${importResult.successRows} clientes importados.`);
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao confirmar importação. Tente novamente.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'Nome,CPF,Telefone,Email,Grupo,Observacoes\nJoão da Silva,12345678901,11999999999,joao@email.com,Grupo A,Cliente importante\nMaria Lima,98765432100,11988888888,maria@email.com,Grupo B,VIP';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadErrors = () => {
    if (!importResult?.errors.length) return;
    
    const errorsCSV = CSVImportService.exportErrorsToCSV(importResult.errors);
    const blob = new Blob([errorsCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erros_importacao.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Importar Clientes via CSV</h2>
        <p className="text-gray-600">
          Faça upload de um arquivo CSV com os dados dos seus clientes. 
          Os campos obrigatórios são: Nome, CPF e Telefone.
        </p>
      </div>

      {/* Área de Upload */}
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!file ? (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Arraste e solte seu arquivo CSV aqui
              </p>
              <p className="text-gray-500 mb-4">ou</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Selecionar Arquivo
              </button>
            </div>
          ) : (
            <div>
              <FileText className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Arquivo selecionado: {file.name}
              </p>
              <p className="text-gray-500 mb-4">
                Tamanho: {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="space-x-3">
                <button
                  onClick={processFile}
                  disabled={importing}
                  className="btn-primary"
                >
                  {importing ? 'Processando...' : 'Processar Arquivo'}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setImportResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="btn-secondary"
                >
                  Trocar Arquivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Download do Template */}
      <div className="mb-6 text-center">
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Template CSV
        </button>
      </div>

      {/* Preview dos Resultados */}
      {showPreview && importResult && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Resultado da Importação</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {importResult.success ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sucesso
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Com Erros
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{importResult.totalRows}</div>
              <div className="text-sm text-gray-500">Total de Linhas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResult.successRows}</div>
              <div className="text-sm text-green-500">Sucessos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResult.errorRows}</div>
              <div className="text-sm text-red-500">Erros</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((importResult.successRows / importResult.totalRows) * 100)}%
              </div>
              <div className="text-sm text-blue-500">Taxa de Sucesso</div>
            </div>
          </div>

          {/* Lista de Erros */}
          {importResult.errors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900">Erros Encontrados</h4>
                <button
                  onClick={downloadErrors}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exportar Erros
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="flex items-center p-2 bg-red-50 rounded mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Linha {error.row}</span>
                      {error.field && ` - Campo "${error.field}"`}: {error.message}
                      {error.value && (
                        <span className="text-red-600"> (Valor: "{error.value}")</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview dos Clientes */}
          {importResult.clients.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Preview dos Clientes ({importResult.clients.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grupo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResult.clients.slice(0, 10).map((client, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">{client.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{client.cpf}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{client.phone}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{client.email || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{client.group || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importResult.clients.length > 10 && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Mostrando 10 de {importResult.clients.length} clientes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPreview(false)}
              className="btn-secondary"
            >
              Voltar
            </button>
            <button
              onClick={confirmImport}
              disabled={importing || importResult.clients.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importando...' : `Confirmar Importação (${importResult.clients.length} clientes)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImportComponent;
