import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import { Callout } from "nextra/components";

const docsComponents = getDocsMDXComponents({ Callout });

export function useMDXComponents(components?: typeof docsComponents) {
  return {
    ...docsComponents,
    ...components,
  };
}
