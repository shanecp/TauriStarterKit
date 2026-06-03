import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders an accessible loading state", () => {
    const markup = renderToStaticMarkup(
      <Button loading loadingLabel="Saving settings">
        Save
      </Button>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("animate-spin");
    expect(markup).toContain("Saving settings");
  });
});
