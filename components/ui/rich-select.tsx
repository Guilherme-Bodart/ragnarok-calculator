"use client";

import { ChevronDown, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const menuPositionKeys = [
  "left",
  "maxHeight",
  "position",
  "top",
  "bottom",
  "width",
] as const;

function hasSameMenuPosition(
  current: CSSProperties,
  next: CSSProperties,
) {
  return menuPositionKeys.every((key) => current[key] === next[key]);
}

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
  disabled?: boolean;
  fit?: "auto" | "fill";
  menuSize?: "default" | "compact";
  searchable?: boolean | "auto";
  searchValue?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onSearchChange?: (query: string) => void;
};

export function RichSelect({
  groups,
  value,
  onChange,
  className,
  disabled = false,
  fit = "fill",
  menuSize = "default",
  onSearchChange,
  searchable = "auto",
  searchValue,
  searchPlaceholder = "Filtrar",
  emptyText = "Nenhuma opção",
}: RichSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");
  const listboxId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const query = searchValue ?? internalQuery;
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
    "--rich-select-width": fit === "fill" ? "100%" : `${estimatedWidth}px`,
  } as CSSProperties;
  const isSearchable =
    searchable === "auto" ? options.length >= 10 : searchable;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleGroups = normalizedQuery && !onSearchChange
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

  const updateQuery = useCallback(
    (nextQuery: string) => {
      if (onSearchChange) {
        onSearchChange(nextQuery);
      } else {
        setInternalQuery(nextQuery);
      }
    },
    [onSearchChange],
  );

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
      const target = event.target as Node;

      if (root?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      updateQuery("");
      setIsOpen(false);
    }

    function handleOpen(event: Event) {
      if (event.target === root) {
        return;
      }

      updateQuery("");
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("ui-rich-select-open", handleOpen);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("ui-rich-select-open", handleOpen);
      elevatedPanel?.removeAttribute("data-overlay-open");
    };
  }, [isOpen, isSearchable, updateQuery]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updateMenuPosition() {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      const rect = root.getBoundingClientRect();
      const gap = 6;
      const viewportPadding = 12;
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const availableAbove = rect.top - viewportPadding;
      const shouldOpenAbove =
        availableBelow < 180 && availableAbove > availableBelow;
      const maxHeight = Math.max(
        160,
        Math.min(320, shouldOpenAbove ? availableAbove - gap : availableBelow - gap),
      );
      const width = Math.max(rect.width, 120);
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );

      const nextMenuStyle: CSSProperties = {
        left,
        maxHeight,
        position: "fixed",
        top: shouldOpenAbove ? undefined : rect.bottom + gap,
        bottom: shouldOpenAbove ? window.innerHeight - rect.top + gap : undefined,
        width,
      };

      setMenuStyle((current) =>
        hasSameMenuPosition(current, nextMenuStyle) ? current : nextMenuStyle,
      );
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  function selectOption(nextValue: string) {
    if (disabled) {
      return;
    }

    onChange(nextValue);
    updateQuery("");
    setIsOpen(false);
  }

  function toggleOpen() {
    if (disabled) {
      return;
    }

    if (isOpen) {
      updateQuery("");
      setIsOpen(false);
      return;
    }

    rootRef.current?.dispatchEvent(
      new CustomEvent("ui-rich-select-open", {
        bubbles: true,
      }),
    );
    setIsOpen(true);
  }

  return (
    <span
      className={cn("ui-rich-select", className)}
      data-open={isOpen}
      data-fit={fit}
      data-menu-size={menuSize}
      ref={rootRef}
      style={selectStyle}
    >
      <button
        type="button"
        aria-controls={listboxId}
        aria-disabled={disabled}
        aria-expanded={isOpen}
        className="ui-rich-select-trigger"
        data-has-icons={hasIcons}
        disabled={disabled}
        onClick={toggleOpen}
      >
        {selectedOption?.icon ? (
          <span className="ui-rich-select-icon">{selectedOption.icon}</span>
        ) : null}
        <span>{selectedOption?.label ?? value}</span>
        <span className="ui-rich-select-chevron">
          <ChevronDown aria-hidden size={16} className="text-slate-500 transition-transform" />
        </span>
      </button>

      {isOpen
        ? createPortal(
        <div
          className="ui-rich-select-menu"
          id={listboxId}
          ref={menuRef}
          role="listbox"
          style={menuStyle}
        >
          {isSearchable ? (
            <label className="ui-rich-select-search">
              <Search aria-hidden size={15} />
              <input
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                ref={searchRef}
                onChange={(event) => updateQuery(event.target.value)}
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
            <span className="ui-rich-select-empty">{emptyText}</span>
          )}
        </div>,
        document.body,
      )
        : null}
    </span>
  );
}
