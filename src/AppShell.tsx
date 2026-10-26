import Header from "./features/header/header";
import Footer from "./features/footer/Footer";
import PromptManagement from "./features/prompt-management/PromptManagement";
import { useEffect, useState } from "react";
import Prompt from "./features/result/Prompts";
import {
  readPromptsFile,
  type PromptRecord,
} from "./features/utils/TxtFileReader";
import TestRunner from "./features/test-runner/TextRunner";
import { exportPrompts } from "./features/utils/exportService";
import SavedPrompts from "./features/saved-prompts/SavedPrompts";

function AppShell() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("sil-y-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sil-y-theme", theme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme]);

  const [promptFile, setPromptFile] = useState<File | null>(null);
  const [promptSource, setPromptSource] = useState<"file" | "saved">("file");
  const [prompts, setPrompts] = useState<PromptRecord>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isPromptListOpen, setIsPromptListOpen] = useState(true);

  const handleExport = async (format: "txt" | "xlsx") => {
    try {
      setIsExporting(true);
      await exportPrompts(prompts, format, "my-saved-prompts");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export prompts.");
    } finally {
      setIsExporting(false);
    }
  };

  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const updateCurrentPrompt = (newPrompt: string): void => {
    if (newPrompt) setCurrentPrompt(newPrompt);
  };

  const handlePromptFileChange = async (file: File | null) => {
    if (!file) {
      setPromptFile(null);
      setPrompts({});
      setCurrentPrompt("");
      return;
    }

    try {
      const promptRecord = await readPromptsFile(file);
      setPromptFile(file);
      setPrompts(promptRecord);
      const firstPrompt = Object.keys(promptRecord)[0];
      setCurrentPrompt(firstPrompt ?? "");
    } catch (error) {
      console.error("Failed to load prompts:", error);
      alert(error instanceof Error ? error.message : "Failed to load prompts.");
    }
  };

  const handleUsePrompts = (newPrompts: string[]) => {
    const promptsToUse = [...new Set(newPrompts.map((prompt) => prompt.trim()).filter(Boolean))];
    setPromptFile(null);
    setPrompts(Object.fromEntries(promptsToUse.map((prompt) => [prompt, ""])));
    setCurrentPrompt(promptsToUse[0] ?? "");
  };

  const updateCurrentPromptDuration = (duration: string): void => {
    if (!currentPrompt || duration.trim() === "") return;

    setPrompts((previousPrompts) => ({
      ...previousPrompts,
      [currentPrompt]: duration,
    }));

    const promptList = Object.keys(prompts);
    const currentIndex = promptList.indexOf(currentPrompt);
    const nextPrompt = promptList[currentIndex + 1];

    if (nextPrompt) {
      setCurrentPrompt(nextPrompt);
    }
  };

  const promptList = Object.keys(prompts);
  const promptCount = promptList.length;
  const currentPromptIndex = promptList.indexOf(currentPrompt);

  return (
    <div className="app-shell relative flex h-screen flex-col overflow-hidden text-[var(--ink)] transition-colors duration-300" data-theme={theme}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === "light" ? "dark" : "light")}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <section className="shrink-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-glass)] backdrop-blur-md">
          <div className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface-soft)] p-1" role="group" aria-label="Choose prompt source">
            <button
              type="button"
              onClick={() => setPromptSource("file")}
              aria-pressed={promptSource === "file"}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${promptSource === "file" ? "bg-[var(--surface-solid)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"}`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => setPromptSource("saved")}
              aria-pressed={promptSource === "saved"}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${promptSource === "saved" ? "bg-[var(--surface-solid)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"}`}
            >
              Saved scenarios
            </button>
          </div>
          {promptSource === "file" ? (
            <PromptManagement
              file={promptFile}
              promptCount={promptCount}
              onFileChange={handlePromptFileChange}
            />
          ) : (
            <SavedPrompts onUsePrompts={handleUsePrompts} />
          )}
        </section>

        {promptCount === 0 ? (
          <p className="px-1 text-xs text-[var(--muted)]">
            Choose a source above and load prompts to start.
          </p>
        ) : (
          <>
            <section className="shrink-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-glass)] backdrop-blur-md">
              <TestRunner
                key={currentPrompt}
                currentPrompt={currentPrompt}
                currentIndex={currentPromptIndex + 1}
                total={promptCount}
                onSaving={updateCurrentPromptDuration}
              />
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-glass)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setIsPromptListOpen((open) => !open)}
                aria-expanded={isPromptListOpen}
                className="flex w-full shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--section-header)] px-3 py-2 text-left text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--accent-soft)]"
              >
                <span>Prompts · {promptCount}</span>
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 text-[var(--muted)] transition-transform ${isPromptListOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                </svg>
              </button>
              {isPromptListOpen && (
                <Prompt
                  promptData={prompts}
                  currentPrompt={currentPrompt}
                  onSelectedPromptChange={updateCurrentPrompt}
                />
              )}
            </section>

            <div className="flex shrink-0 items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleExport("txt")}
                disabled={isExporting}
                className="w-24 cursor-pointer rounded-lg border border-white/35 bg-gradient-to-br from-[#438DFF]/95 to-[#2F72E8]/95 px-3 py-1 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(67,141,255,0.3)] backdrop-blur-xl transition hover:from-[#5598FF] hover:to-[#377FEF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                TXT
              </button>
              <button
                type="button"
                onClick={() => handleExport("xlsx")}
                disabled={isExporting}
                className="w-24 cursor-pointer rounded-lg border border-white/35 bg-gradient-to-br from-[#438DFF]/90 to-[#245FC7]/95 px-3 py-1 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(67,141,255,0.26)] backdrop-blur-xl transition hover:from-[#5598FF] hover:to-[#2F72E8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                XLSX
              </button>
            </div>
          </>
        )}
      </main>

      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}

export default AppShell;
