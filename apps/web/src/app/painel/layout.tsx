'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  Shield,
  UserCheck,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { getCurrentSession, logoutUser, UserSession } from '@/lib/auth';
import { 
  BuildingUnit, 
  INITIAL_UNITS, 
  ScheduledVisit, 
  INITIAL_VISITS, 
  GestaoUser, 
  INITIAL_USERS, 
  GestaoContract, 
  INITIAL_CONTRACTS, 
  GestaoBoleto, 
  INITIAL_BOLETOS, 
  GestaoPayment, 
  INITIAL_PAYMENTS, 
  GestaoMaintenance, 
  INITIAL_MAINTENANCES, 
  GestaoExpense, 
  INITIAL_EXPENSES, 
  InspectionReport,
  INITIAL_INSPECTIONS,
  getStoredData 
} from '@/lib/gestaoData';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/painel', icon: LayoutDashboard },
  { name: 'Prédios / Unidades', href: '/painel/unidades', icon: Building2 },
  { name: 'Agendamento de Visitas', href: '/painel/visitas', icon: Calendar },
  { name: 'Usuários & Perfis', href: '/painel/usuarios', icon: Users },
  { name: 'Contratos', href: '/painel/contratos', icon: FileText },
  { name: 'Vistorias Digitais', href: '/painel/vistorias', icon: ClipboardCheck },
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
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const currentSession = getCurrentSession();
    
    // Se não estiver logado, redireciona para login exigindo autenticação
    if (!currentSession) {
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}&msg=admin_required`;
      return;
    }

    // Se o usuário estiver logado mas NÃO for ADMIN, redireciona para o portal do usuário
    if (currentSession.user.role !== 'ADMIN') {
      window.location.href = '/portal?msg=unauthorized_admin';
      return;
    }

    setSession(currentSession);
    setIsCheckingAuth(false);

    // Calcular pendências reais de cada página para exibir a notificação ao lado do nome
    const computePending = () => {
      try {
        const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
        const visits = getStoredData<ScheduledVisit[]>('scheduled_visits', INITIAL_VISITS);
        const users = getStoredData<GestaoUser[]>('users', INITIAL_USERS);
        const contracts = getStoredData<GestaoContract[]>('contracts', INITIAL_CONTRACTS);
        const boletos = getStoredData<GestaoBoleto[]>('boletos', INITIAL_BOLETOS);
        const payments = getStoredData<GestaoPayment[]>('payments', INITIAL_PAYMENTS);
        const maintenances = getStoredData<GestaoMaintenance[]>('maintenances', INITIAL_MAINTENANCES);
        const expenses = getStoredData<GestaoExpense[]>('expenses', INITIAL_EXPENSES);
        const inspections = getStoredData<InspectionReport[]>('inspections', INITIAL_INSPECTIONS);

        const counts: Record<string, number> = {
          '/painel/unidades': units.filter(u => u.status === 'PENDENTE_AVALIACAO').length,
          '/painel/visitas': visits.filter(v => v.status === 'PENDENTE_CONFIRMACAO').length,
          '/painel/usuarios': users.filter(u => u.status === 'PENDENTE' || u.status === 'CONVIDADO').length,
          '/painel/contratos': contracts.filter(c => c.status === 'RENOVAÇÃO_PENDENTE').length,
          '/painel/vistorias': inspections.filter(i => i.status === 'AGUARDANDO_ASSINATURAS' || i.status === 'CONTESTADA').length,
          '/painel/boletos': boletos.filter(b => b.status === 'VENCIDO').length,
          '/painel/pagamentos': payments.filter(p => p.status === 'RECEBIDO_PENDENTE_REPASSE').length,
          '/painel/manutencoes': maintenances.filter(m => m.status === 'ABERTO' || m.status === 'EM_ANALISE').length,
          '/painel/despesas': expenses.filter(e => e.status === 'LANCADO').length,
        };

        const total = Object.values(counts).reduce((acc, c) => acc + c, 0);
        counts['/painel'] = total;

        setPendingCounts(counts);
      } catch (err) {
        console.error('Erro ao calcular notificações pendentes:', err);
      }
    };

    computePending();
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/login';
  };

  // Enquanto valida credenciais de Administrador
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-border shadow-lg text-center max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-brand-lime/40 flex items-center justify-center text-brand-lime mx-auto shadow-glow-lime animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-text-primary">Validando Acesso de Gestão</h2>
            <p className="text-xs text-text-secondary mt-1">Verificando credenciais de Administrador...</p>
          </div>
          <div className="w-6 h-6 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

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
              <div className="text-[10px] font-semibold text-brand-lime uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-ping" />
                Administrador Mestre
              </div>
            </div>
          </Link>
        </div>

        {/* User Card */}
        {session && (
          <div className="px-4 py-3 border-b border-border bg-surface/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-lime text-background font-black text-xs flex items-center justify-center shadow-sm">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-text-primary truncate">{session.user.name || 'Administrador'}</div>
                <div className="text-[10px] text-text-secondary truncate">{session.user.email}</div>
              </div>
            </div>
          </div>
        )}

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

        {/* Navigation Items with Pending Notifications */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/painel' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const count = pendingCounts[item.href] || 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive 
                    ? 'bg-brand-lime text-white shadow-sm' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : count > 0 ? 'text-amber-500' : 'text-text-secondary group-hover:text-brand-lime'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {/* Notificação ao lado do nome informando o que está pendente */}
                {count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white text-brand-lime shadow-sm'
                        : 'bg-amber-500 text-white shadow-sm animate-pulse'
                    }`}
                    title={`${count} pendência(s) que requerem atenção nesta página`}
                  >
                    {count}
                  </span>
                )}
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

