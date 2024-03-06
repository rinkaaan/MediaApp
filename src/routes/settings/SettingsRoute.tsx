import { Alert, Button, Container, ContentLayout, Form, FormField, Header, Input, SpaceBetween } from "@cloudscape-design/components"
import { mainActions, mainSelector, ping } from "../mainSlice"
import { appDispatch } from "../../common/store"
import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { OpenAPI } from "../../../openapi-client"
import { useSelector } from "react-redux"

export function Component() {
  const { isAuthenticated, asyncStatus } = useSelector(mainSelector)
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
    appDispatch(mainActions.resetSlice())
    appDispatch(mainActions.updateSlice({ isAuthenticated: false }))
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

  const AuthorizedAlert = (
    <Alert type="success">Authorized</Alert>
  )

  const AuthorizingAlert = (
    <Alert type="info">Authorizing</Alert>
  )

  let formButton
  if (isAuthenticated !== undefined) {
    formButton = isAuthenticated ? LogoutButton : LoginButton
  }

  return (
    <ContentLayout
      header={
        <Header variant="h1">Settings</Header>
      }
    >
      <Form actions={formButton}>
        <SpaceBetween size="l">
          <Container>
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
          </Container>
          {asyncStatus["ping"] === "rejected" && loginAttempted && UnauthorizedAlert}
          {asyncStatus["ping"] === "fulfilled" && AuthorizedAlert}
          {asyncStatus["ping"] === "pending" && AuthorizingAlert}
        </SpaceBetween>
      </Form>
    </ContentLayout>
  )
}
