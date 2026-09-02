'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Receipt, 
  DollarSign, 
  Wrench, 
  FolderOpen, 
  Bell, 
  BarChart3, 
  CreditCard, 
  ShieldCheck, 
  Settings,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { logoutUser } from '@/lib/auth';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/painel', icon: LayoutDashboard },
  { name: 'Prédios / Unidades', href: '/painel/unidades', icon: Building2 },
  { name: 'Usuários', href: '/painel/usuarios', icon: Users },
  { name: 'Contratos', href: '/painel/contratos', icon: FileText },
  { name: 'Boletos & Cobrança', href: '/painel/boletos', icon: Receipt },
  { name: 'Pagamentos & Conciliação', href: '/painel/pagamentos', icon: DollarSign },
  { name: 'Manutenções (Kanban)', href: '/painel/manutencoes', icon: Wrench },
  { name: 'Documentos', href: '/painel/documentos', icon: FolderOpen },
  { name: 'Comunicados', href: '/painel/comunicados', icon: Bell },
  { name: 'Relatórios (DIMOB/CSV)', href: '/painel/relatorios', icon: BarChart3 },
  { name: 'Despesas', href: '/painel/despesas', icon: CreditCard },
  { name: 'Auditoria', href: '/painel/auditoria', icon: ShieldCheck },
  { name: 'Configurações', href: '/painel/configuracoes', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border md:min-h-screen flex flex-col shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/painel" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-surface border border-brand-lime/40 flex items-center justify-center font-bold text-sm text-brand-lime shadow-glow-lime">
              i7
            </div>
            <div>
              <div className="text-xs font-black text-text-primary tracking-widest uppercase">Painel de Gestão</div>
              <div className="text-[10px] font-semibold text-brand-lime uppercase">Administrador</div>
            </div>
          </Link>
        </div>

        {/* Shortcut to Portals */}
        <div className="px-4 pt-3 pb-1">
          <Link 
            href="/portal"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-brand-lime/10 text-brand-lime hover:bg-brand-lime/20 text-xs font-bold transition-colors"
          >
            <span>Ver Portal do Usuário</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/painel' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-brand-lime text-white shadow-sm' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface/50">
        {children}
      </main>
    </div>
  );
}
