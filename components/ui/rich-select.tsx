"use client";

import { ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type RichSelectOption = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export type RichSelectGroup = {
  label: string;
  options: RichSelectOption[];
};

type RichSelectProps = {
  groups: RichSelectGroup[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  menuSize?: "default" | "compact";
  searchable?: boolean | "auto";
  searchPlaceholder?: string;
};

export function RichSelect({
  groups,
  value,
  onChange,
  className,
  menuSize = "default",
  searchable = "auto",
  searchPlaceholder = "Filtrar",
}: RichSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const options = groups.flatMap((group) => group.options);
  const selectedOption =
    options.find((option) => option.id === value) ?? options[0];
  const hasIcons = options.some((option) => option.icon);
  const longestLabelLength = Math.max(
    1,
    ...options.map((option) => option.label.length),
  );
  const estimatedWidth = Math.min(
      250,
      Math.max(
        hasIcons ? 150 : 92,
      longestLabelLength * 7.2 + (hasIcons ? 112 : 64),
    ),
  );
  const selectStyle = {
    "--rich-select-width": `${estimatedWidth}px`,
  } as CSSProperties;
  const isSearchable =
    searchable === "auto" ? options.length >= 10 : searchable;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleGroups = normalizedQuery
    ? groups
        .map((group) => ({
          ...group,
          options: group.options.filter((option) =>
            `${option.label} ${option.id}`
              .toLowerCase()
              .includes(normalizedQuery),
          ),
        }))
        .filter((group) => group.options.length > 0)
    : groups;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const root = rootRef.current;
    const elevatedPanel = root?.closest<HTMLElement>(".calc-panel");

    elevatedPanel?.setAttribute("data-overlay-open", "true");
    if (isSearchable) {
      window.requestAnimationFrame(() => searchRef.current?.focus());
    }

    function handlePointerDown(event: PointerEvent) {
      if (root?.contains(event.target as Node)) {
        return;
      }

      setQuery("");
      setIsOpen(false);
    }

    function handleOpen(event: Event) {
      if (event.target === root) {
        return;
      }

      setQuery("");
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("ui-rich-select-open", handleOpen);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("ui-rich-select-open", handleOpen);
      elevatedPanel?.removeAttribute("data-overlay-open");
    };
  }, [isOpen, isSearchable]);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setQuery("");
    setIsOpen(false);
  }

  function toggleOpen() {
    setIsOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        rootRef.current?.dispatchEvent(
          new CustomEvent("ui-rich-select-open", {
            bubbles: true,
          }),
        );
      } else {
        setQuery("");
      }

      return nextOpen;
    });
  }

  return (
    <span
      className={cn("ui-rich-select", className)}
      data-open={isOpen}
      data-menu-size={menuSize}
      ref={rootRef}
      style={selectStyle}
    >
      <button
        type="button"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className="ui-rich-select-trigger"
        data-has-icons={hasIcons}
        onClick={toggleOpen}
      >
        {selectedOption?.icon ? (
          <span className="ui-rich-select-icon">{selectedOption.icon}</span>
        ) : null}
        <span>{selectedOption?.label ?? value}</span>
        <span className="ui-rich-select-chevron">
          <ChevronDown aria-hidden size={15} />
        </span>
      </button>

      {isOpen ? (
        <div className="ui-rich-select-menu" id={listboxId} role="listbox">
          {isSearchable ? (
            <label className="ui-rich-select-search">
              <Search aria-hidden size={15} />
              <input
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                ref={searchRef}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          ) : null}

          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <section key={group.label}>
                <strong>{group.label}</strong>
                {group.options.map((option) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.id === value}
                    className={option.id === value ? "active" : undefined}
                    data-has-icons={hasIcons}
                    key={option.id}
                    onClick={() => selectOption(option.id)}
                  >
                    {option.icon ? (
                      <span className="ui-rich-select-icon">{option.icon}</span>
                    ) : null}
                    <span>{option.label}</span>
                  </button>
                ))}
              </section>
            ))
          ) : (
            <span className="ui-rich-select-empty">Nenhuma opção</span>
          )}
        </div>
      ) : null}
    </span>
  );
}
