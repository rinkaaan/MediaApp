import { Button, Container, ContentLayout, Form, FormField, Header, Input, SpaceBetween } from "@cloudscape-design/components"
import { mainActions } from "../mainSlice"
import { appDispatch } from "../../common/store"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { OpenAPI } from "../../../openapi-client"

export function Component() {
  const [username, setUsername] = useState(Cookies.get("username") || "")
  const [password, setPassword] = useState(Cookies.get("password") || "")
  const [saved, setSaved] = useState(true)

  function saveCredentials() {
    appDispatch(mainActions.updateSlice({ username, password }))
    Cookies.set("username", username, { expires: 365 })
    Cookies.set("password", password, { expires: 365 })
    OpenAPI.USERNAME = username
    OpenAPI.PASSWORD = password
    setSaved(true)
  }

  useEffect(() => {
    setSaved(false)
  }, [username, password])

  return (
    <ContentLayout
      header={
        <Header variant="h1">Settings</Header>
      }
    >
      <SpaceBetween size="l">
        <Form actions={
          <Button
            variant="primary"
            onClick={saveCredentials}
            disabled={saved}
          >Save</Button>
        }>
          <Container header={<Header variant="h2">Set credentials</Header>}>
            <SpaceBetween size="s">
              <FormField label="Username">
                <Input placeholder="Enter value" value={username} onChange={(e) => setUsername(e.detail.value)} />
              </FormField>
              <FormField label="Password">
                <Input placeholder="Enter value" value={password} onChange={(e) => setPassword(e.detail.value)} />
              </FormField>
            </SpaceBetween>
          </Container>
        </Form>
      </SpaceBetween>
    </ContentLayout>
  )
}
