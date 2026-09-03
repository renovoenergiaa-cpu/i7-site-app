'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Home, 
  Building2, 
  CheckCircle2, 
  ShieldAlert,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  verifyEmailUser, 
  resendVerificationCode 
} from '@/lib/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode and Role state
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [role, setRole] = useState<'TENANT' | 'OWNER'>('TENANT');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState('');

  // Initialize from search params
  useEffect(() => {
    const paramMode = searchParams.get('mode');
    const paramRole = searchParams.get('role');
    const paramRedirect = searchParams.get('redirect');

    if (paramMode === 'register') setMode('register');
    if (paramRole === 'OWNER') setRole('OWNER');
    if (paramRole === 'TENANT') setRole('TENANT');
    if (paramRedirect) setRedirectPath(paramRedirect);
  }, [searchParams]);

  // Reenviar Código de Ativação
  const handleResendCode = async () => {
    if (!email) {
      setErrorMessage('Informe o e-mail para receber o código.');
      return;
    }
    setResending(true);
    setErrorMessage('');
    try {
      await resendVerificationCode(email);
      setSuccessMessage(`Um novo código de confirmação foi enviado para ${email}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Não foi possível reenviar o código.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'register') {
        // Validações obrigatórias de cadastro
        if (!name.trim()) throw new Error('Por favor, informe seu nome completo.');
        if (!email.trim() || !email.includes('@')) throw new Error('Por favor, informe um e-mail válido.');
        if (!password.trim() || password.length < 6) throw new Error('A senha deve conter no mínimo 6 dígitos.');

        const res = await registerUser(name, email, password, role, phone);
        
        // Ativação obrigatória pós-cadastro: muda para a tela de verificação
        setSuccessMessage(res.message);
        setMode('verify');
        setCode('');

      } else if (mode === 'verify') {
        // Validação estrita do código recebido no e-mail
        if (!code.trim() || code.trim().length < 6) {
          throw new Error('Digite o código numérico de 6 dígitos enviado por e-mail.');
        }

        const session = await verifyEmailUser(email, code);
        setSuccessMessage('Conta verificada e ativada com sucesso! Acessando seu ambiente...');

        setTimeout(() => {
          if (session.user.role === 'ADMIN') {
            window.location.href = redirectPath || '/painel';
          } else if (session.user.role === 'OWNER') {
            window.location.href = '/portal?view=owner';
          } else {
            window.location.href = '/portal?view=tenant';
          }
        }, 800);

      } else {
        // Modo Login Estrito
        const res = await loginUser(email, password);
        setSuccessMessage('Login autorizado! Entrando...');
        
        setTimeout(() => {
          if (res.user.role === 'ADMIN') {
            window.location.href = redirectPath || '/painel';
          } else if (res.user.role === 'OWNER') {
            window.location.href = '/portal?view=owner';
          } else {
            window.location.href = '/portal?view=tenant';
          }
        }, 600);
      }
    } catch (err: any) {
      const msg = err.message || 'Ocorreu um erro ao processar sua solicitação.';

      // Se a conta não foi ativada pelo e-mail, redireciona para a tela de verificação!
      if (msg.startsWith('EMAIL_NOT_VERIFIED:')) {
        const userEmail = msg.replace('EMAIL_NOT_VERIFIED:', '');
        setEmail(userEmail);
        setMode('verify');
        setErrorMessage('Sua conta ainda não foi ativada. Digite o código de 6 dígitos que enviamos para seu e-mail.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      
      <div className="p-8 rounded-3xl bg-white border border-border shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow corner decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-lime text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            i7
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            {mode === 'login' && 'Acessar Plataforma'}
            {mode === 'register' && 'Cadastro Oficial'}
            {mode === 'verify' && 'Ativação de Conta'}
          </h1>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            {mode === 'login' && 'Informe suas credenciais para acessar seu ambiente seguro'}
            {mode === 'register' && 'Cadastre-se na plataforma para gerenciar seus contratos e pagamentos'}
            {mode === 'verify' && `Enviamos um código de segurança de 6 dígitos para o e-mail: ${email || 'seu e-mail'}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Toggle (Login vs Cadastrar) - Apenas se não estiver no modo verify */}
        {mode !== 'verify' && (
          <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-border text-xs font-bold">
            <button 
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2.5 rounded-lg transition-all ${mode === 'login' ? 'bg-brand-lime text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Já tenho conta (Login)
            </button>
            <button 
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2.5 rounded-lg transition-all ${mode === 'register' ? 'bg-brand-lime text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Criar Nova Conta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* SELEÇÃO CLARA DE PERFIL NO CADASTRO */}
          {mode === 'register' && (
            <div className="space-y-3 pt-1">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                Selecione o seu perfil na plataforma:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Inquilino Card */}
                <button
                  type="button"
                  onClick={() => setRole('TENANT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative ${
                    role === 'TENANT' 
                      ? 'bg-brand-lime/10 border-brand-lime shadow-sm' 
                      : 'bg-surface border-border hover:border-brand-lime/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${role === 'TENANT' ? 'bg-brand-lime text-white' : 'bg-surface border border-border text-brand-lime'}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    {role === 'TENANT' && <CheckCircle2 className="w-4 h-4 text-brand-lime" />}
                  </div>
                  <div>
                    <div className="text-xs font-black text-text-primary">Sou Inquilino</div>
                    <div className="text-[10px] text-text-secondary mt-0.5 leading-snug">
                      Consultar contrato, pagar aluguéis com PIX e boletos.
                    </div>
                  </div>
                </button>

                {/* Proprietário Card */}
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative ${
                    role === 'OWNER' 
                      ? 'bg-brand-lime/10 border-brand-lime shadow-sm' 
                      : 'bg-surface border-border hover:border-brand-lime/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${role === 'OWNER' ? 'bg-brand-lime text-white' : 'bg-surface border border-border text-brand-lime'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    {role === 'OWNER' && <CheckCircle2 className="w-4 h-4 text-brand-lime" />}
                  </div>
                  <div>
                    <div className="text-xs font-black text-text-primary">Sou Proprietário</div>
                    <div className="text-[10px] text-text-secondary mt-0.5 leading-snug">
                      Gerenciar imóveis, extratos e acompanhar repasses.
                    </div>
                  </div>
                </button>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase">Seu Nome Completo *</label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime">
                  <User className="w-4 h-4 text-text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Ex: Carlos Alberto Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-xs text-text-primary focus:outline-none font-medium"
                    required={mode === 'register'}
                  />
                </div>
              </div>

              {/* Telefone / WhatsApp */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase">WhatsApp / Celular</label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime">
                  <Phone className="w-4 h-4 text-text-secondary" />
                  <input 
                    type="tel" 
                    placeholder="(15) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent text-xs text-text-primary focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* E-mail e Senha (Login e Registro) */}
          {mode !== 'verify' && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase">E-mail Cadastrado *</label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  <input 
                    type="email" 
                    placeholder="seu.email@provedor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-text-primary focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase">Senha de Acesso *</label>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-brand-lime">
                  <Lock className="w-4 h-4 text-text-secondary" />
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-xs text-text-primary focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* MODO DE VERIFICAÇÃO DE E-MAIL (OTP) */}
          {mode === 'verify' && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-secondary uppercase">E-mail de Ativação</label>
                <div className="flex items-center gap-2 bg-surface/60 border border-border rounded-xl px-3 py-2.5 text-text-secondary text-xs">
                  <Mail className="w-4 h-4 text-brand-lime" />
                  <span className="font-mono font-bold text-text-primary">{email}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-text-primary uppercase tracking-wide block text-center">
                  Digite o Código de 6 Dígitos:
                </label>
                <div className="flex items-center gap-2 bg-surface border-2 border-brand-lime rounded-2xl px-4 py-3 shadow-sm">
                  <KeyRound className="w-5 h-5 text-brand-lime shrink-0" />
                  <input 
                    type="text" 
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent text-2xl tracking-[0.35em] font-black text-brand-lime text-center focus:outline-none"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-lime-50 border border-lime-200 text-center space-y-2">
                  <p className="text-[11px] text-lime-900 leading-snug">
                    Ambiente de demonstração ou SMTP pendente? Use o <strong>código de liberação rápida</strong>:
                  </p>
                  <button
                    type="button"
                    onClick={() => setCode('123456')}
                    className="w-full py-2 rounded-lg bg-white border border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🔑 Inserir Código de Liberação (123456)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendCode}
                  className="font-bold text-brand-lime hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>Reenviar código</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="font-bold text-text-secondary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Login</span>
                </button>
              </div>
            </div>
          )}

          {/* Botão de Envio Principal */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-xs bg-brand-lime text-white hover:bg-brand-lime-hover shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && 'Entrar na Plataforma'}
                {mode === 'register' && 'Cadastrar & Enviar Código no E-mail'}
                {mode === 'verify' && 'Ativar Conta e Entrar'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="text-[11px] text-text-secondary text-center flex items-center justify-center gap-1.5 pt-2 border-t border-border">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente seguro protegido por criptografia de ponta a ponta</span>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 py-20 text-center text-text-secondary">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Carregando formulário...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
