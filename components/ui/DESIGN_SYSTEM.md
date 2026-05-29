# Nightmare UI Base

Use `components/ui` before creating page-specific controls. The home page is the visual baseline for the product: glass panels, cyan borders, rune-style compact controls, and clear icon-led actions.

## Rules

- Prefer shared UI components for repeated primitives: buttons, icon buttons, panels, fields, selects, tabs, and panel headers.
- Page CSS may control layout, density, grid areas, and domain-specific composition, but should not redefine control anatomy.
- Keep controls at `8px` radius unless using a navigation pill/menu pattern.
- Use lucide icons for icon buttons and command-like actions.
- Use `ui-*` classes for shared component styling in `app/globals.css`.
- Add a new primitive only when the same pattern appears in at least two places or is clearly part of the shared product language.

## Current Primitives

- `Button`: primary/secondary/ghost/danger action. Can render as `<a>` when `href` is passed or as `<button>` otherwise.
- `IconButton`: square icon-only action with required accessible `label`.
- `Select`: native select wrapped with Nightmare styling. Supports `option` and `optgroup`.
- `RichSelect`: custom listbox select for cases that need option media/icons. Keep it generic and reusable; use native `Select` when text-only options are enough.
- `Field` / `Input`: shared label and input anatomy for forms.
- `FieldValue`: read-only value styled like a form control.
- `NumberSelect`: numeric select built on the shared `Select`.
- `SectionHeading`: editorial section heading with ornament, title, and copy.
- `Panel`: shared visual panel. Use `glass` for cards and `holo` for highlighted panels.
- `PanelHeader`: compact header for operational panels.
- `Tabs` / `TabButton`: toolbar or segmented tab navigation.
- `FeaturePill`: compact rounded label for feature lists and tags.

## Examples

### Button

```tsx
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

<Button icon={<Sparkles size={16} />} type="button">
  Save build
</Button>

<Button href="/calculator" variant="secondary">
  Calculator
</Button>
```

### Icon Button

```tsx
import { IconButton } from "@/components/ui/icon-button";
import { X } from "lucide-react";

<IconButton label="Close" onClick={closeModal} type="button">
  <X size={18} />
</IconButton>
```

### Field And Input

```tsx
import { Field, FieldValue, Input } from "@/components/ui/field";

<Field label="STR">
  <Input min={1} max={130} type="number" value={str} onChange={updateStr} />
</Field>

<Field label="Class">
  <FieldValue title={classId}>{className}</FieldValue>
</Field>
```

### Select

```tsx
import { Select } from "@/components/ui/select";

<Select value={jobId} onChange={(event) => setJobId(event.target.value)}>
  <optgroup label="Mage">
    <option value="Mage">Mage</option>
    <option value="Wizard">Wizard</option>
  </optgroup>
</Select>
```

For class trees, order options by progression, not alphabetically.

### Rich Select

```tsx
import { RichSelect } from "@/components/ui/rich-select";

<RichSelect
  value={jobId}
  onChange={setJobId}
  searchable
  searchPlaceholder="Filtrar classe"
  groups={[
    {
      label: "Mage",
      options: [{ id: "Arch_Mage", label: "Arch Mage", icon: <img alt="" src="/..." /> }],
    },
  ]}
/>
```

Use this only when the option needs imagery, a richer label, or searchable filtering for long lists. Search is automatic for lists with 10+ options; pass `searchable={false}` for short menus that must never show search or `searchable` to force it on. The typed search filters options only; selection still happens through an explicit option click.

### Number Select

```tsx
import { NumberSelect } from "@/components/ui/number-select";

<NumberSelect value={baseLevel} max={275} prefix="Base" onChange={setBaseLevel} />
```

### Panel

```tsx
import { Panel } from "@/components/ui/panel";
import { PanelHeader } from "@/components/ui/panel-header";

<Panel as="section">
  <PanelHeader title="Equipment" meta="10 slots" />
  ...
</Panel>
```

### Tabs

```tsx
import { TabButton, Tabs } from "@/components/ui/tabs";

<Tabs label="Equipment tabs" variant="segmented">
  <TabButton active={tab === "equip"} onClick={() => setTab("equip")}>
    Equip
  </TabButton>
  <TabButton active={tab === "special"} onClick={() => setTab("special")}>
    Special
  </TabButton>
</Tabs>
```

## Landing As Source

The home page provides the product look:

- `night-button` for strong CTAs.
- `glass-card` for repeated feature cards.
- `section-title`, `section-copy`, and `ornament` for editorial sections.
- `ui-feature-pill` for compact feature tags.

When moving other pages toward the system, reuse those components first and add variants only when the page has a real workflow need.

## New Screen Checklist

- [ ] Main surfaces use `Panel` or an existing page shell.
- [ ] Repeated card headers use `PanelHeader`.
- [ ] Actions use `Button` or `IconButton`.
- [ ] Forms use `Field`, `Input`, and `Select`.
- [ ] Tabs use `Tabs` and `TabButton`.
- [ ] Feature tags use `FeaturePill`.
- [ ] CSS local is limited to layout, sizing, responsive behavior, and domain-specific composition.
- [ ] No local reimplementation of select, input, button, or tab anatomy.

## Migration Notes

- Keep old page classes only when they express layout or domain semantics.
- Delete CSS once no component references the class.
- Prefer small migrations by feature area: landing, guild, calculator, then remaining auth/profile details.
