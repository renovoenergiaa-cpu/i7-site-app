'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  UploadCloud, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Plus, 
  X, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import { GestaoDocument, INITIAL_DOCUMENTS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<GestaoDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Document form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'CONTRATO' | 'VISTORIA' | 'APOLICE' | 'REGULAMENTO' | 'NOTIFICACAO'>('CONTRATO');
  const [newUnit, setNewUnit] = useState('Edifício Paulista Corporate');
  const [newTargetRole, setNewTargetRole] = useState<'TODOS' | 'PROPRIETARIO' | 'INQUILINO'>('TODOS');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    setDocs(getStoredData('documents', INITIAL_DOCUMENTS));
  }, []);

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newDoc: GestaoDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      unitName: newUnit,
      targetRole: newTargetRole,
      fileUrl: newUrl || 'https://docs.i7.com.br/arquivos/exemplo-documento.pdf',
      fileSize: '1.8 MB',
      uploadedAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newDoc, ...docs];
    setDocs(updated);
    saveStoredData('documents', updated);
    setIsModalOpen(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este documento?')) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      saveStoredData('documents', updated);
    }
  };

  const filteredDocs = docs.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Repositório de Documentos</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Upload e consulta de contratos assinados, vistorias, laudos e termos vinculados a quem interessa.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <UploadCloud className="w-4 h-4" /> Enviar Novo Documento
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título ou unidade vinculada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="CONTRATO">Contratos</option>
            <option value="VISTORIA">Laudos de Vistoria</option>
            <option value="REGULAMENTO">Regulamentos Internos</option>
            <option value="APOLICE">Apólices de Seguro</option>
            <option value="NOTIFICACAO">Notificações Legais</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between hover:border-brand-lime transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-brand-lime/10 text-brand-lime">
                  {doc.category}
                </span>
                <span className="text-[10px] text-text-secondary font-bold">
                  {doc.fileSize}
                </span>
              </div>

              <h3 className="font-bold text-sm text-text-primary leading-snug">
                {doc.title}
              </h3>

              <div className="text-xs text-text-secondary space-y-0.5">
                <div>Unidade: <span className="font-bold text-text-primary">{doc.unitName}</span></div>
                <div>Visibilidade: <span className="font-bold text-brand-lime">{doc.targetRole}</span></div>
                <div className="text-[11px] text-text-muted">Enviado em {doc.uploadedAt}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-brand-lime" /> Visualizar
              </a>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remover documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Cadastrar / Enviar Documento</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laudo de Vistoria de Saída"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="CONTRATO">Contrato de Locação</option>
                    <option value="VISTORIA">Laudo de Vistoria</option>
                    <option value="APOLICE">Apólice de Seguro</option>
                    <option value="REGULAMENTO">Regulamento Interno</option>
                    <option value="NOTIFICACAO">Notificação Formal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Público Alvo (Quem Vê)</label>
                  <select
                    value={newTargetRole}
                    onChange={(e: any) => setNewTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="TODOS">Todos (Proprietário + Inquilino)</option>
                    <option value="PROPRIETARIO">Apenas Proprietário</option>
                    <option value="INQUILINO">Apenas Inquilino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Unidade / Imóvel Vinculado</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Link ou Arquivo PDF</label>
                <input
                  type="url"
                  placeholder="https://docs.i7.com.br/arquivo.pdf"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
