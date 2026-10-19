import React, { useState } from 'react';
import { X, Sparkles, Sliders, User, Eye, Check } from 'lucide-react';
import { PersonalitySettings, ResponseStyle, PersonalityIntensity } from '../../types/dashboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PersonalitySettings;
  onSave: (newSettings: PersonalitySettings) => void;
}

export const DashboardSettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<PersonalitySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setForm(settings);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const responseStyles: { id: ResponseStyle; label: string; desc: string }[] = [
    { id: 'balanced', label: 'Balanced', desc: 'Natural flow, clear structure, thoughtful depth' },
    { id: 'concise', label: 'Concise', desc: 'Crisp, punchy, straight to the point' },
    { id: 'detailed', label: 'Detailed', desc: 'Deep dive, comprehensive logic and examples' },
    { id: 'creative', label: 'Creative', desc: 'Vibrant analogies, imaginative storytelling' },
  ];

  const intensityLevels: { id: PersonalityIntensity; label: string; desc: string; color: string }[] = [
    { id: 'calm', label: 'Calm Senpai', desc: 'Serene, grounding, composed mentor presence', color: 'from-[#0B00CF]/30 to-[#300A6E]/30' },
    { id: 'playful', label: 'Playful & Witty', desc: 'Mischievous teasing, clever banter, energetic charm', color: 'from-[#300A6E]/30 to-[#FF2D2B]/30' },
    { id: 'expressive', label: 'Ultra Expressive', desc: 'High energy, vibrant anime flair & dramatic reactions', color: 'from-[#FF2D2B]/30 to-[#C10823]/30' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#0A0D20] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow Accent */}
        <div
          className="absolute -top-24 right-0 w-72 h-32 rounded-full blur-[90px] pointer-events-none opacity-30"
          style={{ background: 'linear-gradient(90deg, #0B00CF, #FF2D2B)' }}
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Aurora Personality & Experience
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Fine-tune Aurora's tone, intelligence, and interface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* User Display Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">
              <User className="w-3.5 h-3.5 text-[#FF2D2B]" />
              How Aurora Addresses You
            </label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              placeholder="e.g. Kouhai, Senpai, or your name"
              maxLength={32}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F142D] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2D2B]/50 focus:ring-1 focus:ring-[#FF2D2B]/50 transition-all"
            />
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Aurora will use this name during conversations and banter.
            </p>
          </div>

          {/* Personality Intensity */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#A5B4FC]" />
              Personality Intensity
            </label>
            <div className="grid grid-cols-1 gap-2">
              {intensityLevels.map((lvl) => {
                const isSelected = form.intensity === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setForm({ ...form, intensity: lvl.id })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#FF2D2B]/60 bg-gradient-to-r ' + lvl.color + ' ring-1 ring-[#FF2D2B]/30'
                        : 'border-white/5 bg-[#0F142D]/50 hover:bg-[#0F142D] hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {lvl.label}
                        {isSelected && <span className="text-[10px] text-[#FF2D2B] font-mono">ACTIVE</span>}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{lvl.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF2D2B] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Response Style */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
              Response Depth & Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {responseStyles.map((style) => {
                const isSelected = form.responseStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setForm({ ...form, responseStyle: style.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B00CF]/80 bg-[#0B00CF]/20 ring-1 ring-[#0B00CF]/50'
                        : 'border-white/5 bg-[#0F142D]/50 hover:bg-[#0F142D] hover:border-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{style.label}</div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-2">{style.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interface Toggles */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">
              <Eye className="w-3.5 h-3.5 text-[#34D399]" />
              Interface Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0F142D]/60 border border-white/5 cursor-pointer hover:border-white/10">
                <div>
                  <span className="text-xs font-semibold text-white">Reduced Motion</span>
                  <p className="text-[11px] text-[#94A3B8]">Disable smooth scroll and floating animations</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.reducedMotion}
                  onChange={(e) => setForm({ ...form, reducedMotion: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0B00CF] bg-[#070914] border-white/20 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0F142D]/60 border border-white/5 cursor-pointer hover:border-white/10">
                <div>
                  <span className="text-xs font-semibold text-white">Compact Spacing</span>
                  <p className="text-[11px] text-[#94A3B8]">Reduce padding and message margins for high information density</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.compactSpacing}
                  onChange={(e) => setForm({ ...form, compactSpacing: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0B00CF] bg-[#070914] border-white/20 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-aurora-gradient px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
