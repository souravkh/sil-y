import { useState } from "react";
import scenarioData from "../../prompt.json";

type SavedPromptsProps = {
  onUsePrompts: (prompts: string[]) => void;
};

const scenarios = scenarioData["Scenarios-prompts"];
const scenarioNames = Object.keys(scenarios) as Array<keyof typeof scenarios>;

function SavedPrompts({ onUsePrompts }: SavedPromptsProps) {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof scenarios | "">("");

  const handleScenarioChange = (value: string) => {
    const scenario = scenarioNames.find((name) => name === value) ?? "";
    setSelectedScenario(scenario);
    onUsePrompts(scenario ? scenarios[scenario] : []);
  };

  return (
    <div className="flex items-end gap-2">
      <label className="grid min-w-0 flex-1 gap-1 text-xs font-medium text-[var(--muted)]">
        Scenario
        <select
          value={selectedScenario}
          onChange={(event) => handleScenarioChange(event.target.value)}
          className="w-full rounded-md border border-[var(--line-strong)] bg-[var(--surface-solid)] px-2 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        >
          <option value="">Select a scenario</option>
          {scenarioNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => handleScenarioChange("")}
        disabled={!selectedScenario}
        className="shrink-0 rounded-md border border-[var(--line)] bg-[var(--surface-solid)] px-3 py-2 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}

export default SavedPrompts;
