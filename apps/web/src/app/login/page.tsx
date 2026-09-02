'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { loginUser, registerUser, verifyEmailUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'TENANT' | 'OWNER'>('TENANT');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devHintCode, setDevHintCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await registerUser(name, email, password, role);
        setSuccessMessage(res.message);
        if (res.devVerificationCode) {
          setDevHintCode(res.devVerificationCode);
          setCode(res.devVerificationCode);
        }
        setMode('verify');
      } else if (mode === 'verify') {
        await verifyEmailUser(email, code);
        window.location.href = '/painel';
      } else {
        const res = await loginUser(email, password);
        if (res.user.role === 'ADMIN') {
          window.location.href = '/painel';
        } else {
          window.location.href = '/portal';
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Ocorreu um erro ao autenticar.';
      setErrorMessage(msg);
      if (mode === 'login' && (msg.includes('não verificado') || msg.includes('confirmação'))) {
        setMode('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      
      <div className="p-8 rounded-2xl glass-panel border border-brand-lime/30 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-surface border border-brand-lime/40 flex items-center justify-center font-bold text-2xl text-brand-lime mx-auto shadow-glow-lime">
            i7
          </div>
          <h1 className="text-2xl font-black text-text-primary">
            {mode === 'login' && 'Acessar Conta i7'}
            {mode === 'register' && 'Criar Conta no i7'}
            {mode === 'verify' && 'Confirmar E-mail'}
          </h1>
          <p className="text-xs text-text-secondary">
            {mode === 'login' && 'Entre com seu e-mail e senha cadastrados'}
            {mode === 'register' && 'Selecione seu perfil e faça seu cadastro'}
            {mode === 'verify' && 'Digite o código de 6 dígitos enviado por e-mail'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-semibold text-center">
            {successMessage}
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-border text-xs font-bold">
          <button 
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-brand-lime text-background shadow-glow-lime' : 'text-text-secondary'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 rounded-lg transition-all ${mode === 'register' ? 'bg-brand-lime text-background shadow-glow-lime' : 'text-text-secondary'}`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Seu Nome Completo</label>
                <div className="flex items-center gap-2 bg-surface-card border border-border rounded-xl px-3 py-2.5">
                  <User className="w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Ex: João da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                    required={mode === 'register'}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Eu quero</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('TENANT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'TENANT' ? 'bg-brand-lime text-background border-brand-lime' : 'bg-surface border-border text-text-secondary'
                    }`}
                  >
                    Alugar / Comprar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'OWNER' ? 'bg-brand-lime text-white border-brand-lime' : 'bg-surface border-border text-text-secondary'
                    }`}
                  >
                    Anunciar Imóvel
                  </button>
                </div>
              </div>
            </>
          )}

          {mode !== 'verify' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">E-mail</label>
                <div className="flex items-center gap-2 bg-surface-card border border-border rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <input 
                    type="email" 
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Senha</label>
                <div className="flex items-center gap-2 bg-surface-card border border-border rounded-xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'verify' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">E-mail Cadastrado</label>
                <div className="flex items-center gap-2 bg-surface-card border border-border rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <input 
                    type="email" 
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Código de Verificação (6 dígitos)</label>
                <div className="flex items-center gap-2 bg-surface-card border border-brand-lime rounded-xl px-3 py-2.5">
                  <KeyRound className="w-4 h-4 text-brand-lime" />
                  <input 
                    type="text" 
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-transparent text-lg tracking-widest font-black text-brand-lime text-center focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && 'Entrar na Plataforma'}
                {mode === 'register' && 'Cadastrar e Enviar Código'}
                {mode === 'verify' && 'Confirmar E-mail e Acessar'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-text-muted text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
          Seus dados estão 100% protegidos com criptografia i7
        </div>

      </div>

    </div>
  );
}
