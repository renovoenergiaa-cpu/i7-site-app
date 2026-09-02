'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  Globe 
} from 'lucide-react';
import { GestaoAuditLog, INITIAL_AUDIT_LOGS, getStoredData } from '@/lib/gestaoData';

export default function AuditoriaAdminPage() {
  const [logs, setLogs] = useState<GestaoAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    setLogs(getStoredData('audit_logs', INITIAL_AUDIT_LOGS));
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Trilha de Auditoria & Segurança</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Registro imutável de todas as ações operacionais, alterações cadastrais, emissões e logins realizados no sistema.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" /> Logs em Tempo Real Ativos
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuário, recurso ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="EMISSAO_BOLETO">Emissão de Boleto</option>
            <option value="REGUA_INADIMPLENCIA">Régua de Inadimplência</option>
            <option value="APROVACAO_CHAMADO">Aprovação de Chamado</option>
            <option value="LOGIN_PORTAL">Login no Portal</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Data & Hora</th>
              <th className="p-4">Usuário Responsável</th>
              <th className="p-4">Ação</th>
              <th className="p-4">Recurso / Entidade</th>
              <th className="p-4">Detalhes da Operação</th>
              <th className="p-4">Endereço IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-[11px]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4 font-bold text-text-primary whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="p-4 font-sans font-bold text-text-primary">
                  {log.user}
                </td>
                <td className="p-4 font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-surface border border-border text-brand-lime">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 font-sans font-bold text-text-primary">
                  {log.entity}
                </td>
                <td className="p-4 font-sans text-text-secondary max-w-md">
                  {log.details}
                </td>
                <td className="p-4 text-text-muted">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
