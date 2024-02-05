import { Alert, Box, Button, FormField, Input, Modal, SpaceBetween } from "@cloudscape-design/components"
import { useSelector } from "react-redux"
import store, { appDispatch } from "../../../common/store"
import { FormEvent, useEffect } from "react"
import { addMedia, mediaActions, mediaSelector } from "../mediaSlice"

export default function NewMediaModal() {
  const { errorMessages, newMediaUrl, asyncStatus, newMediaModalOpen } = useSelector(mediaSelector)
  const loading = asyncStatus["addMedia"] === "pending"

  useEffect(() => {
    if (asyncStatus["addMedia"] === "fulfilled") {
      onClose()
    }
  }, [asyncStatus["addMedia"]])

  function onClose() {
    appDispatch(mediaActions.clearErrorMessages())
    appDispatch(mediaActions.resetNewMediaState())
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await onCreate()
  }

  async function onCreate() {
    if (!validate()) return
    await appDispatch(addMedia())
  }

  function validate() {
    const { newMediaUrl } = store.getState().media
    if (newMediaUrl.trim().length === 0) {
      appDispatch(mediaActions.addMissingErrorMessage("newMediaUrl"))
      return false
    }
    return true
  }

  return (
    <Modal
      visible={newMediaModalOpen}
      header="New Media"
      closeAriaLabel="Close modal"
      onDismiss={onClose}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onCreate}
              loading={loading}
            >
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <form onSubmit={onSubmit}>
          <input
            hidden
            type="submit"
          />
          <FormField
            label="Media URL"
            errorText={errorMessages["newMediaUrl"]}
          >
            <Input
              value={newMediaUrl}
              placeholder="Enter value"
              onChange={event => {
                appDispatch(mediaActions.clearErrorMessages())
                appDispatch(mediaActions.updateSlice({ newMediaUrl: event.detail.value }))
              }}
            />
          </FormField>
        </form>
        {errorMessages["newMedia"] && (
          <Alert type="error">
            {errorMessages["newMedia"]}
          </Alert>
        )}
      </SpaceBetween>
    </Modal>
  )
}
