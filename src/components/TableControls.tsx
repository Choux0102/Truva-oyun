import React, { useState } from 'react';
import { Sun, Moon, Users, HelpCircle, Maximize2, Minimize2, Palette } from 'lucide-react';

export type TableTheme = 'mat' | 'wood' | 'felt' | 'leather';

interface TableControlsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  tableTheme: TableTheme;
  onChangeTableTheme: (theme: TableTheme) => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  isDarkMode,
  onToggleTheme,
  tableTheme,
  onChangeTableTheme,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const themes: { id: TableTheme; label: string; icon: string; desc: string }[] = [
    { id: 'mat', label: 'Taktik Oyun Matı', icon: '♟️', desc: 'Modern karbon dokulu neopren oyun matı' },
    { id: 'felt', label: 'Yeşil Çuha (Kumarhane)', icon: '🟢', desc: 'Klasik lüks masa çuhası' },
    { id: 'wood', label: 'Meşe Ahşap Masa', icon: '🪵', desc: 'Ceviz ve meşe kaplama doğal ahşap dokusu' },
    { id: 'leather', label: 'Deri Masa Pedi', icon: '🟤', desc: 'Koyu füme dikişli deri yüzey' },
  ];

  return (
    <>
      <header className="w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-6 bg-[#0c0f14]/90 backdrop-blur-md border-b border-[#252b36] sticky top-0 z-40 shadow-lg">
        {/* Title & Brand System */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-6 h-6 rounded-[2px] bg-[#EDEDED] flex items-center justify-center text-[#0A0A0A] font-bold font-mono text-xs shadow-sm">
            9
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#EDEDED] font-mono">
                VOID TABLE // RULES-FREE
              </h1>
            </div>
            <p className="text-[10px] text-[#777] font-mono tracking-wider uppercase hidden sm:block">
              9 CEPHE & 60 KARTLIK DESTE • SÜRÜKLE-BIRAK SANDBOX
            </p>
          </div>
        </div>

        {/* Center Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-[#263040] bg-[#111620]/80">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
          <span className="text-[10px] font-mono text-[#888] tracking-widest uppercase">
            MASA DOKUSU: <span className="text-[#00FF41] font-bold">{themes.find(t => t.id === tableTheme)?.label}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table Surface Texture Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="table-theme-selector-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Masa Yüzey Dokusunu Değiştir"
              className="px-2.5 py-1.5 rounded-[2px] border border-[#2a3447] bg-[#131924] hover:bg-[#1a2332] text-[#EDEDED] text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Palette size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Masa: {themes.find(t => t.id === tableTheme)?.label.split(' ')[0]}</span>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-[#10151f] border border-[#2c384d] rounded-[3px] shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="text-[9px] font-mono text-[#667799] uppercase tracking-wider px-2 py-1 border-b border-[#212b3d]">
                  MASA YÜZEYİ TEMASI SEÇİN
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onChangeTableTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-[2px] text-xs font-mono flex items-center justify-between transition-colors ${
                      tableTheme === t.id
                        ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold'
                        : 'hover:bg-[#192231] text-[#99aacc]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </div>
                    {tableTheme === t.id && <span className="text-[10px] text-emerald-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2-Player Permanent Mode Badge */}
          <div
            id="two-player-badge"
            title="Standart 2 Kişilik Karşılıklı Masa Düzeni (P1 & P2)"
            className="px-2.5 py-1.5 rounded-[2px] border border-[#2a384d] bg-[#111926] text-[#88bbee] text-[11px] font-mono flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Users size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">2 Oyuncu</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            id="toggle-theme-btn"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
            className="p-1.5 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] transition-colors"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            id="toggle-fullscreen-btn"
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="p-1.5 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Help / Guide */}
          <button
            type="button"
            id="open-help-modal-btn"
            onClick={() => setShowHelp(!showHelp)}
            title="Masa Rehberi"
            className="p-1.5 rounded-[2px] border border-[#2A2A2A] bg-[#141414] text-[#AAA] hover:text-[#EDEDED] hover:border-[#444] transition-colors"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      {/* Minimalist Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#333] rounded-[3px] max-w-md w-full p-5 shadow-2xl text-[#EDEDED] text-xs font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
              <h2 className="font-bold text-sm tracking-widest uppercase">MASA KULLANIM REHBERİ</h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-[#666] hover:text-[#EDEDED] text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 leading-relaxed text-[#999]">
              <p>
                <strong className="text-[#EDEDED] block uppercase tracking-wider">KURALLARSIZ SİSTEM // SANDBOX:</strong>
                Bu masa tamamen serbest bir oyun alanıdır. Otomatik kural denetimi veya yapay zeka bulunmaz; kartları dilediğiniz gibi sürükleyip taşıyabilirsiniz.
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li><strong>Kart Çek:</strong> Desteden rastgele kartları elinize çeker.</li>
                <li><strong>Sürükle & Bırak:</strong> Kartları farenizle tutarak 9 cephenin üst/alt bölümlerine, ıskartaya veya elinize bırakabilirsiniz.</li>
                <li><strong>Tıklama ile Taşıma:</strong> Kart seçip hedef kutucuğa tıklayarak da taşıyabilirsiniz.</li>
                <li><strong>Cephe Kazananı:</strong> Cephe ortasındaki <strong>P1</strong> veya <strong>P2</strong> butonuna basarak cepheyi kimin kazandığını doğrudan işaretleyebilirsiniz (tekrar basıldığında sıfırlanır).</li>
                <li><strong>Kart Döndürme:</strong> Kartın üzerindeki göz ikonuna basarak kapalı/açık duruma getirebilirsiniz.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2 bg-[#EDEDED] text-[#0A0A0A] font-bold rounded-[2px] text-xs uppercase tracking-widest hover:bg-white transition-all"
            >
              ANLADIM, MASAYA DÖN
            </button>
          </div>
        </div>
      )}
    </>
  );
};
