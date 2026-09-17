import React, { useState, useEffect } from 'react';
import { PokedexDetail, fetchPokedexDetail } from '../../lib/pokedexService';
import { getTypeVisual } from './pokedexConstants';
import { X, Sparkles, Volume2, ChevronLeft, ChevronRight, MapPin, Zap, Shield, Heart, Activity, Award, ArrowRight } from 'lucide-react';

interface PokedexDetailModalProps {
  pokemonId: number;
  status: 'caught' | 'seen' | undefined;
  onClose: () => void;
  onSelectPokemon: (id: number) => void;
}

export const PokedexDetailModal: React.FC<PokedexDetailModalProps> = ({
  pokemonId,
  status,
  onClose,
  onSelectPokemon
}) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PokedexDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'moves' | 'evo'>('info');
  const [isPlayingCry, setIsPlayingCry] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPokedexDetail(pokemonId)
      .then(res => {
        if (isMounted) {
          setDetail(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError('Impossibile caricare i dati dettagliati. Riprova.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemonId]);

  const playCry = () => {
    if (isPlayingCry) return;
    setIsPlayingCry(true);
    try {
      const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`);
      audio.volume = 0.6;
      audio.onended = () => setIsPlayingCry(false);
      audio.onerror = () => setIsPlayingCry(false);
      audio.play().catch(() => setIsPlayingCry(false));
    } catch {
      setIsPlayingCry(false);
    }
  };

  const primaryType = detail?.types[0] || 'normal';
  const typeVisual = getTypeVisual(primaryType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[92vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectPokemon(Math.max(1, pokemonId - 1))}
              disabled={pokemonId <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-sm font-bold text-slate-400">
              #{pokemonId.toString().padStart(3, '0')}
            </span>
            <button
              onClick={() => onSelectPokemon(Math.min(1025, pokemonId + 1))}
              disabled={pokemonId >= 1025}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShiny(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                isShiny
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Shiny</span>
            </button>

            <button
              onClick={playCry}
              disabled={isPlayingCry}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 ${
                isPlayingCry ? 'animate-pulse text-indigo-400' : ''
              }`}
              title="Ascolta Verso"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium animate-pulse">Consultazione dati Pokédex...</p>
          </div>
        ) : error || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <p className="text-red-400 mb-4">{error || 'Errore imprevisto'}</p>
            <button
              onClick={() => fetchPokedexDetail(pokemonId).then(setDetail)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold"
            >
              Riprova
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* Hero Showcase */}
            <div className={`relative p-5 flex flex-col items-center justify-center border-b border-slate-800 ${typeVisual.bg}/10`}>
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {status === 'caught' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Catturato
                  </span>
                ) : status === 'seen' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Visto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Non Incontrato
                  </span>
                )}
              </div>

              {/* Artwork Image */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2 group">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${typeVisual.badge}`} />
                <img
                  src={isShiny ? detail.sprites.shinyArtwork : detail.sprites.artwork}
                  alt={detail.name}
                  className={`w-full h-full object-contain drop-shadow-xl transition-all duration-300 ${
                    status === 'seen' ? 'brightness-50 contrast-125' : ''
                  }`}
                />
              </div>

              {/* Title & Types */}
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                {detail.name}
              </h2>
              <p className="text-xs font-medium text-slate-400 mb-2">
                {detail.genus}
              </p>

              <div className="flex items-center gap-2">
                {detail.types.map(t => {
                  const vis = getTypeVisual(t);
                  return (
                    <span
                      key={t}
                      className={`px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 ${vis.badge}`}
                    >
                      <span>{vis.icon}</span>
                      <span>{vis.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Generale
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'stats'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Statistiche
              </button>
              <button
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'moves'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Mosse ({detail.moves.length})
              </button>
              <button
                onClick={() => setActiveTab('evo')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'evo'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Evoluzioni
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 space-y-4">
              
              {/* TAB: INFO */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Lore Description */}
                  <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-sm text-slate-200 italic leading-relaxed">
                    "{detail.flavorText}"
                  </div>

                  {/* Physical & Growth Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Altezza</span>
                      <span className="text-sm font-extrabold text-white">{detail.heightM} m</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Peso</span>
                      <span className="text-sm font-extrabold text-white">{detail.weightKg} kg</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Generazione</span>
                      <span className="text-sm font-extrabold text-white">{detail.generation}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasso Cattura</span>
                      <span className="text-sm font-extrabold text-emerald-400">{detail.captureRate} / 255</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Felicità Base</span>
                      <span className="text-sm font-extrabold text-pink-400">{detail.baseHappiness}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Crescita EXP</span>
                      <span className="text-xs font-bold text-slate-200 truncate block" title={detail.growthRate}>
                        {detail.growthRate.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Habitat in Game */}
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Habitat nel Gioco</span>
                    </div>
                    {detail.locations.length > 0 ? (
                      <div className="space-y-1.5">
                        {detail.locations.map(loc => (
                          <div
                            key={loc.zoneId}
                            className="flex items-center justify-between text-xs bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800"
                          >
                            <span className="font-bold text-slate-200">{loc.zoneName}</span>
                            <span className="text-slate-400">
                              Lv. {loc.minLevel}-{loc.maxLevel} • Rarità: {loc.rarity}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Questo Pokémon non appare selvatico nelle zone ordinarie. Ottienilo tramite evoluzione o eventi speciali!
                      </p>
                    )}
                  </div>

                  {/* Abilities */}
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Abilità</span>
                    </div>
                    {detail.abilities.map(ab => (
                      <div key={ab.name} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-200">{ab.name}</span>
                          {ab.isHidden && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                              Speciale
                            </span>
                          )}
                        </div>
                        {ab.description && (
                          <p className="text-xs text-slate-400 leading-normal">{ab.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Statistica Base</span>
                      <span className="text-xs font-bold text-slate-400">Valore (Max 255)</span>
                    </div>

                    {/* Stat Bars */}
                    {[
                      { label: 'PS (HP)', value: detail.baseStats.hp, color: 'bg-emerald-500', text: 'text-emerald-400' },
                      { label: 'Attacco', value: detail.baseStats.attack, color: 'bg-rose-500', text: 'text-rose-400' },
                      { label: 'Difesa', value: detail.baseStats.defense, color: 'bg-amber-500', text: 'text-amber-400' },
                      { label: 'Attacco Sp.', value: detail.baseStats.spAtk, color: 'bg-cyan-500', text: 'text-cyan-400' },
                      { label: 'Difesa Sp.', value: detail.baseStats.spDef, color: 'bg-indigo-500', text: 'text-indigo-400' },
                      { label: 'Velocità', value: detail.baseStats.speed, color: 'bg-fuchsia-500', text: 'text-fuchsia-400' },
                    ].map(st => (
                      <div key={st.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-300">{st.label}</span>
                          <span className={`font-mono font-bold ${st.text}`}>{st.value}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${st.color}`}
                            style={{ width: `${Math.min(100, (st.value / 255) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Total BST */}
                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Totale Statistiche Base (BST)</span>
                      <span className="text-base font-black font-mono text-indigo-400">
                        {detail.baseStats.total}
                      </span>
                    </div>
                  </div>

                  {/* Projections Table at Lv 50 & 100 */}
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Stima Statistiche al Livello 50
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Valori calcolati con IV standard (15) e senza modificatori natura.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">PS Max</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {Math.floor(((2 * detail.baseStats.hp + 15) * 50) / 100) + 60}
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Attacco Max</span>
                        <span className="font-bold text-rose-400 font-mono">
                          {Math.floor(((2 * detail.baseStats.attack + 15) * 50) / 100) + 5}
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Velocità Max</span>
                        <span className="font-bold text-fuchsia-400 font-mono">
                          {Math.floor(((2 * detail.baseStats.speed + 15) * 50) / 100) + 5}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MOVES */}
              {activeTab === 'moves' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 px-1 mb-2">
                    Mosse apprese salendo di livello:
                  </div>
                  {detail.moves.length > 0 ? (
                    <div className="space-y-1.5">
                      {detail.moves.map((m, idx) => {
                        const mVisual = getTypeVisual(m.type);
                        return (
                          <div
                            key={`${m.name}-${idx}`}
                            className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-8 py-0.5 rounded bg-slate-900 text-center font-mono font-bold text-indigo-400 text-[11px]">
                                L.{m.level}
                              </span>
                              <div>
                                <span className="font-bold text-slate-200 block">{m.name}</span>
                                <span className="text-[10px] text-slate-400 capitalize">
                                  {m.category === 'physical' ? 'Fisico' : m.category === 'special' ? 'Speciale' : 'Stato'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${mVisual.badge}`}>
                                {mVisual.label}
                              </span>
                              <div className="text-right font-mono text-[11px] min-w-[50px]">
                                <span className="text-slate-200 block">Pwr: {m.power || '-'}</span>
                                <span className="text-slate-400 block text-[9px]">Acc: {m.accuracy || '-'}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      Nessuna mossa registrata nel database rapido.
                    </p>
                  )}
                </div>
              )}

              {/* TAB: EVOLUTIONS */}
              {activeTab === 'evo' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 px-1">
                    Catena evolutiva completa:
                  </div>

                  {detail.evolutionChain.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      {detail.evolutionChain.map((evo, idx) => {
                        const isCurrent = evo.id === detail.id;
                        return (
                          <React.Fragment key={evo.id}>
                            <button
                              onClick={() => onSelectPokemon(evo.id)}
                              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                                isCurrent
                                  ? 'bg-indigo-600/30 border-2 border-indigo-500 ring-2 ring-indigo-500/20'
                                  : 'bg-slate-900/70 border border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                              }`}
                            >
                              <img
                                src={evo.sprite}
                                alt={evo.name}
                                className="w-16 h-16 object-contain"
                              />
                              <span className="text-xs font-bold text-slate-200 mt-1">
                                {evo.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                #{evo.id.toString().padStart(3, '0')}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-indigo-400 mt-1 uppercase">
                                  Attuale
                                </span>
                              )}
                            </button>

                            {idx < detail.evolutionChain.length - 1 && (
                              <div className="flex flex-col items-center text-slate-500">
                                <ArrowRight className="w-5 h-5" />
                                {detail.evolutionChain[idx + 1].minLevel && (
                                  <span className="text-[10px] font-bold text-slate-400">
                                    Lv. {detail.evolutionChain[idx + 1].minLevel}
                                  </span>
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      Questo Pokémon non ha ulteriori evoluzioni note.
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
