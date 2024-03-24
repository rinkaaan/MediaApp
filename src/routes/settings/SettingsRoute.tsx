import { Alert, Button, Container, ContentLayout, FileUpload, Form, FormField, Header, Input, SpaceBetween } from "@cloudscape-design/components"
import { mainActions, mainSelector, ping, updateCookies } from "../mainSlice"
import { appDispatch } from "../../common/store"
import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { OpenAPI } from "../../../openapi-client"
import { useSelector } from "react-redux"

export function Component() {
  const { isAuthenticated, asyncStatus, newCookies } = useSelector(mainSelector)
  const [username, setUsername] = useState(Cookies.get("username") || "")
  const [password, setPassword] = useState(Cookies.get("password") || "")
  const [saved, setSaved] = useState(true)
  const [loginAttempted, setLoginAttempted] = useState(false)

  function saveCredentials() {
    appDispatch(mainActions.updateSlice({ username, password }))
    Cookies.set("username", username, { expires: 365 })
    Cookies.set("password", password, { expires: 365 })
    OpenAPI.USERNAME = username
    OpenAPI.PASSWORD = password
    setSaved(true)
    appDispatch(ping())
    setLoginAttempted(true)
  }

  function logout() {
    Cookies.remove("username")
    Cookies.remove("password")
    appDispatch(mainActions.updateSlice({ isAuthenticated: false, username: "", password: "", asyncStatus: { ping: "rejected" } }))
    OpenAPI.USERNAME = ""
    OpenAPI.PASSWORD = ""
    setLoginAttempted(false)
    setUsername("")
    setPassword("")
  }

  useEffect(() => {
    if (username === "" && password === "") return
    setSaved(false)
  }, [username, password])

  const LoginButton = (
    <Button
      variant="primary"
      onClick={saveCredentials}
      disabled={asyncStatus["ping"] === "pending"}
    >{isAuthenticated ? "Logout" : "Login"}</Button>
  )

  const LogoutButton = (
    <Button
      variant="primary"
      onClick={logout}
      disabled={!isAuthenticated && saved}
    >{"Logout"}</Button>
  )

  const UnauthorizedAlert = (
    <Alert type="error">Unauthorized</Alert>
  )

  const AuthorizingAlert = (
    <Alert type="info">Authorizing</Alert>
  )

  let formButton
  if (isAuthenticated !== undefined) {
    formButton = isAuthenticated ? LogoutButton : LoginButton
  }

  function onUpdateCookies() {
    appDispatch(updateCookies())
  }

  return (
    <ContentLayout
      header={
        <Header variant="h1">Settings</Header>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Credentials</Header>}>
            <SpaceBetween size="l">
              <form>
                <SpaceBetween size="s">
                  <FormField label="Username">
                    <Input
                      placeholder="Enter value"
                      value={username}
                      onChange={(e) => setUsername(e.detail.value)}
                      disabled={isAuthenticated || isAuthenticated === undefined}
                    />
                  </FormField>
                  <FormField label="Password">
                    <Input
                      placeholder="Enter value"
                      value={password}
                      onChange={(e) => setPassword(e.detail.value)}
                      disabled={isAuthenticated || isAuthenticated === undefined}
                      type="password"
                    />
                  </FormField>
                </SpaceBetween>
              </form>
              {asyncStatus["ping"] === "rejected" && loginAttempted && UnauthorizedAlert}
              {asyncStatus["ping"] === "pending" && loginAttempted && AuthorizingAlert}
              {formButton}
            </SpaceBetween>
          </Container>
          {
            isAuthenticated && (
              <Container header={<Header variant="h2">Cookies</Header>}>
                <SpaceBetween size="l">
                  <FileUpload
                    onChange={({ detail }) => appDispatch(mainActions.updateSlice({ newCookies: detail.value })) }
                    value={newCookies}
                    i18nStrings={{
                      uploadButtonText: e =>
                        e ? "Choose files" : "Choose file",
                      dropzoneText: e =>
                        e
                          ? "Drop files to upload"
                          : "Drop file to upload",
                      removeFileAriaLabel: e =>
                        `Remove file ${e + 1}`,
                      limitShowFewer: "Show fewer files",
                      limitShowMore: "Show more files",
                      errorIconAriaLabel: "Error"
                    }}
                    accept=".txt"
                    showFileSize
                    tokenLimit={1}
                    constraintText="Upload a .txt file to update cookies"
                  />
                  <Button
                    variant="primary"
                    disabled={newCookies.length === 0}
                    onClick={onUpdateCookies}
                    loading={asyncStatus["updateCookies"] === "pending"}
                  >Update</Button>
                </SpaceBetween>
              </Container>
            )
          }
        </SpaceBetween>
      </Form>
    </ContentLayout>
  )
}
