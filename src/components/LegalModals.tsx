import React from 'react';
import { X, Shield, FileText, Mail, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [contactSent, setContactSent] = React.useState(false);
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');

  React.useEffect(() => {
    setContactSent(false);
    setContactEmail('');
    setContactMessage('');
  }, [type]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-[#080B1B] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="sticky top-0 float-right -mr-2 -mt-2 p-1.5 rounded-lg text-[#94A3B8] hover:text-white bg-[#080B1B]/80 backdrop-blur-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F142D] border border-white/10 flex items-center justify-center text-[#0B00CF]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Privacy Commitment</h3>
                <span className="text-xs text-[#94A3B8]">Safe, transparent data practices for teenagers and families</span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                Aurora is designed to provide a supportive, fun, and confidential space. We believe privacy shouldn't be hidden behind complex legal jargon.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">1. Data Minimization</h4>
                <p className="text-xs text-[#94A3B8]">
                  We only retain the conversational context needed to remember your discussions and preferences. We do not sell your personal data or conversation transcripts to third parties.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">2. Teen Safety & Guardrails</h4>
                <p className="text-xs text-[#94A3B8]">
                  Aurora enforces strict emotional safety guardrails. When detecting severe distress, self-harm risks, or unsafe situations, Aurora gently directs users to professional human support hotlines.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">3. Deletion Control</h4>
                <p className="text-xs text-[#94A3B8]">
                  You maintain full ownership of your data. You will be able to wipe your conversation history and delete your account at any time with a single tap in your future profile settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F142D] border border-white/10 flex items-center justify-center text-[#FF2D2B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Terms of Service</h3>
                <span className="text-xs text-[#94A3B8]">Guidelines for interacting with your AI senpai</span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                By using Aurora, you agree to treat the experience with respect and understanding of AI capabilities.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">1. Nature of the Companion</h4>
                <p className="text-xs text-[#94A3B8]">
                  Aurora is an artificial intelligence persona. While designed to be empathetic, thoughtful, and expressive, she is an AI companion and does not replace medical, psychiatric, or crisis intervention professionals.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">2. Age Eligibility</h4>
                <p className="text-xs text-[#94A3B8]">
                  Aurora is tailored for teenagers and young adults aged 13 and above. We design our interactions with age-appropriate boundaries, non-sexualized themes, and positive emotional support.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white">3. Acceptable Use</h4>
                <p className="text-xs text-[#94A3B8]">
                  Users agree not to attempt jailbreaking safety filters, generate abusive or harmful materials, or exploit platform infrastructure.
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F142D] border border-white/10 flex items-center justify-center text-[#C10823]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Contact the Aurora Team</h3>
                <span className="text-xs text-[#94A3B8]">Feedback, creator inquiries, and parent questions</span>
              </div>
            </div>

            {contactSent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Message Dispatched!</h4>
                <p className="text-xs text-[#94A3B8] mb-6">
                  Thanks for reaching out! Aurora and our development team will review your note shortly.
                </p>
                <button
                  onClick={onClose}
                  className="btn-aurora-gradient px-6 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (contactEmail && contactMessage) {
                    setContactSent(true);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050713] border border-white/10 rounded-xl text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Your Note or Feedback
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you'd love to chat with Aurora about..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050713] border border-white/10 rounded-xl text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-aurora-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  Send to Aurora Team
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
