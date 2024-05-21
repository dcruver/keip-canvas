import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/eipSchema.graphql",
  generates: {
    "./graphql/generated/eipSchema.d.ts": {
      plugins: ["typescript"],
      config: {
        enumsAsTypes: true,
        skipTypename: true,
        declarationKind: "interface",
      },
    },
  },
}

export default config
