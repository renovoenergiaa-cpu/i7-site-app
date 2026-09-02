'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, UserPlus, Shield, Mail, Phone, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';
import { GestaoUser, INITIAL_USERS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<GestaoUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'OWNER' | 'TENANT' | 'ADMIN'>('TENANT');

  useEffect(() => {
    setUsers(getStoredData('users', INITIAL_USERS));
  }, []);

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: GestaoUser = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '(11) 90000-0000',
      role: newRole,
      status: 'CONVIDADO',
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredData('users', updated);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    alert(`Convite com link seguro de acesso enviado por e-mail para ${newEmail}!`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'ATIVO' ? ('BLOQUEADO' as const) : ('ATIVO' as const)
        };
      }
      return u;
    });
    setUsers(updated);
    saveStoredData('users', updated);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Usuários & Acessos</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Cadastro de inquilinos, proprietários e administradores com envio de convites e controle de permissões.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Convidar Novo Usuário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Inquilinos Cadastrados</div>
          <div className="text-2xl font-black text-text-primary">
            {users.filter(u => u.role === 'TENANT').length}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Acesso ao Portal do Inquilino</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Proprietários Titulares</div>
          <div className="text-2xl font-black text-brand-lime">
            {users.filter(u => u.role === 'OWNER').length}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Acesso ao Portal do Proprietário</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Equipe Administrativa</div>
          <div className="text-2xl font-black text-text-primary">
            {users.filter(u => u.role === 'ADMIN').length}
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Acesso irrestrito ao painel de gestão</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todos os Perfis</option>
            <option value="ADMIN">Administradores</option>
            <option value="OWNER">Proprietários</option>
            <option value="TENANT">Inquilinos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Nome & Contato</th>
              <th className="p-4">Perfil / Papel</th>
              <th className="p-4">Vínculo / Unidade</th>
              <th className="p-4">Status</th>
              <th className="p-4">Cadastrado em</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-text-primary">{user.name}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">{user.email} • {user.phone}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'OWNER' ? 'bg-brand-lime/20 text-brand-lime' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'ADMIN' ? 'Administrador' : user.role === 'OWNER' ? 'Proprietário' : 'Inquilino'}
                  </span>
                </td>
                <td className="p-4 text-text-secondary font-medium">
                  {user.unitAssigned || (user.propertiesCount ? `${user.propertiesCount} unidades sob titularidade` : '—')}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' :
                    user.status === 'CONVIDADO' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-text-secondary">
                  {user.createdAt}
                </td>
                <td className="p-4 text-right space-x-1">
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        user.status === 'BLOQUEADO' 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {user.status === 'BLOQUEADO' ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  )}
                  {user.status === 'CONVIDADO' && (
                    <button
                      onClick={() => alert(`Convite reenviado com sucesso para ${user.email}!`)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 text-[11px]"
                    >
                      Reenviar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Convidar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Convidar Novo Usuário</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Almeida"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-8888"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Perfil de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                >
                  <option value="TENANT">Inquilino (Portal do Inquilino)</option>
                  <option value="OWNER">Proprietário (Portal do Proprietário)</option>
                  <option value="ADMIN">Administrador (Painel Completo)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-xs text-text-primary">
                O usuário receberá um convite por e-mail com instruções para definir sua senha e acessar o portal correspondente ao seu perfil.
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
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
