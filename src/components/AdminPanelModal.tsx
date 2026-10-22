import React, { useState } from 'react';
import {
  X,
  Crown,
  ShieldCheck,
  Activity,
  Sliders,
  Terminal,
  Volume2,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  Search,
  MapPin,
  Cpu,
} from 'lucide-react';
import { UserProfile, ADMIN_EMAIL } from '../types/auth';
import { synthesizeSpeech } from '../services/aiService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'users' | 'testing'>('overview');
  const [testSpeechText, setTestSpeechText] = useState('Greetings Administrator Jayden. All Aurora neural systems and grounding tools are operating at peak efficiency.');
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Simulated admin persona tuning
  const [senpaiBanter, setSenpaiBanter] = useState(85);
  const [techDepth, setTechDepth] = useState(90);
  const [animeReferences, setAnimeReferences] = useState(75);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    try {
      setIsPlayingTestVoice(true);
      setTestStatus('Generating speech with gemini-3.8-flash-lite-tts (voice: Kore)...');
      const audioUrl = await synthesizeSpeech(testSpeechText, 'Kore');
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlayingTestVoice(false);
        setTestStatus('Playback finished successfully.');
      };
      audio.onerror = () => {
        setIsPlayingTestVoice(false);
        setTestStatus('Audio playback encountered an error.');
      };
      await audio.play();
    } catch (e: any) {
      setIsPlayingTestVoice(false);
      setTestStatus(`Error: ${e.message || 'TTS generation failed'}`);
    }
  };

  const handleSaveTuning = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#070A18] border border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(11,0,207,0.35)] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 rounded-full blur-[90px] pointer-events-none opacity-30"
          style={{ background: 'linear-gradient(90deg, #FF2D2B, #0B00CF)' }}
        />

        {/* Modal Header */}
        <header className="relative z-10 px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B0E24]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D2B]/20 to-[#0B00CF]/30 border border-[#FF2D2B]/40 flex items-center justify-center text-[#FF2D2B] shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Aurora Admin Console
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/40 font-bold tracking-wider">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Logged in as <strong className="text-white">{currentUser?.email || ADMIN_EMAIL}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close admin panel"
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#090C1F] px-4 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#FF2D2B] text-white bg-white/[0.02]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('models')}
            className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'models'
                ? 'border-[#FF2D2B] text-white bg-white/[0.02]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Persona Tuning</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('testing')}
            className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'testing'
                ? 'border-[#FF2D2B] text-white bg-white/[0.02]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Diagnostic Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#FF2D2B] text-white bg-white/[0.02]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Access Control</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm text-[#CBD5E1]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Admin Privileges Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF2D2B]/15 via-[#0B00CF]/15 to-transparent border border-[#FF2D2B]/30 flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-[#FF2D2B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Super Administrator Privileges Activated
                  </h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Account <strong className="text-white">{currentUser?.email || ADMIN_EMAIL}</strong> has full elevated authorization across all Aurora AI services, grounding tools, real-time voice synthesis, and conversation logs.
                  </p>
                </div>
              </div>

              {/* Live Services Grid */}
              <h5 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] pt-2">
                System Engines & Telemetry
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Conversational Model</span>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#0B00CF]" />
                      gemini-3.8-flash
                    </h6>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online • Low latency
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Voice Speech Engine</span>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#FF2D2B]" />
                      gemini-3.8-flash-lite-tts
                    </h6>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Voice: Kore • 24kHz Mono WAV
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Google Search Grounding</span>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#38BDF8]" />
                      googleSearch Tool
                    </h6>
                    <p className="text-[11px] text-[#38BDF8] flex items-center gap-1">
                      Live web indexing active
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Google Maps Grounding</span>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F43F5E]" />
                      googleMaps Tool
                    </h6>
                    <p className="text-[11px] text-[#F43F5E] flex items-center gap-1">
                      Geospatial places active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONA TUNING */}
          {activeTab === 'models' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Aurora Dynamic Persona Directives</h4>
                <p className="text-xs text-[#94A3B8]">
                  Adjust real-time neural weights for Aurora's conversational temperament. Changes take effect on subsequent turns.
                </p>
              </div>

              <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#E2E8F0] font-medium">Senpai Banter & Playfulness</span>
                    <span className="text-[#FF2D2B] font-mono">{senpaiBanter}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={senpaiBanter}
                    onChange={(e) => setSenpaiBanter(Number(e.target.value))}
                    className="w-full accent-[#FF2D2B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                    <span>Gentle & reserved</span>
                    <span>Unfiltered teasing</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#E2E8F0] font-medium">Technical Depth & Code Rigor</span>
                    <span className="text-[#0B00CF] font-mono text-[#818CF8]">{techDepth}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={techDepth}
                    onChange={(e) => setTechDepth(Number(e.target.value))}
                    className="w-full accent-[#0B00CF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                    <span>High-level overview</span>
                    <span>Production architecture</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#E2E8F0] font-medium">Anime & Streetwear References</span>
                    <span className="text-emerald-400 font-mono">{animeReferences}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={animeReferences}
                    onChange={(e) => setAnimeReferences(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] mt-0.5">
                    <span>Strictly professional</span>
                    <span>Cultured & lore-heavy</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {savedNotice ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Parameters synced to neural engine!
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#64748B]">Auto-cached locally</span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveTuning}
                    className="btn-aurora-gradient px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    Apply Persona Weights
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTIC TESTING */}
          {activeTab === 'testing' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Voice & Model Test Console</h4>
                <p className="text-xs text-[#94A3B8]">
                  Directly dispatch test payloads to the backend TTS and text streaming endpoints.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <label className="block text-xs font-medium text-[#E2E8F0]">
                  Test Voice Speech Synthesis (Kore Voice):
                </label>
                <textarea
                  value={testSpeechText}
                  onChange={(e) => setTestSpeechText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#050713] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF2D2B] resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8]">
                    {testStatus || 'Ready to dispatch to /api/tts'}
                  </span>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    disabled={isPlayingTestVoice}
                    className="btn-aurora-gradient px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingTestVoice ? 'Synthesizing...' : 'Play Audio Broadcast'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS CONTROL */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Administrator Authorization Table</h4>
                <p className="text-xs text-[#94A3B8]">
                  Users with administrative privileges over the Aurora application.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-[#94A3B8] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3 font-medium text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#FF2D2B]/20 text-[#FF2D2B] flex items-center justify-center font-bold text-[10px]">
                          J
                        </div>
                        <div>
                          <span>Jayden</span>
                          <span className="block text-[10px] text-[#94A3B8]">{currentUser?.email || ADMIN_EMAIL}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/30 font-semibold text-[10px]">
                          SUPER ADMIN
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[11px] text-[#64748B]">Permanent Root</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="p-4 bg-[#090C1F] border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Crown className="w-3.5 h-3.5 text-[#FF2D2B]" />
            <span>Aurora Admin Terminal v2.5</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Terminal
          </button>
        </footer>
      </div>
    </div>
  );
};
