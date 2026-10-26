const PROMPT_EXTENSIONS = new Set(["txt", "json"]);

function promptFileChecker(fileName: string): boolean {
  try {
    if (!fileName) {
      throw new Error("Filename cannot be empty");
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return false;
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return PROMPT_EXTENSIONS.has(extension);
}

export default promptFileChecker;