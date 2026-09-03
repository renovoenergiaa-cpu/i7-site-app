'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Key, 
  CheckCircle2, 
  Shield, 
  Percent, 
  CreditCard, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { GestaoSettings, INITIAL_SETTINGS, getStoredData, saveStoredData, logAuditEvent, resetToCleanBaseline } from '@/lib/gestaoData';
import { RotateCcw } from 'lucide-react';

export default function ConfiguracoesAdminPage() {
  const [settings, setSettings] = useState<GestaoSettings>(INITIAL_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setSettings(getStoredData('settings', INITIAL_SETTINGS));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredData('settings', settings);
    logAuditEvent(
      'ALTERACAO_CONFIGURACOES',
      'Configurações Gerais',
      `Atualização dos parâmetros contratuais e dados da administradora (${settings.organizationName})`
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetBaseline = () => {
    if (confirm('Deseja limpar todos os dados de teste e restaurar a base com apenas 1 exemplo de referência oficial?')) {
      resetToCleanBaseline();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Configurações Gerais & Asaas</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Parâmetros da imobiliária, taxas contratuais padrão e credenciais bancárias da API Asaas.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4" /> Configurações salvas!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Organização */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h2 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-brand-lime" /> Dados da Imobiliária / Administradora
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Razão Social / Nome Fantasia</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">CNPJ</label>
              <input
                type="text"
                value={settings.cnpj}
                onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">E-mail Institucional</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Endereço da Sede</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
            />
          </div>
        </div>

        {/* Taxas Padrão */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h2 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
            <Percent className="w-4 h-4 text-brand-lime" /> Taxas Contratuais Padrão
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Comissão de Adm Padrão (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultAdminFeePercent}
                onChange={(e) => setSettings({ ...settings, defaultAdminFeePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Retenção sobre o aluguel bruto</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Multa por Atraso (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.defaultFinePercent}
                onChange={(e) => setSettings({ ...settings, defaultFinePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Aplicada após o vencimento</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Juros de Mora Diário (%)</label>
              <input
                type="number"
                step="0.001"
                value={settings.defaultDailyInterestPercent}
                onChange={(e) => setSettings({ ...settings, defaultDailyInterestPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-text-muted mt-1 block">Calculado por dia de atraso (~1% a.m.)</span>
            </div>
          </div>
        </div>

        {/* Integração Asaas */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
              <Key className="w-4 h-4 text-brand-lime" /> Integração Gateway Asaas (PIX / Boleto)
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
              API Conectada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Ambiente</label>
              <select
                value={settings.asaasEnvironment}
                onChange={(e: any) => setSettings({ ...settings, asaasEnvironment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
              >
                <option value="SANDBOX">Sandbox (Testes e Demonstração)</option>
                <option value="PRODUCTION">Produção (Cobrança Real)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">Identificador da Carteira (Wallet ID)</label>
              <input
                type="text"
                value={settings.asaasWalletId}
                onChange={(e) => setSettings({ ...settings, asaasWalletId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Chave de API (API Key Asaas)</label>
            <input
              type="password"
              value={settings.asaasApiKey}
              onChange={(e) => setSettings({ ...settings, asaasApiKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="autoDunning"
              checked={settings.autoDunningEnabled}
              onChange={(e) => setSettings({ ...settings, autoDunningEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-brand-lime focus:ring-brand-lime"
            />
            <label htmlFor="autoDunning" className="text-xs font-bold text-text-primary cursor-pointer">
              Ativar régua automática de cobrança e envio de lembretes por WhatsApp / E-mail
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>

      </form>

      {/* Card: Gestão de Dados & Baseline Limpa */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-lime" /> Manutenção da Base de Dados
            </h3>
            <p className="text-xs text-text-secondary">
              Restaura a plataforma para a base limpa de produção com exatamente <strong>1 exemplo de referência oficial</strong> (Sala 101, Eduardo Silveira e Lucas Mendes), removendo testes e simulações antigas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetBaseline}
            className="px-4 py-2.5 rounded-xl bg-surface border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Resetar para 1 Exemplo Limpo
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Base restaurada com sucesso com 1 exemplo oficial! Atualizando tela...
          </div>
        )}
      </div>

    </div>
  );
}
