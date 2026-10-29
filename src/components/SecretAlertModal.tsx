import React from 'react';
import { AlertTriangle, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { SecretFinding } from '../types';

interface SecretAlertModalProps {
  isOpen: boolean;
  findings: SecretFinding[];
  onClose: () => void;
  onProceedAnyway: () => void;
}

export const SecretAlertModal: React.FC<SecretAlertModalProps> = ({
  isOpen,
  findings,
  onClose,
  onProceedAnyway,
}) => {
  if (!isOpen) return null;

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-rose-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-rose-950/60 p-4 border-b border-rose-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-300">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Sensitive Credentials Detected ({findings.length})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto max-h-[360px] space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            RepoPilot&apos;s pre-publish secret scanner identified {criticalCount} high-risk token(s) in your project files. Publishing these to GitHub may expose your cloud accounts or API quotas.
          </p>

          <div className="space-y-2.5 mt-2">
            {findings.map((f, i) => (
              <div
                key={i}
                className="bg-slate-950/80 border border-rose-900/60 rounded-xl p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    {f.type}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {f.severity}
                  </span>
                </div>

                <div className="text-slate-400 font-mono text-[11px]">
                  File: <strong className="text-slate-200">{f.path}</strong> (Line {f.line})
                </div>

                <div className="bg-slate-900 p-2 rounded text-slate-300 font-mono text-[11px] truncate">
                  {f.preview}
                </div>

                <div className="text-[11px] text-amber-300/80 italic">
                  💡 {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Cancel &amp; Remove Secrets
          </button>
          <button
            onClick={onProceedAnyway}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
          >
            <span>Proceed Anyway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
