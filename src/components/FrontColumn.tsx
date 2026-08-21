import React, { useState } from 'react';
import { GameCard } from '../types';
import { CardView } from './CardView';
import { CloudFog, Waves, Sparkles } from 'lucide-react';

interface FrontColumnProps {
  index: number;
  topCards: GameCard[];
  bottomCards: GameCard[];
  environmentCards?: GameCard[];
  claimedBy?: 'top' | 'bottom' | null;
  selectedCardId: string | null;
  onDropCard: (
    target: { type: 'front_top' | 'front_bottom' | 'front_env'; frontIndex: number },
    e?: React.DragEvent
  ) => void;
  onSelectCard: (card: GameCard) => void;
  onFlipCard: (cardId: string) => void;
  onReturnCardToHand: (cardId: string, handTarget?: 1 | 2) => void;
  onDiscardCard: (cardId: string) => void;
  onToggleClaim?: (frontIndex: number) => void;
  onClaim?: (frontIndex: number, player: 'top' | 'bottom') => void;
  onDragStartCard: (
    card: GameCard,
    source: { type: 'front_top' | 'front_bottom' | 'front_env'; frontIndex: number },
    e?: React.DragEvent
  ) => void;
  onDragEndCard?: () => void;
}

export const FrontColumn: React.FC<FrontColumnProps> = ({
  index,
  topCards,
  bottomCards,
  environmentCards = [],
  claimedBy,
  selectedCardId,
  onDropCard,
  onSelectCard,
  onFlipCard,
  onReturnCardToHand,
  onDiscardCard,
  onToggleClaim,
  onClaim,
  onDragStartCard,
  onDragEndCard,
}) => {
  const [isDragOverTop, setIsDragOverTop] = useState(false);
  const [isDragOverBottom, setIsDragOverBottom] = useState(false);
  const [isDragOverEnv, setIsDragOverEnv] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Check for Sis and Bataklık tactics on this front
  const allCardsOnFront = [...topCards, ...bottomCards, ...environmentCards];

  const isSisCard = (c: GameCard) =>
    (c.title && c.title.toLowerCase().includes('sis')) ||
    c.id.toLowerCase().includes('sis');

  const isBataklikCard = (c: GameCard) =>
    (c.title && (c.title.toLowerCase().includes('batakl') || c.title.toLowerCase().includes('çamur'))) ||
    c.id.toLowerCase().includes('bataklik');

  const hasSis = allCardsOnFront.some(isSisCard);
  const hasBataklik = allCardsOnFront.some(isBataklikCard);

  const handleDragOver = (e: React.DragEvent, zone: 'top' | 'bottom' | 'env') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (zone === 'top' && !isDragOverTop) setIsDragOverTop(true);
    if (zone === 'bottom' && !isDragOverBottom) setIsDragOverBottom(true);
    if (zone === 'env' && !isDragOverEnv) setIsDragOverEnv(true);
  };

  const handleDragLeave = (e: React.DragEvent, zone: 'top' | 'bottom' | 'env') => {
    e.preventDefault();
    if (zone === 'top') setIsDragOverTop(false);
    if (zone === 'bottom') setIsDragOverBottom(false);
    if (zone === 'env') setIsDragOverEnv(false);
  };

  const handleDrop = (e: React.DragEvent, zone: 'top' | 'bottom' | 'env') => {
    e.preventDefault();
    setIsDragOverTop(false);
    setIsDragOverBottom(false);
    setIsDragOverEnv(false);
    
    let targetType: 'front_top' | 'front_bottom' | 'front_env' = 'front_top';
    if (zone === 'bottom') targetType = 'front_bottom';
    if (zone === 'env') targetType = 'front_env';

    onDropCard(
      {
        type: targetType,
        frontIndex: index,
      },
      e
    );
  };

  const handleClickArea = (zone: 'top' | 'bottom' | 'env') => {
    if (selectedCardId) {
      let targetType: 'front_top' | 'front_bottom' | 'front_env' = 'front_top';
      if (zone === 'bottom') targetType = 'front_bottom';
      if (zone === 'env') targetType = 'front_env';

      onDropCard({
        type: targetType,
        frontIndex: index,
      });
    }
  };

  // Determine atmospheric column border and background styling
  let containerAtmosphereClasses = 'bg-[#0F0F0F] border-[#222222]';
  if (hasSis && hasBataklik) {
    containerAtmosphereClasses =
      'bg-[#12161A] border-2 border-slate-300 ring-2 ring-emerald-500/60 shadow-[0_0_22px_rgba(148,163,184,0.45)]';
  } else if (hasSis) {
    containerAtmosphereClasses =
      'bg-[#11141B] border-2 border-slate-400/90 shadow-[0_0_20px_rgba(148,163,184,0.4)] ring-1 ring-slate-300/50';
  } else if (hasBataklik) {
    containerAtmosphereClasses =
      'bg-[#0E1712] border-2 border-emerald-500/90 shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/50';
  }

  return (
    <div
      id={`front-column-${index}`}
      className={`flex flex-col flex-1 min-w-[114px] sm:min-w-[130px] max-w-[168px] rounded-[3px] p-1 sm:p-1.5 transition-all duration-200 relative ${containerAtmosphereClasses}`}
    >
      {/* Dynamic Active Effect Badges for SIS / BATAKLIK */}
      {(hasSis || hasBataklik) && (
        <div className="w-full flex flex-col gap-1 mb-1.5">
          {hasSis && (
            <div
              title="Sis Etkisi: Bu cephede formasyonlar geçersizdir. Yalnızca en yüksek kart toplamı kazanır."
              className="w-full py-0.5 px-1 rounded-[2px] bg-slate-800/95 border border-slate-400 text-slate-100 flex items-center justify-center gap-1 text-[8px] sm:text-[8.5px] font-mono font-bold tracking-tight shadow-[0_0_10px_rgba(148,163,184,0.5)] select-none animate-pulse"
            >
              <CloudFog size={12} className="text-slate-300 shrink-0" />
              <span>🌫️ SİS: FORMASYON İPTAL</span>
            </div>
          )}
          {hasBataklik && (
            <div
              title="Bataklık Etkisi: Bu cepheyi tamamlamak için her oyuncunun 4 kart koyması gerekir."
              className="w-full py-0.5 px-1 rounded-[2px] bg-emerald-950/95 border border-emerald-400 text-emerald-200 flex items-center justify-center gap-1 text-[8px] sm:text-[8.5px] font-mono font-bold tracking-tight shadow-[0_0_10px_rgba(16,185,129,0.5)] select-none animate-pulse"
            >
              <Waves size={12} className="text-emerald-300 shrink-0" />
              <span>〰️ BATAKLIK: 4 KART</span>
            </div>
          )}
        </div>
      )}

      {/* Top Zone (Side A) */}
      <div
        id={`front-${index}-top-zone`}
        onDragOver={(e) => handleDragOver(e, 'top')}
        onDragLeave={(e) => handleDragLeave(e, 'top')}
        onDrop={(e) => handleDrop(e, 'top')}
        onClick={() => handleClickArea('top')}
        className={`relative flex flex-col items-center min-h-[125px] sm:min-h-[145px] rounded-[2px] p-1.5 transition-all duration-150 ${
          isDragOverTop
            ? 'bg-[#1C1C1C] border border-[#00FF41]'
            : 'bg-[#141414]/50 border border-dashed border-[#262626] hover:border-[#444]'
        } ${selectedCardId ? 'cursor-pointer hover:border-[#666]' : ''}`}
      >
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-[#555] mb-1 select-none px-0.5">
          <span>TOP</span>
          <span>{topCards.length > 0 ? `[${topCards.length}${hasBataklik ? '/4' : '/3'}]` : ''}</span>
        </div>

        {topCards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#333] pointer-events-none">
            <div className="w-10 h-16 sm:w-14 sm:h-20 rounded-[2px] border border-dashed border-[#222] flex items-center justify-center text-[10px] font-mono">
              +
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center -space-y-[88px] sm:-space-y-[90px] w-full py-1 pb-3">
            {topCards.map((card, cardIdx) => {
              const isHovered = hoveredCardId === card.id;
              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{ zIndex: isHovered ? 999 : selectedCardId === card.id ? 100 : cardIdx + 1 }}
                  className="transition-all duration-150 ease-out hover:-translate-y-4 hover:scale-110 relative drop-shadow-2xl"
                >
                  <CardView
                    card={card}
                    size="sm"
                    isSelected={selectedCardId === card.id}
                    onSelect={() => onSelectCard(card)}
                    onFlip={() => onFlipCard(card.id)}
                    onReturnToHand={() => onReturnCardToHand(card.id, 2)}
                    onDiscard={() => onDiscardCard(card.id)}
                    onDragStart={(evt) =>
                      onDragStartCard(card, { type: 'front_top', frontIndex: index }, evt)
                    }
                    onDragEnd={onDragEndCard}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Center Environment / Tactics Slot (Çevre ve Taktik Yuvası - Sis, Bataklık vs.) */}
      <div
        id={`front-${index}-env-slot`}
        onDragOver={(e) => handleDragOver(e, 'env')}
        onDragLeave={(e) => handleDragLeave(e, 'env')}
        onDrop={(e) => handleDrop(e, 'env')}
        onClick={() => handleClickArea('env')}
        className={`my-1 py-1 px-1 rounded-[2px] border transition-all duration-150 flex flex-col items-center justify-center ${
          isDragOverEnv
            ? 'bg-purple-950/60 border-purple-400 ring-1 ring-purple-400'
            : environmentCards.length > 0
            ? 'bg-[#150F22] border-purple-800/60'
            : 'bg-[#0E0E0E] border-dashed border-[#2A2A2A] hover:border-purple-600/50'
        } ${selectedCardId ? 'cursor-pointer hover:bg-purple-950/20' : ''}`}
      >
        {environmentCards.length === 0 ? (
          <div className="w-full flex items-center justify-center gap-1 text-[7.5px] sm:text-[8px] font-mono text-[#777] select-none py-0.5">
            <Sparkles size={10} className="text-purple-400/70" />
            <span>SİS / BATAKLIK YUVASI</span>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-1 py-0.5">
            <div className="text-[7.5px] font-mono text-purple-300 font-bold tracking-wider flex items-center gap-1">
              <Sparkles size={9} />
              <span>ÇEVRE KARTLARI [{environmentCards.length}]</span>
            </div>
            <div className="flex items-center justify-center gap-1 overflow-x-auto w-full py-1">
              {environmentCards.map((card) => {
                const isHovered = hoveredCardId === card.id;
                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredCardId(card.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{ zIndex: isHovered ? 999 : selectedCardId === card.id ? 100 : 10 }}
                    className="transition-all duration-150 hover:scale-110 hover:-translate-y-2 relative shrink-0"
                  >
                    <CardView
                      card={card}
                      size="sm"
                      isSelected={selectedCardId === card.id}
                      onSelect={() => onSelectCard(card)}
                      onFlip={() => onFlipCard(card.id)}
                      onReturnToHand={() => onReturnCardToHand(card.id)}
                      onDiscard={() => onDiscardCard(card.id)}
                      onDragStart={(evt) =>
                        onDragStartCard(card, { type: 'front_env', frontIndex: index }, evt)
                      }
                      onDragEnd={onDragEndCard}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Front Center Claim Divider & Marker */}
      <div
        className={`my-1 py-1 px-1 flex items-center justify-between gap-1 border-y rounded-[2px] transition-colors ${
          claimedBy === 'bottom'
            ? 'border-red-500/50 bg-[#2A0D0D]'
            : claimedBy === 'top'
            ? 'border-[#00FF41]/40 bg-[#0D1A10]'
            : 'border-[#222222] bg-[#0A0A0A]'
        }`}
      >
        {/* P1 Button (Left: Bottom Player) */}
        <button
          type="button"
          id={`claim-p1-front-${index}`}
          onClick={() => {
            if (onClaim) {
              onClaim(index, 'bottom');
            } else if (onToggleClaim) {
              onToggleClaim(index);
            }
          }}
          title={claimedBy === 'bottom' ? 'P1 Kazandı (İptal etmek için tıkla)' : 'Cepheyi P1 (Alt Oyuncu) için işaretle'}
          className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold transition-all shrink-0 ${
            claimedBy === 'bottom'
              ? 'bg-red-600 text-white ring-1 ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'bg-[#161616] text-[#777] border border-[#2A2A2A] hover:text-[#EDEDED] hover:border-[#555]'
          }`}
        >
          P1
        </button>

        {/* Centered CEPHE X label */}
        <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#EDEDED] tracking-wider select-none text-center whitespace-nowrap px-0.5">
          CEPHE {index}
        </span>

        {/* P2 Button (Right: Top Player) */}
        <button
          type="button"
          id={`claim-p2-front-${index}`}
          onClick={() => {
            if (onClaim) {
              onClaim(index, 'top');
            } else if (onToggleClaim) {
              onToggleClaim(index);
            }
          }}
          title={claimedBy === 'top' ? 'P2 Kazandı (İptal etmek için tıkla)' : 'Cepheyi P2 (Üst Oyuncu) için işaretle'}
          className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold transition-all shrink-0 ${
            claimedBy === 'top'
              ? 'bg-[#00FF41] text-[#0A0A0A] ring-1 ring-[#00FF41]'
              : 'bg-[#161616] text-[#777] border border-[#2A2A2A] hover:text-[#EDEDED] hover:border-[#555]'
          }`}
        >
          P2
        </button>
      </div>

      {/* Bottom Zone (Side B) */}
      <div
        id={`front-${index}-bottom-zone`}
        onDragOver={(e) => handleDragOver(e, 'bottom')}
        onDragLeave={(e) => handleDragLeave(e, 'bottom')}
        onDrop={(e) => handleDrop(e, 'bottom')}
        onClick={() => handleClickArea('bottom')}
        className={`relative flex flex-col items-center min-h-[125px] sm:min-h-[145px] rounded-[2px] p-1.5 transition-all duration-150 ${
          isDragOverBottom
            ? 'bg-[#1C1C1C] border border-[#00FF41]'
            : 'bg-[#141414]/50 border border-dashed border-[#262626] hover:border-[#444]'
        } ${selectedCardId ? 'cursor-pointer hover:border-[#666]' : ''}`}
      >
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-[#555] mb-1 select-none px-0.5">
          <span>BTM</span>
          <span>{bottomCards.length > 0 ? `[${bottomCards.length}${hasBataklik ? '/4' : '/3'}]` : ''}</span>
        </div>

        {bottomCards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#333] pointer-events-none">
            <div className="w-10 h-16 sm:w-14 sm:h-20 rounded-[2px] border border-dashed border-[#222] flex items-center justify-center text-[10px] font-mono">
              +
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center -space-y-[88px] sm:-space-y-[90px] w-full py-1 pb-3">
            {bottomCards.map((card, cardIdx) => {
              const isHovered = hoveredCardId === card.id;
              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{ zIndex: isHovered ? 999 : selectedCardId === card.id ? 100 : cardIdx + 1 }}
                  className="transition-all duration-150 ease-out hover:-translate-y-4 hover:scale-110 relative drop-shadow-2xl"
                >
                  <CardView
                    card={card}
                    size="sm"
                    isSelected={selectedCardId === card.id}
                    onSelect={() => onSelectCard(card)}
                    onFlip={() => onFlipCard(card.id)}
                    onReturnToHand={() => onReturnCardToHand(card.id)}
                    onDiscard={() => onDiscardCard(card.id)}
                    onDragStart={(evt) =>
                      onDragStartCard(card, { type: 'front_bottom', frontIndex: index }, evt)
                    }
                    onDragEnd={onDragEndCard}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
