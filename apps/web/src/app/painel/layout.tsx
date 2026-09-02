'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, DollarSign, Wrench, Shield, Bell, FolderOpen } from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/painel', icon: Home },
  { name: 'Usuários', href: '/painel/usuarios', icon: Users },
  { name: 'Contratos', href: '/painel/contratos', icon: FileText },
  { name: 'Financeiro', href: '/painel/financeiro', icon: DollarSign },
  { name: 'Documentos', href: '/painel/documentos', icon: FolderOpen },
  { name: 'Manutenções', href: '/painel/manutencoes', icon: Wrench },
  { name: 'Comunicados', href: '/painel/comunicados', icon: Bell },
  { name: 'Auditoria', href: '/painel/auditoria', icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border md:min-h-screen flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
          <Link href="/painel" className="text-xl font-black text-brand-lime flex items-center gap-2">
            i7 <span className="text-text-primary text-sm tracking-widest uppercase">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/painel' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-brand-lime text-white shadow-md' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
