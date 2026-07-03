import dynamic from "next/dynamic";

const CalculatorWorkbench = dynamic(
  () => import("@/components/calculator/calculator-workbench").then((mod) => mod.CalculatorWorkbench),
  { ssr: false }
);

export default function CalculatorPage() {
  return <CalculatorWorkbench />;
}
