import React, { useState } from 'react';
import { PlayerRole, ServerRoomState } from '../hooks/useMultiplayer';
import { Users, Wifi, WifiOff, Link, Copy, Check, Settings, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface RoomControlsProps {
  roomId: string;
  role: PlayerRole;
  playerName: string;
  isConnected: boolean;
  isConnecting: boolean;
  serverState: ServerRoomState | null;
  lastActionText: string;
  onChangeRoom: (newRoomId: string, newRole: PlayerRole, newName?: string) => void;
}

export const RoomControls: React.FC<RoomControlsProps> = ({
  roomId,
  role,
  playerName,
  isConnected,
  isConnecting,
  serverState,
  lastActionText,
  onChangeRoom,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [inputRole, setInputRole] = useState<PlayerRole>(role);
  const [inputName, setInputName] = useState(playerName);

  const handleCopyInvite = () => {
    // Generate invite URL for the other player
    const targetRole = role === 'p1' ? 'p2' : role === 'p2' ? 'p1' : 'p2';
    const origin = window.location.origin;
    const inviteUrl = `${origin}/?room=${encodeURIComponent(roomId)}&role=${targetRole}`;

    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      onChangeRoom(inputRoomId.trim(), inputRole, inputName.trim());
      setShowModal(false);
    }
  };

  const getRoleLabel = (r: PlayerRole) => {
    switch (r) {
      case 'p1':
        return 'PLAYER 1 (ALT)';
      case 'p2':
        return 'PLAYER 2 (ÜST)';
      case 'spectator':
        return 'İZLEYİCİ';
      case 'local':
      default:
        return 'YEREL / TEK CİHAZ';
    }
  };

  return (
    <>
      {/* Top Banner / Live Room Bar */}
      <div className="w-full bg-[#0d121c]/95 border-b border-[#202b3d] px-3 py-1.5 sm:px-6 flex items-center justify-between gap-2 text-xs font-mono backdrop-blur-md shadow-inner flex-wrap">
        {/* Left: Room ID & Role Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#141c2c] border border-[#2b3a52] text-[#88bbee]">
            <span className="text-[#5588cc] text-[10px]">ODA:</span>
            <span className="font-bold text-white tracking-wider">#{roomId}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border text-[11px] font-bold ${
            role === 'p1'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : role === 'p2'
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              : role === 'spectator'
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300'
          }`}>
            <span className="text-[9px] uppercase tracking-wider text-[#7799bb]">ROL:</span>
            <span>{getRoleLabel(role)}</span>
          </div>

          {/* Connection & Presence Status */}
          {role !== 'local' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px]">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi size={12} className="animate-pulse" />
                    <span className="hidden md:inline">Canlı Bağlantı</span>
                  </span>
                ) : isConnecting ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Wifi size={12} className="animate-spin" />
                    <span>Bağlanıyor...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400">
                    <WifiOff size={12} />
                    <span>Kopuk</span>
                  </span>
                )}
              </div>

              {serverState && (
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] bg-[#111824] px-2 py-0.5 rounded-[2px] border border-[#222e42]">
                  <span className={`w-2 h-2 rounded-full ${serverState.p1Online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  <span className={serverState.p1Online ? 'text-zinc-200' : 'text-zinc-500'}>
                    {serverState.p1Name || 'P1'}
                  </span>
                  <span className="text-zinc-600">vs</span>
                  <span className={`w-2 h-2 rounded-full ${serverState.p2Online ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
                  <span className={serverState.p2Online ? 'text-zinc-200' : 'text-zinc-500'}>
                    {serverState.p2Name || 'P2'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-700">
              Çevrimdışı / Tek Cihaz
            </div>
          )}
        </div>

        {/* Center/Right: Action ticker & Room Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {lastActionText && (
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-400 bg-[#101622] px-2.5 py-0.5 rounded border border-[#1f2a3d] max-w-sm truncate">
              <span className="text-emerald-400">⚡</span>
              <span className="truncate">{lastActionText}</span>
            </div>
          )}

          {/* Copy Invite Link */}
          {role !== 'local' && (
            <button
              type="button"
              id="copy-invite-link-btn"
              onClick={handleCopyInvite}
              title="Rakip İçin Davet Linkini Kopyala"
              className={`px-2.5 py-1 rounded-[2px] border text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                  : 'bg-[#162133] border-[#2d4060] text-emerald-400 hover:bg-[#1f2e47] hover:text-white'
              }`}
            >
              {copied ? <Check size={12} /> : <Link size={12} />}
              <span>{copied ? 'Link Kopyalandı!' : 'Rakibi Davet Et'}</span>
            </button>
          )}

          {/* Room Settings Button */}
          <button
            type="button"
            id="open-room-modal-btn"
            onClick={() => {
              setInputRoomId(roomId);
              setInputRole(role);
              setInputName(playerName);
              setShowModal(true);
            }}
            title="Oda ve Oyuncu Rolü Değiştir"
            className="px-2.5 py-1 rounded-[2px] border border-[#2b394f] bg-[#121a28] text-zinc-300 hover:text-white hover:bg-[#1b263b] text-[11px] flex items-center gap-1 transition-colors"
          >
            <Settings size={12} />
            <span className="hidden sm:inline">Oda Değiştir</span>
          </button>
        </div>
      </div>

      {/* Room & Role Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1521] border border-[#2b3a52] rounded-[4px] p-5 shadow-2xl font-mono text-[#EDEDED] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#212e44] mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <h2 className="text-sm font-bold tracking-wider uppercase text-white">
                  ÇEVRİMİÇİ ÇOK OYUNCULU ODA
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              {/* Room Code */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">
                  ODA KODU (ROOM CODE):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                    placeholder="Örn: ARENA-1 veya DUEL-99"
                    required
                    className="flex-1 px-3 py-2 bg-[#090d14] border border-[#26354c] rounded-[2px] text-white font-bold tracking-wider focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setInputRoomId(`ARENA-${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-2.5 py-2 bg-[#172233] border border-[#2c3d59] text-zinc-300 hover:text-white rounded-[2px] text-[10px]"
                  >
                    Rastgele
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Aynı oda koduna giren 2 oyuncu karşılıklı aynı masada buluşur.
                </p>
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">
                  OYUNCU ADINIZ:
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="İsminiz"
                  className="w-full px-3 py-2 bg-[#090d14] border border-[#26354c] rounded-[2px] text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">
                  OYNAYACAĞINIZ ROL:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputRole('p1')}
                    className={`p-2.5 rounded-[2px] border text-left flex flex-col gap-1 transition-all ${
                      inputRole === 'p1'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                        : 'bg-[#121926] border-[#222e40] text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-400 flex items-center justify-between">
                      <span>PLAYER 1</span>
                      <span>(Alt Alan)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Kendi elinizi görürsünüz, P2 eli kapalıdır.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputRole('p2')}
                    className={`p-2.5 rounded-[2px] border text-left flex flex-col gap-1 transition-all ${
                      inputRole === 'p2'
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                        : 'bg-[#121926] border-[#222e40] text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-bold text-xs text-cyan-400 flex items-center justify-between">
                      <span>PLAYER 2</span>
                      <span>(Üst Alan)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Kendi elinizi görürsünüz, P1 eli kapalıdır.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputRole('spectator')}
                    className={`p-2.5 rounded-[2px] border text-left flex flex-col gap-1 transition-all ${
                      inputRole === 'spectator'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                        : 'bg-[#121926] border-[#222e40] text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-400">İZLEYİCİ</div>
                    <span className="text-[10px] text-zinc-400">
                      Masadaki oyunu canlı takip eder.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputRole('local')}
                    className={`p-2.5 rounded-[2px] border text-left flex flex-col gap-1 transition-all ${
                      inputRole === 'local'
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                        : 'bg-[#121926] border-[#222e40] text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-bold text-xs text-purple-400">TEK CİHAZ</div>
                    <span className="text-[10px] text-zinc-400">
                      İnternetsiz yerel test modu.
                    </span>
                  </button>
                </div>
              </div>

              {/* Fog of War notice */}
              <div className="p-2.5 rounded-[2px] bg-[#121a28] border border-[#23334c] flex items-start gap-2 text-zinc-300 text-[10px]">
                <ShieldAlert size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gizli El Güvencesi:</strong> Oyuncular sadece kendi elindeki 7 kartı açık görür; rakibin elindeki kartlar arkası dönük ve gizli tutulur.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#212e44]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[2px]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-[2px] shadow-md transition-colors"
                >
                  Odaya Katıl / Uygula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
