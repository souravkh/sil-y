import { useRef } from "react";
import uploadLogo from "../../assets/upload.svg";
import promptFileChecker from "../utils/ExtensionHelper";

type PromptUploadProps = {
  file: File | null;
  promptCount: number;
  onFileChange: (file: File | null) => void;
};

function PromptUpload({ file, promptCount, onFileChange }: PromptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;
    const fileName = selectedFile?.name ?? "";
    if (!promptFileChecker(fileName)) {
      event.target.value = "";
      return;
    }
    event.target.value = "";
    onFileChange(selectedFile);
  };

  if (file && promptCount > 0) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate font-medium text-[var(--ink)]" title={`${file.name} · ${promptCount} prompts`}>
          {file.name} · {promptCount} prompts
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 cursor-pointer font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Change
        </button>
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            onFileChange(null);
          }}
          className="shrink-0 cursor-pointer text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Reset
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.json,text/plain,application/json"
          hidden
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        type="text"
        readOnly
        value={file?.name ?? ""}
        placeholder="Choose a .txt or .json file"
        className="min-w-0 flex-1 truncate rounded-md border border-[var(--line-strong)] bg-[var(--surface-soft)] px-2 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--muted)]"
      />

      {/* Actual file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.json,text/plain,application/json"
        hidden
        onChange={handleFileChange}
      />

      {/* Custom upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Choose a .txt or .json file"
        className="shrink-0 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--surface-solid)] p-1.5 transition hover:bg-[var(--accent-soft)]"
      >
        <img src={uploadLogo} alt="" className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => {
          if (inputRef.current) inputRef.current.value = "";
          onFileChange(null);
        }}
        disabled={!file}
        className="shrink-0 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--surface-solid)] px-2 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}

export default PromptUpload;
