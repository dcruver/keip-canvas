import { PipelinePromptTemplate, PromptTemplate } from "@langchain/core/prompts"

const existingFlowPrompt = PromptTemplate.fromTemplate(
  `Use this existing flow JSON as the starting point:
\`\`\`json
{existingFlowJson}
\`\`\``
)

const inputPrompt = PromptTemplate.fromTemplate(`{userInput}`)

const createPipeline = [{ name: "input", prompt: inputPrompt }]

const updatePipeline = [
  ...createPipeline.slice(0, createPipeline.length - 1),
  { name: "existingFlow", prompt: existingFlowPrompt },
  createPipeline[createPipeline.length - 1],
]

const fullCreatePrompt = PromptTemplate.fromTemplate(`{input}`)

const fullUpdatePrompt = PromptTemplate.fromTemplate(
  `{existingFlow}

{input}`
)

const flowCreatePrompt = new PipelinePromptTemplate({
  pipelinePrompts: createPipeline,
  finalPrompt: fullCreatePrompt,
}).partial({})

const flowUpdatePrompt = new PipelinePromptTemplate({
  pipelinePrompts: updatePipeline,
  finalPrompt: fullUpdatePrompt,
}).partial({})

export { flowCreatePrompt, flowUpdatePrompt }
