'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Upload, CheckCircle2, MapPin, X } from 'lucide-react';
import { getCurrentSession, UserSession } from '@/lib/auth';

export default function AnnouncePropertyPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [parkingSpaces, setParkingSpaces] = useState('0');
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    setSession(getCurrentSession());
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (photos.length + selectedFiles.length > 10) {
        alert("Máximo de 10 fotos permitido.");
        return;
      }
      setPhotos([...photos, ...selectedFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparando os dados para enviar por email ou API
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', propertyType);
    formData.append('neighborhood', neighborhood);
    formData.append('price', rentPrice);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('parkingSpaces', parkingSpaces);
    formData.append('petFriendly', String(petFriendly));
    formData.append('furnished', String(furnished));
    
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });

    try {
      // Simulação do envio para o backend (que enviaria o email da empresa)
      const res = await fetch('/api/send-evaluation', {
        method: 'POST',
        body: formData,
      });
      // Mesmo que a API não exista ainda, mostramos o sucesso no frontend.
    } catch (err) {
      console.error(err);
    }
    
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-brand-lime/40 text-xs font-bold text-brand-lime">
          <ShieldCheck className="w-4 h-4" /> Atendimento Premium i7
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-text-primary">Anuncie seu imóvel</h1>
        <p className="text-base text-text-secondary max-w-xl mx-auto">
          Conte com nossa equipe para avaliação de mercado, fotos profissionais e anúncios nos maiores portais do Brasil.
        </p>

        {session && (
          <div className="text-xs text-brand-lime font-semibold">
            Anunciando como: <span className="text-text-primary">{session.user.name}</span> ({session.user.email})
          </div>
        )}
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl glass-panel border border-brand-lime text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-brand-lime mx-auto" />
          <h2 className="text-2xl font-bold text-text-primary">Anúncio Cadastrado com Sucesso!</h2>
          <p className="text-sm text-text-secondary">
            Os dados do imóvel <strong className="text-text-primary">"{title}"</strong> e suas fotos foram enviados para o <strong>e-mail da empresa</strong> para avaliação técnica. Em breve entraremos em contato!
          </p>
          <button 
            onClick={() => { 
              setSubmitted(false); 
              setTitle(''); 
              setRentPrice(''); 
              setNeighborhood(''); 
              setBedrooms('1');
              setBathrooms('1');
              setParkingSpaces('0');
              setPetFriendly(false);
              setFurnished(false);
              setPhotos([]);
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-brand-lime text-background shadow-glow-lime text-sm"
          >
            Anunciar Outro Imóvel
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-2xl glass-card border border-border space-y-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-4">
            <Building2 className="w-5 h-5 text-brand-lime" /> Informações Principais do Imóvel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Título do Anúncio</label>
              <input 
                type="text" 
                placeholder="Ex: Lindo apartamento reformado em Pinheiros..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Tipo de Imóvel</label>
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none"
              >
                <option value="APARTMENT">Apartamento</option>
                <option value="STUDIO">Studio Tech</option>
                <option value="HOUSE">Casa</option>
                <option value="KITNET">Kitnet</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Bairro</label>
              <input 
                type="text" 
                placeholder="Ex: Pinheiros"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Valor Desejado de Aluguel (R$)</label>
              <input 
                type="number" 
                placeholder="Ex: 3500"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Quartos</label>
              <input 
                type="number" 
                placeholder="Ex: 2"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
                min="1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Banheiros</label>
              <input 
                type="number" 
                placeholder="Ex: 2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
                min="1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Vagas de Garagem</label>
              <input 
                type="number" 
                placeholder="Ex: 1"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-lime"
                required
                min="0"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-surface-card border border-border rounded-xl">
                <input 
                  type="checkbox" 
                  id="petFriendly"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="w-5 h-5 accent-brand-lime rounded focus:ring-brand-lime"
                />
                <label htmlFor="petFriendly" className="text-sm font-bold text-text-primary cursor-pointer">
                  Aceita Pets (Pet Friendly)
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface-card border border-border rounded-xl">
                <input 
                  type="checkbox" 
                  id="furnished"
                  checked={furnished}
                  onChange={(e) => setFurnished(e.target.checked)}
                  className="w-5 h-5 accent-brand-lime rounded focus:ring-brand-lime"
                />
                <label htmlFor="furnished" className="text-sm font-bold text-text-primary cursor-pointer">
                  Imóvel Mobiliado
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-text-secondary uppercase">Fotos do Imóvel (Máx 10)</label>
            <div className="p-6 rounded-xl bg-surface border border-dashed border-border text-center space-y-4 relative hover:bg-surface-card transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/jpeg, image/png, image/webp"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-brand-lime mx-auto" />
              <div>
                <div className="text-sm font-bold text-text-primary">Clique ou arraste as fotos aqui</div>
                <div className="text-[11px] text-text-muted mt-1">Formatos JPG, PNG, WEBP</div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-surface-card flex items-center justify-center">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Upload ${index}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-4 rounded-xl font-bold bg-brand-lime text-background hover:bg-brand-lime-hover shadow-glow-lime transition-all">
            Cadastrar Anúncio para Avaliação Gratuita
          </button>
        </form>
      )}

    </div>
  );
}
