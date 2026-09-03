'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  FileText, 
  Receipt, 
  DollarSign, 
  Wrench, 
  FolderOpen, 
  Bell, 
  BarChart3, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { 
  INITIAL_UNITS, 
  INITIAL_BOLETOS, 
  INITIAL_MAINTENANCES, 
  INITIAL_PAYMENTS,
  INITIAL_USERS,
  INITIAL_VISITS,
  getStoredData,
  BuildingUnit,
  GestaoBoleto,
  GestaoMaintenance,
  ScheduledVisit
} from '@/lib/gestaoData';

export default function AdminDashboardPage() {
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [boletos, setBoletos] = useState<GestaoBoleto[]>([]);
  const [maintenances, setMaintenances] = useState<GestaoMaintenance[]>([]);
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);

  useEffect(() => {
    setUnits(getStoredData('units', INITIAL_UNITS));
    setBoletos(getStoredData('boletos', INITIAL_BOLETOS));
    setMaintenances(getStoredData('maintenances', INITIAL_MAINTENANCES));
    setVisits(getStoredData('scheduled_visits', INITIAL_VISITS));
  }, []);

  // Compute metrics
  const totalUnits = units.length || 1;
  const occupiedUnits = units.filter(u => u.status === 'LOCADO').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);

  const totalReceivable = boletos.reduce((acc, b) => acc + (b.status === 'EM_ABERTO' || b.status === 'VENCIDO' ? b.amount : 0), 0);
  const totalReceived = boletos.reduce((acc, b) => acc + (b.status === 'PAGO' ? b.amount : 0), 0);
  const totalOverdue = boletos.filter(b => b.status === 'VENCIDO').reduce((acc, b) => acc + b.amount, 0);

  const pendingMaintenances = maintenances.filter(m => m.status !== 'CONCLUIDO');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-text-primary">Painel de Gestão Imobiliária</h1>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-lime/15 text-brand-lime border border-brand-lime/30">
              Admin Master
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Visão consolidada de receita, cobrança, ocupação predial e chamados operacionais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/painel/boletos"
            className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Emitir Cobrança
          </Link>
          <Link
            href="/painel/unidades"
            className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-xs font-bold hover:border-brand-lime transition-all"
          >
            Nova Unidade
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Receita & Cobrança */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">A Receber no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text-primary">
            R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-text-secondary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime" />
            <span>R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} já liquidados</span>
          </div>
        </div>

        {/* Status de Cobrança / Inadimplência */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Inadimplência (Régua Ativa)</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">
            R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-text-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{boletos.filter(b => b.status === 'VENCIDO').length} boletos em cobrança ativa</span>
          </div>
        </div>

        {/* Taxa de Ocupação */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Ocupação</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {occupancyRate}%
          </div>
          <div className="mt-2 text-xs text-text-secondary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{occupiedUnits} de {totalUnits} salas/unidades locadas</span>
          </div>
        </div>

        {/* Chamados Abertos */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Manutenções Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {pendingMaintenances.length}
          </div>
          <div className="mt-2 text-xs text-text-secondary flex items-center gap-1.5">
            <span>{maintenances.filter(m => m.status === 'CONCLUIDO').length} finalizados este mês</span>
          </div>
        </div>
      </div>

      {/* Alerta de Visitas Presenciais Aguardando Confirmação */}
      {visits.filter(v => v.status === 'PENDENTE_CONFIRMACAO').length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                <span>🔔 Solicitações de Visita Aguardando Confirmação</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                  {visits.filter(v => v.status === 'PENDENTE_CONFIRMACAO').length} Nova(s)
                </span>
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Há clientes aguardando confirmação de horário ou contato no WhatsApp para visitar imóveis presenciais.
              </p>
            </div>
          </div>

          <Link
            href="/painel/visitas"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow flex items-center justify-center gap-2 shrink-0 transition-all"
          >
            Gerenciar Visitas & WhatsApp
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-text-primary tracking-wide">Módulos de Gestão</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link
            href="/painel/visitas"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
                Agendamento de Visitas
              </h3>
              {visits.filter(v => v.status === 'PENDENTE_CONFIRMACAO').length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Confirme datas, proponha novos horários e converse com o cliente no WhatsApp.
            </p>
          </Link>

          <Link
            href="/painel/unidades"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Prédios e Unidades
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Cadastro de prédios, salas e unidades com controle de ocupação e valores.
            </p>
          </Link>

          <Link
            href="/painel/usuarios"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Usuários & Convites
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Gestão de inquilinos, proprietários e equipe com envio de convites.
            </p>
          </Link>

          <Link
            href="/painel/contratos"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Contratos de Locação
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Vigência, índice de reajuste (IPCA/IGP-M), garantia e multas.
            </p>
          </Link>

          <Link
            href="/painel/vistorias"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Vistorias Digitais
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Laudos periciais com fotos datadas, medidores e assinatura digital.
            </p>
          </Link>

          <Link
            href="/painel/boletos"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Boletos & Cobrança
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Emissão, cancelamento, estorno e régua automatizada de inadimplência.
            </p>
          </Link>

          <Link
            href="/painel/pagamentos"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Pagamentos & Conciliação
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Balanço previsto x recebido x repassado líquido aos proprietários.
            </p>
          </Link>

          <Link
            href="/painel/manutencoes"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Manutenções (Kanban)
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Chamados com fotos, orçamentos, aprovação de proprietário e técnicos.
            </p>
          </Link>

          <Link
            href="/painel/documentos"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Documentos & Arquivos
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Upload e consulta vinculada a inquilinos, proprietários ou unidades.
            </p>
          </Link>

          <Link
            href="/painel/comunicados"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Mural de Comunicados
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Avisos prediais com contagem e lista nominal de confirmação de leitura.
            </p>
          </Link>

          <Link
            href="/painel/relatorios"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Relatórios & DIMOB
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Extrato por proprietário e competência com exportação CSV e informe DIMOB.
            </p>
          </Link>

          <Link
            href="/painel/despesas"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Despesas & Lançamentos
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Lançamentos debitados no extrato do proprietário (reparos, IPTU, taxas).
            </p>
          </Link>

          <Link
            href="/painel/auditoria"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Auditoria de Ações
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Trilha de segurança detalhando quem fez o quê, horário e IP.
            </p>
          </Link>

          <Link
            href="/painel/configuracoes"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:border-brand-lime hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-brand-lime group-hover:border-brand-lime/40 mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-lime transition-colors">
              Configurações & Asaas
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Dados da imobiliária, taxas padrão de adm/multa e chaves do Asaas.
            </p>
          </Link>
        </div>
      </div>

      {/* Recentes / Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boletos Vencidos ou a Vencer */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-lime" /> Boletos em Foco
            </h3>
            <Link href="/painel/boletos" className="text-xs font-bold text-brand-lime hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="space-y-2.5">
            {boletos.slice(0, 4).map(bol => (
              <div key={bol.id} className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-text-primary">{bol.tenantName}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">{bol.unitName} • Venc: {bol.dueDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xs text-text-primary">
                    R$ {bol.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${
                    bol.status === 'PAGO' ? 'bg-emerald-100 text-emerald-700' :
                    bol.status === 'VENCIDO' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {bol.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chamados de Manutenção Pendentes */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-lime" /> Chamados Pendentes
            </h3>
            <Link href="/painel/manutencoes" className="text-xs font-bold text-brand-lime hover:underline">
              Ver Kanban
            </Link>
          </div>

          <div className="space-y-2.5">
            {maintenances.slice(0, 4).map(mnt => (
              <div key={mnt.id} className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-text-primary">{mnt.title}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">{mnt.unitName} • Solicitante: {mnt.requestedBy}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    mnt.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-700' :
                    mnt.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-700' :
                    mnt.status === 'EM_ANALISE' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {mnt.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
