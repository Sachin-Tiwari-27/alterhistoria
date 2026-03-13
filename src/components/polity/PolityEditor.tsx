import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import type { Polity } from "@/types";

const POLITIES: { value: Polity; label: string; description: string }[] = [
  {
    value: "republic",
    label: "Republic",
    description: "Elected civilian government",
  },
  {
    value: "democracy",
    label: "Parliamentary Democracy",
    description: "Multi-party elected parliament",
  },
  {
    value: "monarchy",
    label: "Constitutional Monarchy",
    description: "King reigns, cabinet governs",
  },
  {
    value: "empire",
    label: "Empire",
    description: "Imperial rule, expansionist ideology",
  },
  {
    value: "federation",
    label: "Federation",
    description: "Decentralised union of states",
  },
  {
    value: "theocracy",
    label: "Theocracy",
    description: "Religious authority governs",
  },
  {
    value: "communist_state",
    label: "Communist State",
    description: "Party-led planned economy",
  },
  {
    value: "military_junta",
    label: "Military Junta",
    description: "Armed forces control government",
  },
  {
    value: "sultanate",
    label: "Sultanate",
    description: "Hereditary Islamic monarchy",
  },
  {
    value: "tribal_confederation",
    label: "Tribal Confederation",
    description: "Alliance of autonomous tribes",
  },
];

export function PolityEditor() {
  const { player, updatePlayerNation } = useGameStore();
  const { setShowPolityEditor } = useUIStore();

  const [form, setForm] = useState({
    customName: player?.customName ?? player?.name ?? "",
    customCapital: player?.customCapital ?? player?.capital ?? "",
    customPolity: (player?.customPolity ??
      player?.polity ??
      "republic") as Polity,
    customFlag: player?.customFlag ?? player?.flag ?? "",
    customDescription: player?.customDescription ?? "",
    customColor: player?.customColor ?? player?.color ?? "#d4a843",
  });

  const handleSave = () => {
    updatePlayerNation({
      customName: form.customName || undefined,
      customCapital: form.customCapital || undefined,
      customPolity: form.customPolity,
      customFlag: form.customFlag || undefined,
      customDescription: form.customDescription || undefined,
      customColor: form.customColor || undefined,
    });
    setShowPolityEditor(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-card border border-border rounded-lg w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-cinzel text-xl text-primary mb-1">
          Reshape Your Nation
        </h2>
        <p className="text-muted-foreground text-sm mb-5">
          Rename your country, change its form of government, and define its new
          identity. All AI interactions will personalise to these changes.
        </p>

        {/* Nation name */}
        <div className="mb-4">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-1 block">
            Nation Name
          </label>
          <input
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm"
            value={form.customName}
            onChange={(e) =>
              setForm((f) => ({ ...f, customName: e.target.value }))
            }
            placeholder={player?.name}
          />
          <p className="text-xs text-muted-foreground mt-1">
            e.g. "Bharat" instead of "India (British)"
          </p>
        </div>

        {/* Capital */}
        <div className="mb-4">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-1 block">
            Capital City
          </label>
          <input
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm"
            value={form.customCapital}
            onChange={(e) =>
              setForm((f) => ({ ...f, customCapital: e.target.value }))
            }
            placeholder={player?.capital}
          />
        </div>

        {/* Flag emoji */}
        <div className="mb-4">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-1 block">
            Flag (emoji)
          </label>
          <input
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm"
            value={form.customFlag}
            onChange={(e) =>
              setForm((f) => ({ ...f, customFlag: e.target.value }))
            }
            placeholder={player?.flag}
          />
        </div>

        {/* Map colour */}
        <div className="mb-4">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-1 block">
            Map Colour
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="w-10 h-10 rounded border border-border bg-input cursor-pointer"
              value={form.customColor}
              onChange={(e) =>
                setForm((f) => ({ ...f, customColor: e.target.value }))
              }
            />
            <span className="text-sm text-muted-foreground">
              {form.customColor}
            </span>
          </div>
        </div>

        {/* Polity selector */}
        <div className="mb-4">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-2 block">
            Form of Government
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POLITIES.map((p) => (
              <button
                key={p.value}
                onClick={() =>
                  setForm((f) => ({ ...f, customPolity: p.value }))
                }
                className={`text-left px-3 py-2 rounded border text-sm transition-all ${
                  form.customPolity === p.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-xs">{p.label}</div>
                <div className="text-xs text-muted-foreground">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom lore */}
        <div className="mb-6">
          <label className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase mb-1 block">
            National Description / Lore
          </label>
          <textarea
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm resize-none h-20"
            value={form.customDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, customDescription: e.target.value }))
            }
            placeholder="Describe your nation's unique identity, ideology, and goals…"
          />
        </div>

        {/* Preview */}
        <div className="bg-muted/30 border border-border rounded p-3 mb-5 text-sm">
          <div className="font-cinzel text-primary mb-1">Preview</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{form.customFlag || player?.flag}</span>
            <div>
              <div className="font-medium">
                {form.customName || player?.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {POLITIES.find((p) => p.value === form.customPolity)?.label} ·{" "}
                {form.customCapital || player?.capital}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-cinzel tracking-wider"
          >
            CONFIRM CHANGES
          </button>
          <button
            onClick={() => setShowPolityEditor(false)}
            className="px-4 py-2 border border-border rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
