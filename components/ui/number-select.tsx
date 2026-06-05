import { RichSelect } from "./rich-select";

type NumberSelectProps = {
  disabled?: boolean;
  fit?: "auto" | "fill";
  max: number;
  min?: number;
  prefix?: string;
  value: number;
  onChange: (value: number) => void;
};

export function NumberSelect({
  disabled,
  fit,
  max,
  min = 1,
  prefix,
  value,
  onChange,
}: NumberSelectProps) {
  return (
    <RichSelect
      groups={[
        {
          label: prefix ?? "Valor",
          options: Array.from(
            { length: Math.max(0, max - min + 1) },
            (_, index) => {
              const optionValue = min + index;

              return {
                id: String(optionValue),
                label: prefix ? `${prefix} ${optionValue}` : String(optionValue),
              };
            },
          ),
        },
    ]}
      disabled={disabled}
      fit={fit}
      searchPlaceholder="Filtrar"
      value={String(value)}
      onChange={(nextValue) => onChange(Number(nextValue))}
    />
  );
}
