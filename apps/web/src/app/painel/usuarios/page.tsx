'use client';

import React from 'react';
import { Users, Search, Filter, UserPlus, MoreVertical, Shield } from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: 'João Silva', email: 'joao.silva@email.com', role: 'TENANT', status: 'ACTIVE', since: '12/03/2026' },
  { id: 2, name: 'Maria Oliveira', email: 'maria.prop@email.com', role: 'OWNER', status: 'ACTIVE', since: '05/01/2026' },
  { id: 3, name: 'Carlos Santos', email: 'carlos.santos@email.com', role: 'TENANT', status: 'PENDING', since: '18/08/2026' },
];

export default function UsersAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Gestão de Usuários</h1>
          <p className="text-sm text-text-secondary mt-1">Administre inquilinos, proprietários e corretores</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-lime text-white hover:bg-brand-lime-hover transition-colors shadow-md flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" /> Convidar Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-hover/30">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou CPF..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-brand-lime bg-white"
            />
          </div>
          <button className="px-4 py-2.5 rounded-xl border border-border text-sm font-bold flex items-center gap-2 hover:bg-surface-hover transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50 text-xs font-bold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Papel (Role)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data de Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_USERS.map(user => (
                <tr key={user.id} className="hover:bg-surface-hover/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-lime/10 text-brand-lime flex items-center justify-center font-bold text-xs">
                        {user.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'OWNER' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {user.role === 'OWNER' ? 'Proprietário' : 'Inquilino'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {user.since}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
