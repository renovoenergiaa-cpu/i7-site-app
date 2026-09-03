'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  Building2, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [copiedEmail, setCopiedEmail] = useState(false);

  // Número oficial de WhatsApp da i7 (DDD + Telefone)
  // Formato internacional: 55 + DDD + Número
  const WHATSAPP_NUMBER = '551130904000';
  const OFFICIAL_EMAIL = 'contato@i7imob.com.br';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Enviar Diretamente pelo WhatsApp (Abre com todo o texto estruturado)
  const handleSendViaWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert('Por favor, preencha pelo menos seu nome e a mensagem.');
      return;
    }

    // Salva na API em background para registro e auditoria
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).catch(() => {});

    const text = 
      `*Olá, Equipe i7 Inteligência Imobiliária!*\n\n` +
      `Me chamo *${formData.name}* e gostaria de falar com vocês através do site.\n\n` +
      `📌 *Assunto:* ${formData.subject || 'Atendimento Geral'}\n` +
      `📧 *E-mail para resposta:* ${formData.email || 'Não informado'}\n` +
      `📱 *Telefone/WhatsApp:* ${formData.phone || 'Não informado'}\n\n` +
      `📝 *Mensagem:*\n${formData.message}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface">
      
      {/* Header Section */}
      <div className="bg-brand-lime py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <MessageSquare className="w-3.5 h-3.5" /> Atendimento i7
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Fale com a Nossa Equipe
          </h1>
          <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Atendimento humanizado e ágil diretamente no WhatsApp ou por chamado oficial.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Contact Information Cards */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-text-primary mb-2">Canais de Atendimento</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Escolha o canal de sua preferência para iniciar o contato diretamente com nossos consultores:
              </p>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Direto */}
              <a 
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20im%C3%B3veis%20da%20i7.`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm hover:border-emerald-500 transition-all group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">WhatsApp</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Online
                    </span>
                  </div>
                  <div className="text-base font-black text-text-primary group-hover:text-emerald-600 transition-colors">
                    (11) 3090-4000
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Clique para abrir e falar agora</p>
                </div>
              </a>

              {/* E-mail Corporativo */}
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm">
                <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">E-mail de Atendimento</h3>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="text-[11px] font-bold text-brand-lime hover:underline inline-flex items-center gap-1"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-base font-black text-text-primary">
                    {OFFICIAL_EMAIL}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Retorno em até 2 horas úteis</p>
                </div>
              </div>

              {/* Horário de Atendimento */}
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Horário de Funcionamento</h3>
                  <div className="text-sm font-bold text-text-primary">
                    Segunda a Sexta: 09:00 às 18:00
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Plantão via Portal do Cliente 24/7</p>
                </div>
              </div>

              {/* Endereço Físico */}
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Sede Corporativa</h3>
                  <div className="text-sm font-bold text-text-primary">
                    R. Cel. Nogueira Padilha, 374
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Vila Hortência, Sorocaba - SP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-black/5 border border-border relative">
            <div className="mb-6">
              <h3 className="text-xl font-black text-text-primary">Envie sua Mensagem</h3>
              <p className="text-xs text-text-secondary mt-1">
                Preencha os campos abaixo e envie diretamente para o nosso <strong>WhatsApp</strong>:
              </p>
            </div>

                <form onSubmit={handleSendViaWhatsApp} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-text-secondary mb-1">
                      Seu Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime transition-all font-medium"
                      placeholder="Ex: Carlos Alberto Silva"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-text-secondary mb-1">
                        Seu E-mail *
                      </label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime transition-all font-medium"
                        placeholder="seu.email@provedor.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-text-secondary mb-1">
                        Seu Telefone / WhatsApp
                      </label>
                      <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime transition-all font-medium"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold text-text-secondary mb-1">
                      Assunto da Mensagem *
                    </label>
                    <input 
                      type="text" 
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime transition-all font-medium"
                      placeholder="Ex: Tenho interesse no imóvel no Parque Campolim"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-text-secondary mb-1">
                      Mensagem Detalhada *
                    </label>
                    <textarea 
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime transition-all resize-none font-medium"
                      placeholder="Escreva sua dúvida, proposta ou agendamento de visita..."
                    />
                  </div>

                  {/* Ação de Envio */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-4 rounded-xl font-black text-xs bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" /> 
                      <span>Enviar Mensagem pelo WhatsApp</span>
                    </button>
                  </div>
                </form>
          </div>

        </div>
      </div>

    </div>
  );
}
