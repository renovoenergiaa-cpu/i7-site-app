'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Filter, Home, CheckCircle2, AlertCircle, Wrench, X } from 'lucide-react';
import { BuildingUnit, INITIAL_UNITS, getStoredData, saveStoredData } from '@/lib/gestaoData';

export default function UnidadesPage() {
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new unit
  const [newBuilding, setNewBuilding] = useState('Edifício Paulista Corporate');
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newType, setNewType] = useState<'SALA' | 'APARTAMENTO' | 'STUDIO' | 'LOJA'>('SALA');
  const [newFloor, setNewFloor] = useState('');
  const [newArea, setNewArea] = useState(60);
  const [newRent, setNewRent] = useState(4000);
  const [newCondo, setNewCondo] = useState(800);
  const [newIptu, setNewIptu] = useState(250);
  const [newOwnerName, setNewOwnerName] = useState('Eduardo Silveira Ramos');
  const [newOwnerEmail, setNewOwnerEmail] = useState('eduardo.silveira@email.com');

  useEffect(() => {
    setUnits(getStoredData('units', INITIAL_UNITS));
  }, []);

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitNumber) return;

    const newUnit: BuildingUnit = {
      id: `u-${Date.now()}`,
      buildingName: newBuilding,
      unitNumber: newUnitNumber,
      type: newType,
      floor: newFloor || '1º Andar',
      areaSqm: Number(newArea),
      rentValue: Number(newRent),
      condoValue: Number(newCondo),
      iptuValue: Number(newIptu),
      status: 'DISPONIVEL',
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail
    };

    const updated = [newUnit, ...units];
    setUnits(updated);
    saveStoredData('units', updated);
    setIsModalOpen(false);
    setNewUnitNumber('');
  };

  const filteredUnits = units.filter(u => {
    const matchesSearch = 
      u.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-white border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-lime" />
            <h1 className="text-2xl font-black text-text-primary">Prédios & Unidades</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Gestão cadastral de edifícios comerciais e residenciais, salas, apartamentos e status de ocupação.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Cadastrar Nova Unidade
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por prédio, sala, inquilino ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-lime"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-brand-lime"
          >
            <option value="ALL">Todos os Status</option>
            <option value="LOCADO">Locados</option>
            <option value="DISPONIVEL">Disponíveis / Vagos</option>
            <option value="REFORMA">Em Reforma / Manutenção</option>
          </select>
        </div>
      </div>

      {/* Grid of Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <div key={unit.id} className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4 hover:border-brand-lime/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                  {unit.type} • {unit.floor}
                </span>
                <h3 className="font-extrabold text-base text-text-primary mt-0.5">{unit.unitNumber}</h3>
                <p className="text-xs text-text-secondary">{unit.buildingName}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                unit.status === 'LOCADO' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : unit.status === 'DISPONIVEL'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {unit.status}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Área Útil:</span>
                <span className="font-bold text-text-primary">{unit.areaSqm} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Aluguel Base:</span>
                <span className="font-bold text-text-primary">R$ {unit.rentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Condomínio + IPTU:</span>
                <span className="font-bold text-text-primary">R$ {(unit.condoValue + unit.iptuValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between font-black">
                <span className="text-text-primary">Pacote Total:</span>
                <span className="text-brand-lime">
                  R$ {(unit.rentValue + unit.condoValue + unit.iptuValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1 pt-1">
              <div>
                <span className="text-text-secondary">Proprietário: </span>
                <span className="font-bold text-text-primary">{unit.ownerName}</span>
              </div>
              {unit.tenantName ? (
                <div>
                  <span className="text-text-secondary">Inquilino: </span>
                  <span className="font-bold text-text-primary">{unit.tenantName}</span>
                </div>
              ) : (
                <div className="text-text-secondary italic">Sem inquilino no momento</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Unidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary">Cadastrar Nova Unidade / Sala</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Prédio / Condomínio</label>
                <select
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                >
                  <option value="Edifício Paulista Corporate">Edifício Paulista Corporate</option>
                  <option value="Residencial Faria Lima Prime">Residencial Faria Lima Prime</option>
                  <option value="Edifício Pinheiros Hub">Edifício Pinheiros Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Identificação / Sala / Apto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 304, Apto 51"
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Tipo de Unidade</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary focus:outline-none focus:border-brand-lime"
                  >
                    <option value="SALA">Sala Comercial</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="STUDIO">Studio / Kitnet</option>
                    <option value="LOJA">Loja Comercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Andar</label>
                  <input
                    type="text"
                    placeholder="Ex: 3º Andar"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Área Útil (m²)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Aluguel (R$)</label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Condomínio (R$)</label>
                  <input
                    type="number"
                    value={newCondo}
                    onChange={(e) => setNewCondo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">IPTU (R$)</label>
                  <input
                    type="number"
                    value={newIptu}
                    onChange={(e) => setNewIptu(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Proprietário Responsável</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary text-xs font-bold hover:bg-surface-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-lime text-white text-xs font-black hover:bg-brand-lime-hover shadow-md"
                >
                  Salvar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
