'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface DocumentModel {
  id: string;
  title: string;
  url: string;
  type: string;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const { getCurrentSession } = await import('@/lib/auth');
      const s = getCurrentSession();
      const token = s?.accessToken;
      const res = await fetch('http://localhost:4000/api/documents/my-documents', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('type', 'CONTRACT');

    try {
      const { getCurrentSession } = await import('@/lib/auth');
      const s = getCurrentSession();
      const token = s?.accessToken;
      const res = await fetch('http://localhost:4000/api/documents/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Falha no upload do documento');
      }

      setUploadStatus('success');
      setFile(null);
      setTitle('');
      
      // Atualiza a lista após salvar com sucesso
      fetchDocuments();
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Gestão de Documentos</h1>
          <p className="text-sm text-text-secondary mt-1">Faça o upload e gerencie seus arquivos</p>
        </div>
        <Link href="/painel" className="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-surface-hover transition-colors">
          Voltar ao Painel
        </Link>
      </div>

      {/* Upload Form */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm">
        <h2 className="text-lg font-bold text-text-primary mb-4">Enviar Novo Arquivo</h2>
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Título do Documento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Contrato de Locação - João Silva"
              className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-sm text-text-primary focus:outline-none focus:border-brand-lime transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Arquivo (PDF, JPG, PNG)</label>
            <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-hover/50 hover:bg-surface-hover transition-colors relative">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-brand-lime mb-3" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> {file.name}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB - Clique para alterar</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary">Arraste seu arquivo ou clique para selecionar</p>
                  <p className="text-xs text-text-secondary mt-1">Tamanho máximo: 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              {uploadStatus === 'success' && (
                <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Documento salvo com sucesso!
                </p>
              )}
              {uploadStatus === 'error' && (
                <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Erro ao enviar documento.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-6 py-3 rounded-xl font-bold bg-brand-lime text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-lime-hover transition-colors shadow-md flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Salvar Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Documentos */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary">Arquivos Salvos</h2>
          <button onClick={fetchDocuments} className="p-2 text-text-muted hover:text-brand-lime transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingDocs ? (
          <div className="py-10 text-center text-text-muted">Carregando documentos...</div>
        ) : documents.length === 0 ? (
          <div className="py-10 text-center text-text-muted border-2 border-dashed border-border rounded-xl">
            Nenhum documento salvo ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-brand-lime hover:shadow-sm transition-all bg-surface-hover/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{doc.title}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white border border-border rounded-lg text-sm font-bold hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
