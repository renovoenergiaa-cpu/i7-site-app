'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Constrói o mailto link
    const mailtoLink = `mailto:contato@i7.com.br?subject=${encodeURIComponent(`Contato via site: ${formData.subject}`)}&body=${encodeURIComponent(`Nome: ${formData.name}\nE-mail: ${formData.email}\n\nMensagem:\n${formData.message}`)}`;
    
    // Tenta abrir numa nova aba/janela para forçar o navegador a lidar com o mailto
    window.open(mailtoLink, '_self');
    
    // Mostra a mensagem de feedback na tela
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Section */}
      <div className="bg-brand-lime py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Fale Conosco
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
            Estamos aqui para ajudar você a encontrar o imóvel ideal ou tirar qualquer dúvida. Mande uma mensagem e responderemos o mais rápido possível!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Information */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-2">Entre em contato</h2>
              <p className="text-text-secondary text-lg">
                Seja para agendar uma visita, propor uma parceria ou tirar dúvidas sobre nossos serviços, nossa equipe está sempre à disposição.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-border shrink-0 text-brand-lime">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">E-mail Direto</h3>
                  <a href="mailto:contato@i7.com.br" className="text-lg font-black text-text-primary hover:text-brand-lime transition-colors">
                    contato@i7.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-border shrink-0 text-brand-lime">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Horário de Atendimento</h3>
                  <div className="text-lg font-bold text-text-primary">
                    Segunda a Sexta<br/>
                    <span className="text-text-secondary font-medium">09:00 às 18:00</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-border shrink-0 text-brand-lime">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Sede Administrativa</h3>
                  <div className="text-lg font-bold text-text-primary">
                    São Paulo, SP<br/>
                    <span className="text-text-secondary font-medium text-base">Atendimento prioritariamente digital</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-brand-lime/5 border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <h3 className="text-2xl font-bold text-text-primary mb-8 relative z-10">Envie sua mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-text-secondary">Nome Completo</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime/30 transition-all"
                  placeholder="Como gostaria de ser chamado?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-text-secondary">E-mail</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime/30 transition-all"
                  placeholder="seu@email.com.br"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-text-secondary">Assunto</label>
                <input 
                  type="text" 
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime/30 transition-all"
                  placeholder="Ex: Dúvida sobre imóvel, Parceria..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-text-secondary">Mensagem</label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime/30 transition-all resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-4 rounded-xl font-bold bg-brand-lime text-white shadow-lg shadow-brand-lime/30 hover:bg-brand-lime-hover transition-colors flex justify-center items-center gap-2 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                Abrir meu E-mail para Enviar
              </button>
            </form>

            {submitted && (() => {
              const subjectText = encodeURIComponent(`Contato via site: ${formData.subject}`);
              const bodyText = encodeURIComponent(`Nome: ${formData.name}\nE-mail: ${formData.email}\n\nMensagem:\n${formData.message}`);
              const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=contato@i7.com.br&su=${subjectText}&body=${bodyText}`;
              const outlookLink = `https://outlook.live.com/mail/0/deeplink/compose?to=contato@i7.com.br&subject=${subjectText}&body=${bodyText}`;

              return (
                <div className="mt-6 p-5 rounded-xl bg-surface border border-border shadow-sm text-center relative z-10">
                  <p className="text-sm font-bold text-text-primary mb-2">Seu aplicativo não abriu?</p>
                  <p className="text-xs text-text-secondary mb-4">
                    Isso acontece quando o computador não tem um aplicativo de e-mail padrão. 
                    Mas não se preocupe, você pode abrir e enviar direto pelo seu navegador:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                    <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-white text-text-primary text-xs font-bold rounded-xl border border-border shadow-sm hover:bg-surface-hover transition-colors flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-red-500" /> Abrir no Gmail
                    </a>
                    <a href={outlookLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-[#0078D4] text-white text-xs font-bold rounded-xl shadow hover:bg-[#005fb8] transition-colors flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-white" /> Abrir no Outlook
                    </a>
                  </div>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-text-muted hover:text-brand-lime transition-colors"
                  >
                    Voltar para o formulário
                  </button>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}
