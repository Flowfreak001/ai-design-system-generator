"use client";

// Two Puck configs — used as two editor modes. Wireframe = controlled, low-fi,
// approved section components only. Design = real styled components using the
// Style Guide theme. Both are section-based (Puck's vertical drop zone), so
// sections always stack header→footer and can't overlap.

import { createContext, useContext } from "react";
import type { Config } from "@measured/puck";
import { SectionWireframe } from "../wireframe-block";
import { RenderSection } from "@/components/sections/registry";
import { DEFAULT_THEME, type SectionTheme } from "@/components/sections/theme";
import {
  KIND_LABEL, WIREFRAME_TYPE, DESIGN_TYPE, WIREFRAME_COMPONENT_KINDS, DESIGN_COMPONENT_KINDS,
} from "@/lib/puck-canvas";

export const DesignThemeContext = createContext<SectionTheme>(DEFAULT_THEME);

const SHARED_FIELDS = {
  name: { type: "text" as const, label: "Section name" },
  note: { type: "textarea" as const, label: "Purpose / copy direction" },
  variant: {
    type: "select" as const,
    label: "Layout variant",
    options: [
      { label: "Default", value: "default" }, { label: "Centered", value: "centered" },
      { label: "Split", value: "split" }, { label: "Grid", value: "grid" }, { label: "Minimal", value: "minimal" },
    ],
  },
  source: {
    type: "select" as const,
    label: "Source",
    options: [
      { label: "detected", value: "detected" }, { label: "reference-inspired", value: "reference-inspired" },
      { label: "AI-suggested", value: "AI-suggested" }, { label: "user-added", value: "user-added" },
      { label: "extracted", value: "extracted" }, { label: "vision-detected", value: "vision-detected" }, { label: "assumed", value: "assumed" },
    ],
  },
  status: {
    type: "radio" as const,
    label: "Status",
    options: [
      { label: "Draft", value: "draft" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" },
    ],
  },
};

// ---- Wireframe config (low-fidelity) --------------------------------------
const wireframeComponents: Config["components"] = {};
for (const kind of WIREFRAME_COMPONENT_KINDS) {
  const label = KIND_LABEL[kind];
  wireframeComponents[WIREFRAME_TYPE[kind]] = {
    label,
    fields: SHARED_FIELDS,
    defaultProps: { kind, name: label, note: "", source: "user-added", status: "draft", variant: "default" },
    // Fixed kind → fixed low-fi block; the `name` field is editable metadata.
    render: () => (
      <div className="w-full border-b border-line last:border-b-0">
        <SectionWireframe name={label} />
      </div>
    ),
  };
}
export const wireframeConfig: Config = {
  root: { render: ({ children }: { children?: React.ReactNode }) => <div className="mx-auto w-full max-w-3xl bg-surface">{children}</div> },
  components: wireframeComponents,
  categories: { sections: { title: "Wireframe sections", components: WIREFRAME_COMPONENT_KINDS.map((k) => WIREFRAME_TYPE[k]) } },
};

// ---- Design config (real styled) ------------------------------------------
function DesignRender({ label, note }: { label: string; note?: string }) {
  const theme = useContext(DesignThemeContext);
  return <RenderSection name={label} note={note} theme={theme} />;
}

const designComponents: Config["components"] = {};
for (const kind of DESIGN_COMPONENT_KINDS) {
  const label = KIND_LABEL[kind];
  designComponents[DESIGN_TYPE[kind]] = {
    label,
    fields: SHARED_FIELDS,
    defaultProps: { kind, name: label, note: "", source: "user-added", status: "draft", variant: "default" },
    render: (props) => <DesignRender label={label} note={props.note as string | undefined} />,
  };
}
export const designConfig: Config = {
  root: { render: ({ children }: { children?: React.ReactNode }) => <div className="mx-auto w-full max-w-5xl bg-surface">{children}</div> },
  components: designComponents,
  categories: { sections: { title: "Design sections", components: DESIGN_COMPONENT_KINDS.map((k) => DESIGN_TYPE[k]) } },
};
