export type PromptRecord = Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readPromptsFile(
  file: File
): Promise<PromptRecord> {
  const text = await file.text();

  const prompts: PromptRecord = {};

  if (file.name.split(".").pop()?.toLowerCase() === "json") {
    let scenarioFile: unknown;
    try {
      scenarioFile = JSON.parse(text);
    } catch {
      throw new Error("The selected JSON file is not valid JSON.");
    }

    if (!isRecord(scenarioFile) || !isRecord(scenarioFile["Scenarios-prompts"])) {
      throw new Error('The JSON file must contain a "Scenarios-prompts" object.');
    }

    const scenarios = scenarioFile["Scenarios-prompts"];
    for (const [scenario, scenarioPrompts] of Object.entries(scenarios)) {
      if (
        !Array.isArray(scenarioPrompts) ||
        !scenarioPrompts.every((prompt: unknown) => typeof prompt === "string")
      ) {
        throw new Error(`Prompts for "${scenario}" must be an array of strings.`);
      }

      scenarioPrompts.filter((prompt): prompt is string => typeof prompt === "string")
        .map((prompt) => prompt.trim())
        .filter(Boolean)
        .forEach((prompt) => {
          prompts[prompt] = "";
        });
    }

    return prompts;
  }

  if (file.name.split(".").pop()?.toLowerCase() !== "txt") {
    throw new Error("Choose a .txt or .json prompt file.");
  }

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      prompts[line] = "";
    });

  return prompts;
}