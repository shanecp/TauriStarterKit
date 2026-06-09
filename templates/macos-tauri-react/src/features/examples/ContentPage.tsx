import { useMemo, useState } from "react";

import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { StatusBadge } from "../../shared/components/StatusBadge";
import {
  codeLanguageOptions,
  highlightCode,
  type CodeLanguage,
} from "./codeHighlighting";

const codeSamples: Record<CodeLanguage, string> = {
  typescript: `type CommandState = {
  isLoading: boolean;
  error: string | null;
};

export function canRefresh(state: CommandState): boolean {
  return !state.isLoading;
}`,
  json: `{
  "app": "Example Utility",
  "pagination": 100,
  "theme": "system"
}`,
  bash: `npm run typecheck
npm run lint
npm test`,
};

export function ContentPage() {
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const highlightedCode = useMemo(
    () => highlightCode(codeSamples[language], language),
    [language],
  );

  return (
    <Card>
      <CardHeader
        title="Content"
        description="Syntax-highlighted code blocks."
        actions={<StatusBadge label={language} tone="neutral" />}
      />
      <CardBody>
        <div className="grid gap-4">
          <label className="grid max-w-xs gap-2 text-sm font-medium text-app-ink">
            Language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as CodeLanguage)}
              className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
            >
              {codeLanguageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <pre className="max-h-[520px] overflow-auto rounded-md bg-app-code p-4 text-sm leading-6 text-app-code-text">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        </div>
      </CardBody>
    </Card>
  );
}
