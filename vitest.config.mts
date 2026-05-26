const vitestConfig = {
  test: {
    include: ["api/src/**/*.spec.ts", "packages/calculator-core/src/**/*.spec.ts"],
    exclude: ["**/node_modules/**", "api/dist/**"],
  },
};

export default vitestConfig;
