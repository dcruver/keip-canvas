import { createContext } from "react"
import { EipComponent } from "../../api/generated/eipComponentDef"

const EipComponentContext = createContext<EipComponent | null>(null)

export default EipComponentContext
