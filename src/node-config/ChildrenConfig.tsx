import { Form, Stack, TextInput } from "@carbon/react"
import { EipChildren } from "../api/eipSchema"

const ChildrenConfigs = ({ eipChildren }: { eipChildren: EipChildren }) => {
  return (
    <Form title="Node configuration" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6}>
        {eipChildren.elements.map((child) => (
          <TextInput
            key={child.name}
            id={child.name}
            labelText={child.name}
            disabled
          />
        ))}
      </Stack>
    </Form>
  )
}

export default ChildrenConfigs
