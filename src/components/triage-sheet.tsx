import { useState } from "react";
import { Heart, Laptop, Navigation, Phone, Shield, X, Zap } from "lucide-react";
import { Link } from "@/lib/nav";
import { resourcesForTriage, telHref, type TriageNeed } from "@/lib/resources";
import { useUiStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";

const NEEDS: Array<{
  key: TriageNeed;
  label: string;
  desc: string;
  icon: typeof Shield;
}> = [
  { key: "shelter", label: "Shelter tonight", desc: "Beds, day center, vouchers", icon: Shield },
  { key: "food", label: "Meal or pantry", desc: "Hot lunch, groceries, no ID", icon: Heart },
  { key: "travel", label: "Fuel or travel", desc: "Gas cards, stranded help", icon: Navigation },
  { key: "id_tech", label: "ID & computer", desc: "Applications, job search", icon: Laptop },
];

export function TriageSheet() {
  const open = useUiStore((s) => s.triageOpen);
  const close = useUiStore((s) => s.closeTriage);
  const [step, setStep] = useState<1 | 2>(1);
  const [need, setNeed] = useState<TriageNeed>("food");

  if (!open) return null;

  const matches = resourcesForTriage(need);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-pine-deep/70"
        aria-label="Close helper"
        onClick={() => {
          close();
          setStep(1);
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="triage-title"
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-paper p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)] md:max-w-lg md:rounded-3xl md:p-7"
      >
        <button
          type="button"
          onClick={() => {
            close();
            setStep(1);
          }}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-xl text-ink-soft"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {step === 1 ? (
          <div className="space-y-5">
            <div className="pr-10">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber">
                <Zap className="size-3.5" aria-hidden />
                Quick helper
              </p>
              <h2 id="triage-title" className="mt-3 font-display text-2xl font-semibold">
                What do you need right now?
              </h2>
              <p className="mt-2 text-ink-soft">
                One tap. We’ll show the closest Brevard County options.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NEEDS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setNeed(option.key);
                      setStep(2);
                    }}
                    className="rounded-2xl bg-paper-raised p-4 text-left shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]"
                  >
                    <span className="flex items-center gap-2 font-semibold text-sea">
                      <Icon className="size-4" aria-hidden />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">{option.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="text-ink-soft">In immediate danger?</span>
              <a href="tel:911" className="font-bold text-danger">
                Call 911
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="pr-10">
              <p className="text-xs font-bold uppercase tracking-widest text-sea">Next steps</p>
              <h2 id="triage-title" className="mt-1 font-display text-2xl font-semibold">
                Places that can help
              </h2>
            </div>

            <div className="space-y-3">
              {matches.length === 0 ? (
                <p className="text-ink-soft">No exact matches. Browse the full directory.</p>
              ) : (
                matches.map((res) => (
                  <div key={res.id} className="rounded-2xl bg-paper-raised p-4 shadow-[var(--shadow-border)]">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">{res.name}</h3>
                      <span className="shrink-0 rounded-full bg-ok-soft px-2 py-1 text-xs font-bold text-ok">
                        {res.hoursText}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{res.description}</p>
                    <p className="mt-2 text-sm text-ink-soft">{res.address}</p>
                    <a
                      href={telHref(res.phone)}
                      className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-sea"
                    >
                      <Phone className="size-4" aria-hidden />
                      {res.phone}
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-11 font-semibold text-ink-soft"
              >
                Back
              </button>
              <Button asChild variant="pine" size="sm">
                <Link
                  to="/directory"
                  onClick={() => {
                    close();
                    setStep(1);
                  }}
                >
                  Full directory
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
