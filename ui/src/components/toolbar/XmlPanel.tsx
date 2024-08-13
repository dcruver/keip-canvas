import { InlineLoading } from "@carbon/react"
import hljs from "highlight.js/lib/core"
import xml from "highlight.js/lib/languages/xml"
import { useEffect, useState } from "react"
import Editor from "react-simple-code-editor"
import { EipFlow } from "../../api/generated/eipFlow"
import { useEipFlow } from "../../singletons/store"

// highlight.js theme
import "highlight.js/styles/intellij-light.css"

hljs.registerLanguage("xml", xml)

interface FlowTranslationResponse {
  data?: string
  error?: {
    message: string
    type: string
    details: object[]
  }
}

type InlineLoadingProps = React.ComponentProps<typeof InlineLoading>

const getLoadingStatus = (
  isLoading: boolean,
  isError: boolean
): InlineLoadingProps["status"] => {
  if (isLoading) {
    return "active"
  }
  return isError ? "error" : "finished"
}

// TODO: Add client-side caching (might make sense to use a data fetching library)
// TODO: Reduce debounce on attribute inputs to make updates a bit more snappy
// TODO: Should the fetch call be debounced?
const fetchXmlTranslation = async (flow: EipFlow) => {
  const queryStr = new URLSearchParams({ prettyPrint: "true" }).toString()
  const response = await fetch("http://localhost:8080?" + queryStr, {
    method: "POST",
    body: JSON.stringify(flow),
    headers: {
      "Content-Type": "application/json",
    },
  })

  const { data, error } = (await response.json()) as FlowTranslationResponse

  if (!response.ok) {
    throw new Error(
      `Failed to convert diagram to XML: ${JSON.stringify(error)}`
    )
  }

  return data!
}

const XmlPanel = () => {
  const [content, setContent] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [isError, setError] = useState(false)
  const eipFlow = useEipFlow()

  // TODO: Clean up the UseEffect fetch with an abort controller
  useEffect(() => {
    setLoading(true)
    setError(false)
    fetchXmlTranslation(eipFlow)
      .then((data) => setContent(data))
      .catch((err) => {
        setError(true)
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [eipFlow])

  return (
    <>
      <div className="xml-editor-container">
        <div className="xml-editor-loading-wrapper">
          <InlineLoading status={getLoadingStatus(isLoading, isError)} />
        </div>
        <Editor
          value={content}
          onValueChange={(code) => code}
          readOnly
          highlight={(code) => hljs.highlight(code, { language: "xml" }).value}
          padding={16}
        />
      </div>

      {/* TODO: Add a copy button */}
      {/* <div style={{ display: "flex", gap: "16px" }}>
        <CopyButton
          align="top"
          onClick={() => void navigator.clipboard.writeText(content)}
        />
      </div> */}
    </>
  )
}

export default XmlPanel
