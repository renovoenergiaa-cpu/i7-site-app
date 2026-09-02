'use client';

import React, { useState } from 'react';
import { Home, User, CheckCircle2, DollarSign } from 'lucide-react';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

export default function SellPropertyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [address, setAddress] = useState('');
  
  // Property details
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('2');
  const [area, setArea] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');

  // Owner details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would normally submit to the API (e.g., creating a lead/property draft)
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-text-primary">Venda com a i7 Proptech</h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto">
          Preencha os dados abaixo. Nossa equipe fará uma avaliação gratuita do seu imóvel e o conectará com milhares de compradores interessados.
        </p>
      </div>

      {submitted ? (
        <div className="p-10 rounded-2xl bg-white border border-border shadow-lg text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-brand-lime mx-auto" />
          <h2 className="text-3xl font-bold text-text-primary">Imóvel Recebido!</h2>
          <p className="text-text-secondary">
            Obrigado, <strong className="text-text-primary">{ownerName}</strong>! Recebemos os dados do imóvel em <strong className="text-text-primary">{address}</strong>. Um de nossos especialistas entrará em contato em breve no número {ownerPhone}.
          </p>
          <button 
            onClick={() => { setSubmitted(false); setAddress(''); setArea(''); setDesiredPrice(''); }}
            className="px-8 py-3 rounded-xl font-bold bg-brand-lime text-white shadow-lg transition-all"
          >
            Cadastrar outro imóvel
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-2xl bg-white border border-border shadow-xl space-y-8">
          
          {/* Section: Owner */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
              <User className="w-5 h-5 text-brand-lime" /> Seus Dados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Nome Completo</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">WhatsApp</label>
                <input 
                  type="tel" 
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Property */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
              <Home className="w-5 h-5 text-brand-lime" /> Sobre o Imóvel
            </h3>
            
            <div className="space-y-1.5 z-50 relative">
              <AddressAutocomplete 
                label="Endereço do Imóvel"
                placeholder="Ex: Avenida Paulista, São Paulo..."
                value={address}
                onChange={setAddress}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Tipo</label>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                >
                  <option value="APARTMENT">Apartamento</option>
                  <option value="HOUSE">Casa</option>
                  <option value="COMMERCIAL">Comercial</option>
                  <option value="LAND">Terreno</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Quartos</label>
                <select 
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                >
                  <option value="1">1 Quarto</option>
                  <option value="2">2 Quartos</option>
                  <option value="3">3 Quartos</option>
                  <option value="4+">4 ou mais</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Área Útil (m²)</label>
                <input 
                  type="number" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Valor de Venda (R$)
                </label>
                <input 
                  type="number" 
                  value={desiredPrice}
                  onChange={(e) => setDesiredPrice(e.target.value)}
                  placeholder="Ex: 850000"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-lime/20"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 rounded-xl font-bold bg-brand-lime text-white hover:bg-brand-lime-hover shadow-lg shadow-brand-lime/30 text-lg transition-all">
              Enviar para Avaliação Gratuita
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              Seus dados estão seguros. Ao enviar, você concorda com nossos Termos de Privacidade.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
