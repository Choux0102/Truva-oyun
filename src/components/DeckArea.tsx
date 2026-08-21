import React, { useState } from 'react';
import { GameCard } from '../types';
import { CARD_SUITS, TACTICS_DEFINITIONS } from '../constants/cards';
import { CardView } from './CardView';
import {
  Shuffle,
  RotateCcw,
  Plus,
  Layers,
  Trash2,
  ShieldAlert,
  Sparkles,
  BookOpen,
  X,
  Award,
} from 'lucide-react';

interface DeckAreaProps {
  deck: GameCard[];
  tacticsDeck: GameCard[];
  discardPile: GameCard[];
  onDrawCard: (count?: number) => void;
  onDrawTacticsCard: (count?: number) => void;
  onShuffleDeck: () => void;
  onShuffleTacticsDeck: () => void;
  onResetGame: () => void;
  onDropToDiscard: (e?: React.DragEvent) => void;
  onDropToDeck: (e?: React.DragEvent) => void;
  onDropToTacticsDeck: (e?: React.DragEvent) => void;
  onRetrieveFromDiscard?: () => void;
  onFlipCard?: (cardId: string) => void;
}

export const DeckArea: React.FC<DeckAreaProps> = ({
  deck,
  tacticsDeck,
  discardPile,
  onDrawCard,
  onDrawTacticsCard,
  onShuffleDeck,
  onShuffleTacticsDeck,
  onResetGame,
  onDropToDiscard,
  onDropToDeck,
  onDropToTacticsDeck,
  onRetrieveFromDiscard,
  onFlipCard,
}) => {
  const [isDragOverDeck, setIsDragOverDeck] = useState(false);
  const [isDragOverTacticsDeck, setIsDragOverTacticsDeck] = useState(false);
  const [isDragOverDiscard, setIsDragOverDiscard] = useState(false);
  const [showSuitLegend, setShowSuitLegend] = useState(false);
  const [showTacticsGuide, setShowTacticsGuide] = useState(false);
  const [showFormationsGuide, setShowFormationsGuide] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const topDiscardedCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <div className="flex flex-col gap-3 bg-[#0F0F0F] p-3 sm:p-4 rounded-[2px] border border-[#222222] shadow-2xl w-full lg:w-80 shrink-0">
      {/* 2 Decks Grid: Troop Deck & Tactics Deck */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. TROOP DECK (BİRLİK DESTESİ) */}
        <div className="flex flex-col items-center text-center p-2 rounded-[2px] bg-[#121212] border border-[#222]">
          <div className="flex items-center justify-between w-full mb-1.5 pb-1 border-b border-[#222]">
            <span className="text-[9px] font-bold tracking-wider uppercase text-[#AAA] font-mono flex items-center gap-1 truncate">
              <Layers size={11} />
              BİRLİK
            </span>
            <span className="text-[9px] font-mono text-[#888]">
              {deck.length}/60
            </span>
          </div>

          {/* Troop 3D Card Stack */}
          <div
            id="deck-card-stack"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverDeck(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOverDeck(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverDeck(false);
              onDropToDeck(e);
            }}
            onClick={() => {
              if (deck.length > 0) onDrawCard(1);
            }}
            title={deck.length > 0 ? 'Birlik Kartı Çek / Kartı Destenin En Üstüne Bırak' : 'Kartı Destenin En Üstüne Bırak'}
            className={`relative w-18 h-24 sm:w-20 sm:h-28 rounded-[3px] cursor-pointer select-none transition-all duration-200 group flex items-center justify-center my-1 ${
              isDragOverDeck
                ? 'border-2 border-[#00FF41] scale-105'
                : 'hover:-translate-y-1'
            }`}
          >
            {deck.length === 0 ? (
              <div className="w-full h-full rounded-[2px] border border-dashed border-[#333] flex flex-col items-center justify-center text-[#555] text-[9px] p-1 bg-[#121212]">
                <ShieldAlert size={14} className="mb-0.5 opacity-50 text-[#888]" />
                <span className="font-mono uppercase text-[8px]">BİTTİ</span>
              </div>
            ) : (
              <>
                {deck.length > 3 && (
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[2px] bg-[#141414] border border-[#222] pointer-events-none" />
                )}
                {deck.length > 1 && (
                  <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-[2px] bg-[#181818] border border-[#2A2A2A] pointer-events-none" />
                )}
                <div className="absolute inset-0 rounded-[2px] border border-[#333] bg-[#111111] shadow-xl flex flex-col items-center justify-between p-1 overflow-hidden">
                  <div className="w-full flex justify-between items-center text-[6.5px] font-mono text-[#555] tracking-widest uppercase">
                    <span>TROOP</span>
                    <span>{deck.length}</span>
                  </div>
                  <div className="w-5 h-5 rounded-sm border border-[#333] flex items-center justify-center text-[#666] font-mono text-[10px] group-hover:scale-110 transition-transform">
                    ✦
                  </div>
                  <span className="text-[7px] font-mono text-[#777] tracking-wider uppercase">
                    6 RENK
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Troop Draw Button */}
          <button
            type="button"
            id="draw-troop-btn"
            disabled={deck.length === 0}
            onClick={() => onDrawCard(1)}
            className="w-full mt-1.5 py-1.5 px-2 rounded-[2px] bg-[#EDEDED] text-[#0A0A0A] font-bold text-[10px] font-mono tracking-wider uppercase hover:bg-white active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus size={11} />
            <span>BİRLİK ÇEK</span>
          </button>
        </div>

        {/* 2. TACTICS DECK (TAKTIK DESTESİ) */}
        <div className="flex flex-col items-center text-center p-2 rounded-[2px] bg-[#130F1F] border border-purple-900/50">
          <div className="flex items-center justify-between w-full mb-1.5 pb-1 border-b border-purple-900/40">
            <span className="text-[9px] font-bold tracking-wider uppercase text-purple-300 font-mono flex items-center gap-1 truncate">
              <Sparkles size={11} className="text-purple-400" />
              TAKTIK
            </span>
            <span className="text-[9px] font-mono text-purple-300">
              {tacticsDeck.length}/10
            </span>
          </div>

          {/* Tactics 3D Card Stack */}
          <div
            id="tactics-deck-card-stack"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverTacticsDeck(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOverTacticsDeck(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverTacticsDeck(false);
              onDropToTacticsDeck(e);
            }}
            onClick={() => {
              if (tacticsDeck.length > 0) onDrawTacticsCard(1);
            }}
            title={tacticsDeck.length > 0 ? 'Taktik Kartı Çek / Kartı Destenin En Üstüne Bırak' : 'Kartı Destenin En Üstüne Bırak'}
            className={`relative w-18 h-24 sm:w-20 sm:h-28 rounded-[3px] cursor-pointer select-none transition-all duration-200 group flex items-center justify-center my-1 ${
              isDragOverTacticsDeck
                ? 'border-2 border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'hover:-translate-y-1'
            }`}
          >
            {tacticsDeck.length === 0 ? (
              <div className="w-full h-full rounded-[2px] border border-dashed border-purple-900/60 flex flex-col items-center justify-center text-purple-400/60 text-[9px] p-1 bg-[#130F1F]">
                <ShieldAlert size={14} className="mb-0.5 opacity-50 text-purple-400" />
                <span className="font-mono uppercase text-[8px]">BİTTİ</span>
              </div>
            ) : (
              <>
                {tacticsDeck.length > 3 && (
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[2px] bg-[#160E29] border border-purple-900/60 pointer-events-none" />
                )}
                {tacticsDeck.length > 1 && (
                  <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-[2px] bg-[#1B1133] border border-purple-800/50 pointer-events-none" />
                )}
                <div className="absolute inset-0 rounded-[2px] border border-purple-600/50 bg-[#150D2B] shadow-xl flex flex-col items-center justify-between p-1 overflow-hidden">
                  <div className="w-full flex justify-between items-center text-[6.5px] font-mono text-purple-300 tracking-widest uppercase">
                    <span>TACTIC</span>
                    <span>{tacticsDeck.length}</span>
                  </div>
                  <div className="w-5 h-5 rounded-sm border border-purple-500/50 bg-purple-950/60 flex items-center justify-center text-purple-300 font-mono text-xs group-hover:scale-110 transition-transform">
                    ⚔
                  </div>
                  <span className="text-[7px] font-mono text-purple-300/80 tracking-wider uppercase">
                    10 KART
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tactics Draw Button */}
          <button
            type="button"
            id="draw-tactics-btn"
            disabled={tacticsDeck.length === 0}
            onClick={() => onDrawTacticsCard(1)}
            className="w-full mt-1.5 py-1.5 px-2 rounded-[2px] bg-purple-600 text-white font-bold text-[10px] font-mono tracking-wider uppercase hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1 shadow-sm"
          >
            <Sparkles size={11} />
            <span>TAKTIK ÇEK</span>
          </button>
        </div>
      </div>

      {/* Discard Pile (Iskarta) */}
      <div className="border-t border-[#1C1C1C] pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#888] font-mono flex items-center gap-1.5">
            <Trash2 size={12} />
            DISCARD // [{discardPile.length}]
          </span>
          {discardPile.length > 0 && onRetrieveFromDiscard && (
            <button
              type="button"
              id="retrieve-discard-btn"
              onClick={onRetrieveFromDiscard}
              className="text-[10px] font-mono text-[#888] hover:text-[#EDEDED] underline decoration-dotted uppercase"
            >
              Geri Al
            </button>
          )}
        </div>

        <div
          id="discard-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverDiscard(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOverDiscard(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverDiscard(false);
            onDropToDiscard(e);
          }}
          className={`h-22 rounded-[2px] border border-dashed flex items-center justify-center p-1.5 transition-all ${
            isDragOverDiscard
              ? 'bg-[#2A1111] border-rose-500'
              : 'border-[#262626] bg-[#121212]/60 hover:border-[#444]'
          }`}
        >
          {topDiscardedCard ? (
            <div className="flex items-center gap-2.5">
              <CardView
                card={topDiscardedCard}
                size="sm"
                showQuickActions={false}
                onFlip={onFlipCard ? () => onFlipCard(topDiscardedCard.id) : undefined}
              />
              <div className="text-left text-xs font-mono max-w-[130px]">
                <span className="text-[#EDEDED] block font-bold text-[10px] truncate">
                  {topDiscardedCard.title || `${topDiscardedCard.colorName} ${topDiscardedCard.value}`}
                </span>
                <span className="text-[8px] text-[#888] tracking-wider uppercase">
                  {topDiscardedCard.cardType === 'tactics' ? 'TAKTIK KARTI' : 'BİRLİK KARTI'}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[9px] text-[#555] font-mono uppercase tracking-widest text-center">
              KARTLARI BURAYA BIRAKIN
            </span>
          )}
        </div>
      </div>

      {/* Global Deck Actions & Shuffling */}
      <div className="border-t border-[#1C1C1C] pt-2 flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            id="shuffle-troop-deck-btn"
            onClick={onShuffleDeck}
            className="py-1 px-1.5 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] text-[9px] font-mono font-medium transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
          >
            <Shuffle size={10} />
            <span className="truncate">Birlik Karıştır</span>
          </button>

          <button
            type="button"
            id="shuffle-tactics-deck-btn"
            onClick={onShuffleTacticsDeck}
            className="py-1 px-1.5 rounded-[2px] border border-purple-900/60 bg-[#160E25] text-purple-300 hover:text-white hover:border-purple-600 text-[9px] font-mono font-medium transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
          >
            <Shuffle size={10} />
            <span className="truncate">Taktik Karıştır</span>
          </button>
        </div>

        <button
          type="button"
          id="reset-table-btn"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-1.5 px-2.5 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#777] hover:text-rose-400 hover:border-rose-900/60 text-[10px] font-mono font-medium transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <RotateCcw size={12} />
          <span>Tümünü Topla & Sıfırla</span>
        </button>
      </div>

      {/* Accordions: 1. Tactics Reference Guide | 2. Formations Guide | 3. Color Suits Legend */}
      <div className="border-t border-[#1C1C1C] pt-2 flex flex-col gap-1.5">
        {/* Tactics Card Guide Button */}
        <button
          type="button"
          id="toggle-tactics-guide-btn"
          onClick={() => setShowTacticsGuide(true)}
          className="w-full py-1 px-2 rounded-[2px] bg-purple-950/40 border border-purple-900/50 text-purple-300 hover:text-white hover:bg-purple-900/40 text-[9px] font-mono font-bold flex items-center justify-between uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={11} />
            10 TAKTIK KARTI REHBERİ
          </span>
          <span className="text-[10px]">→</span>
        </button>

        {/* Formations Guide Button (Directly under 10 Tactics Guide) */}
        <button
          type="button"
          id="toggle-formations-guide-btn"
          onClick={() => setShowFormationsGuide(true)}
          className="w-full py-1 px-2 rounded-[2px] bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 hover:text-white hover:bg-emerald-900/40 text-[9px] font-mono font-bold flex items-center justify-between uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <Award size={11} className="text-emerald-400" />
            FORMASYON SIRALAMALARI
          </span>
          <span className="text-[10px]">→</span>
        </button>

        {/* 6 Colors Suits Legend Toggle */}
        <button
          type="button"
          id="toggle-suit-legend-btn"
          onClick={() => setShowSuitLegend(!showSuitLegend)}
          className="w-full text-left text-[9px] font-mono text-[#666] hover:text-[#AAA] flex items-center justify-between py-0.5 uppercase tracking-wider"
        >
          <span>BİRLİK RENK GRUPLARI ({CARD_SUITS.length})</span>
          <span>{showSuitLegend ? '▲' : '▼'}</span>
        </button>

        {showSuitLegend && (
          <div className="grid grid-cols-2 gap-1 p-1.5 bg-[#121212] rounded-[2px] border border-[#222]">
            {CARD_SUITS.map((suit) => (
              <div
                key={suit.id}
                className="flex items-center gap-1.5 text-[10px] text-[#AAA] font-mono"
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: suit.accentColor }}
                >
                  {suit.symbol}
                </span>
                <span className="text-[9px] truncate">{suit.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Formations Ranking Guide */}
      {showFormationsGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0e1614] border border-emerald-700/60 rounded-[3px] shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-emerald-800/40 flex items-center justify-between bg-[#13221e]">
              <div className="flex items-center gap-2">
                <Award className="text-emerald-400" size={16} />
                <span className="font-mono font-bold text-xs tracking-widest uppercase text-emerald-200">
                  FORMASYON SIRALAMALARI
                </span>
              </div>
              <button
                type="button"
                id="close-formations-guide-btn"
                onClick={() => setShowFormationsGuide(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content description & rankings */}
            <div className="p-4 overflow-y-auto space-y-3 scrollbar-thin">
              <p className="text-xs font-sans text-emerald-100/90 leading-relaxed pb-1 border-b border-emerald-900/40 font-medium">
                Cephelerde yapılabilecek formasyonları, üstünlük sırasına göre şu şekilde sıralayabiliriz:
              </p>

              <div className="space-y-2.5">
                {/* 1. Elmas */}
                <div className="p-2.5 rounded-[2px] bg-[#142621] border border-emerald-700/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-[#0e1614] font-bold font-mono text-[11px] flex items-center justify-center">
                        1
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-300 tracking-wide">
                        Elmas
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-emerald-950 text-emerald-400 border border-emerald-700/40 uppercase">
                      En Güçlü Formasyon
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-200 pl-7">
                    Aynı renkli ve sıralı üç kart.
                  </p>
                </div>

                {/* 2. Sütun */}
                <div className="p-2.5 rounded-[2px] bg-[#142621] border border-emerald-800/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold font-mono text-[11px] flex items-center justify-center">
                        2
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-300 tracking-wide">
                        Sütun
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-emerald-950/80 text-emerald-400/80 border border-emerald-800/40 uppercase">
                      2. Sıra
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-200 pl-7">
                    Aynı değerli üç kart.
                  </p>
                </div>

                {/* 3. Ters Yay */}
                <div className="p-2.5 rounded-[2px] bg-[#142621] border border-emerald-800/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold font-mono text-[11px] flex items-center justify-center">
                        3
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-300 tracking-wide">
                        Ters Yay
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-emerald-950/80 text-emerald-400/80 border border-emerald-800/40 uppercase">
                      3. Sıra
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-200 pl-7">
                    Aynı renkli üç kart.
                  </p>
                </div>

                {/* 4. Piramit */}
                <div className="p-2.5 rounded-[2px] bg-[#142621] border border-emerald-800/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 font-bold font-mono text-[11px] flex items-center justify-center border border-emerald-700/50">
                        4
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-300 tracking-wide">
                        Piramit
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-emerald-950/80 text-emerald-400/80 border border-emerald-800/40 uppercase">
                      4. Sıra
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-200 pl-7">
                    Sıralı üç kart.
                  </p>
                </div>

                {/* 5. Kaos */}
                <div className="p-2.5 rounded-[2px] bg-[#142621] border border-emerald-850/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1e332c] text-zinc-400 font-bold font-mono text-[11px] flex items-center justify-center border border-emerald-800/30">
                        5
                      </span>
                      <span className="font-mono font-bold text-sm text-zinc-300 tracking-wide">
                        Kaos
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-[#15241f] text-zinc-400 border border-zinc-700/30 uppercase">
                      Temel / Puan Hesabı
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-300 pl-7">
                    Düzensiz formasyon.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-emerald-900/40 bg-[#13221e] flex justify-end">
              <button
                type="button"
                onClick={() => setShowFormationsGuide(false)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-[2px] transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full 10 Tactics Cards Guide */}
      {showTacticsGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#12101B] border border-purple-700/60 rounded-[3px] shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-purple-800/40 flex items-center justify-between bg-[#181326]">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={16} />
                <span className="font-mono font-bold text-xs tracking-widest uppercase text-purple-200">
                  10 TAKTIK KARTI AÇIKLAMALARI
                </span>
              </div>
              <button
                type="button"
                id="close-tactics-guide-btn"
                onClick={() => setShowTacticsGuide(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of 10 Tactics */}
            <div className="p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
              {TACTICS_DEFINITIONS.map((tac, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-[2px] bg-[#171424] border border-purple-900/50 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: tac.accentColor }}
                      >
                        {tac.symbol}
                      </span>
                      <span className="font-mono font-bold text-xs text-purple-200">
                        {tac.title}
                      </span>
                    </div>
                    {tac.value > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] bg-purple-950 text-purple-300 border border-purple-700/40">
                        DEĞER: {tac.value}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-zinc-300 leading-relaxed">
                    {tac.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-purple-900/40 bg-[#181326] flex justify-end">
              <button
                type="button"
                onClick={() => setShowTacticsGuide(false)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold rounded-[2px] transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reset Table */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#141014] border border-rose-800/60 rounded-[3px] shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-rose-900/40 flex items-center justify-between bg-[#201015]">
              <div className="flex items-center gap-2">
                <RotateCcw className="text-rose-400" size={16} />
                <span className="font-mono font-bold text-xs tracking-widest uppercase text-rose-200">
                  MASAYI SIFIRLA
                </span>
              </div>
              <button
                type="button"
                id="close-reset-confirm-btn"
                onClick={() => setShowResetConfirm(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-[2px] bg-rose-950/60 border border-rose-800/50 text-rose-400 shrink-0 mt-0.5">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-rose-200 uppercase tracking-wide">
                    Tüm masayı toplayıp sıfırlamak istediğinize emin misiniz?
                  </h3>
                  <p className="text-[11px] font-sans text-zinc-300 mt-1.5 leading-relaxed">
                    Masadaki tüm 9 cephedeki kartlar, oyuncu elleri, taktik alanları ve ıskarta kartları toplanacak, desteler yeniden karıştırılacaktır.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-rose-900/40 bg-[#1a0e13] flex items-center justify-end gap-2">
              <button
                type="button"
                id="cancel-reset-confirm-btn"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-[#221c22] hover:bg-[#2e262e] text-zinc-300 hover:text-white text-xs font-mono rounded-[2px] border border-zinc-700/50 transition-colors uppercase tracking-wider"
              >
                Vazgeç
              </button>
              <button
                type="button"
                id="confirm-reset-btn"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetGame();
                }}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-mono font-bold rounded-[2px] transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-950/50 uppercase tracking-wider"
              >
                <RotateCcw size={12} />
                <span>Evet, Sıfırla</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

