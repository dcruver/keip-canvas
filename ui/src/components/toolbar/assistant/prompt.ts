import { PromptTemplate } from "@langchain/core/prompts"

const flowCreatePrompt = PromptTemplate.fromTemplate(`{userInput}`)

const flowUpdatePrompt = PromptTemplate.fromTemplate(
  `Use this existing flow JSON as the starting point:
  \`\`\`json
  {existingFlowJson}
  \`\`\`

  {userInput}
  `
)

export { flowCreatePrompt, flowUpdatePrompt }
