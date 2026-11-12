import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentCategory, ResourceType, ItemCondition } from '../types';
import { 
  Laptop, 
  Tv, 
  Volume2, 
  Cable, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Layers,
  Microscope,
  BookOpen,
  Compass,
  Palette,
  ShieldAlert,
  SlidersHorizontal,
  Check
} from './Icons';

interface CatalogViewProps {
  equipments: Equipment[];
  onSelectEquipmentForBooking: (equipId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  equipments,
  onSelectEquipmentForBooking
}) => {
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'tecnologico' | 'pedagogico'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'category'>('name');

  // Technological categories
  const techCategories = [
    { id: 'datashow', label: 'Datashow & Projetores' },
    { id: 'chromebooks', label: 'Chromebooks' },
    { id: 'notebooks', label: 'Notebooks' },
    { id: 'tablets', label: 'Tablets' },
    { id: 'tvs', label: 'Smart TVs' },
    { id: 'lousas_interativas', label: 'Telas & Lousas Interativas' },
    { id: 'audio', label: 'Sistemas de Áudio & Caixas' },
    { id: 'microfones', label: 'Microfones' },
    { id: 'cameras', label: 'Câmeras & Tripés' },
    { id: 'cabos_conectividade', label: 'Cabos & Conectividade' },
    { id: 'acessorios_apoio', label: 'Acessórios & Elétrica' }
  ];

  // Pedagogical categories
  const pedCategories = [
    { id: 'matematica', label: 'Matemática & Robótica' },
    { id: 'ciencias_biologia', label: 'Ciências & Biologia' },
    { id: 'geografia_historia', label: 'Geografia & História' },
    { id: 'lingua_portuguesa', label: 'Língua Portuguesa & Leitura' },
    { id: 'artes_ed_fisica', label: 'Artes & Educação Física' },
    { id: 'inclusao_acessibilidade', label: 'Inclusão & Acessibilidade' }
  ];

  const filteredEquipments = useMemo(() => {
    return equipments
      .filter((item) => {
        // Resource Type Filter
        if (activeTypeTab !== 'all' && item.resourceType !== activeTypeTab) return false;

        // Category Filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Condition Filter
        if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;

        // Only Available
        if (onlyAvailable && item.status !== 'available') return false;

        // Search Query
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.patrimonyNumber.toLowerCase().includes(q) ||
          item.specs.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'quantity') return b.availableQuantity - a.availableQuantity;
        if (sortBy === 'category') return a.categoryLabel.localeCompare(b.categoryLabel);
        return 0;
      });
  }, [equipments, activeTypeTab, selectedCategory, selectedCondition, onlyAvailable, searchQuery, sortBy]);

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'datashow':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'chromebooks':
      case 'notebooks':
      case 'computadores':
      case 'tablets':
        return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'tvs':
      case 'lousas_interativas':
        return <Tv className="w-5 h-5 text-teal-600" />;
      case 'audio':
      case 'microfones':
        return <Volume2 className="w-5 h-5 text-purple-600" />;
      case 'ciencias_biologia':
        return <Microscope className="w-5 h-5 text-emerald-600" />;
      case 'matematica':
        return <Compass className="w-5 h-5 text-amber-600" />;
      case 'geografia_historia':
        return <Layers className="w-5 h-5 text-cyan-600" />;
      case 'lingua_portuguesa':
        return <BookOpen className="w-5 h-5 text-rose-600" />;
      case 'artes_ed_fisica':
        return <Palette className="w-5 h-5 text-pink-600" />;
      default:
        return <Cable className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP DUAL TAB: TECNOLÓGICOS VS PEDAGÓGICOS */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Catálogo Geral de Recursos Escolares
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulte equipamentos tecnológicos e materiais didáticos por patrimônio, estoque e estado de conservação.
            </p>
          </div>

          {/* Type Toggle Pills */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => {
                setActiveTypeTab('all');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTypeTab === 'all'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({equipments.length})
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('tecnologico');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTypeTab === 'tecnologico'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Tecnológicos ({equipments.filter((e) => e.resourceType === 'tecnologico').length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('pedagogico');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTypeTab === 'pedagogico'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pedagógicos ({equipments.filter((e) => e.resourceType === 'pedagogico').length})</span>
            </button>
          </div>
        </div>

        {/* Search & Dynamic Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, patrimônio (ex: PAT-2024), sala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="all">Estado: Todos</option>
              <option value="Novo">Novo</option>
              <option value="Excelente">Excelente</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="name">Ordenar: Nome (A-Z)</option>
              <option value="quantity">Ordenar: Maior Estoque</option>
              <option value="category">Ordenar: Categoria</option>
            </select>
          </div>
        </div>

        {/* Category Pill Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Categorias
          </button>

          {(activeTypeTab === 'tecnologico' || activeTypeTab === 'all') &&
            techCategories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count = equipments.filter((e) => e.category === c.id).length;
              if (count === 0) return null;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-blue-50/70 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

          {(activeTypeTab === 'pedagogico' || activeTypeTab === 'all') &&
            pedCategories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count = equipments.filter((e) => e.category === c.id).length;
              if (count === 0) return null;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 2. GRID DE CARDS COM PATRIMÔNIO, ESTOQUE, ESTADO E AÇÕES */}
      {filteredEquipments.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <p className="text-base font-bold text-slate-800">Nenhum recurso encontrado</p>
          <p className="text-xs text-slate-500">Tente limpar os filtros ou buscar por outro termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipments.map((item) => {
            const isTech = item.resourceType === 'tecnologico';
            const isAvailable = item.status === 'available' && item.availableQuantity > 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6 space-y-3.5">
                  {/* Header badges: Category, Conservation, Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      isTech ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {item.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.condition}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'maintenance'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable ? 'bg-emerald-500' : item.status === 'maintenance' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {isAvailable ? 'Disponível' : item.status === 'maintenance' ? 'Manutenção' : 'Em Uso'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Patrimony Number */}
                  <div className="flex items-start gap-3 pt-0.5">
                    <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-50 transition-colors shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                          {item.patrimonyNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.tag}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Specs */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100 line-clamp-3">
                    {item.specs}
                  </p>

                  {/* Stock Counter Indicator */}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Estoque Institucional:</span>
                    <span className="font-bold text-slate-800">
                      <strong className="text-blue-600 text-sm">{item.availableQuantity}</strong> de {item.totalQuantity} unidade(s)
                    </span>
                  </div>

                  {/* Location & Instructions */}
                  <div className="text-[11px] text-slate-500 space-y-1 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Almoxarifado: <strong className="text-slate-700">{item.location}</strong></span>
                    </div>
                    {item.instructions && (
                      <p className="text-[10px] text-amber-800 italic bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/60">
                        {item.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isAvailable ? 'Liberado para reserva' : 'Consulte datas futuras'}
                  </span>
                  <button
                    onClick={() => onSelectEquipmentForBooking(item.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                  >
                    Agendar Recurso
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
