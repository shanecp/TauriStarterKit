import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";

export type CodeLanguage = "bash" | "json" | "typescript";

export const codeLanguageOptions: CodeLanguage[] = ["typescript", "json", "bash"];

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);

export function highlightCode(source: string, language: CodeLanguage): string {
  return hljs.highlight(source, {
    language,
    ignoreIllegals: true,
  }).value;
}
