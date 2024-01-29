import { Alert, Box, Button, FormField, Input, Modal, SpaceBetween } from "@cloudscape-design/components"
import { useSelector } from "react-redux"
import { addAlbum, albumActions, albumSelector } from "../albumSlice"
import store, { appDispatch } from "../../../common/store"
import { FormEvent, useEffect } from "react"

export default function NewAlbumModal() {
  const { errorMessages, newAlbumName, asyncStatus, newAlbumModalOpen } = useSelector(albumSelector)
  const loading = asyncStatus["addAlbum"] === "pending"

  useEffect(() => {
    if (asyncStatus["addAlbum"] === "fulfilled") {
      onClose()
    }
  }, [asyncStatus["addAlbum"]])

  function onClose() {
    appDispatch(albumActions.updateSlice({ newAlbumModalOpen: false }))
    appDispatch(albumActions.clearErrorMessages())
    appDispatch(albumActions.resetNewAlbumState())
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await onCreate()
  }

  async function onCreate() {
    if (!validate()) return
    await appDispatch(addAlbum())
  }

  function validate() {
    const { newAlbumName } = store.getState().album
    if (newAlbumName.trim().length === 0) {
      appDispatch(albumActions.addMissingErrorMessage("newAlbumName"))
      return false
    }
    return true
  }

  return (
    <Modal
      visible={newAlbumModalOpen}
      header="New Album"
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
            label="Album name"
            errorText={errorMessages["newAlbumName"]}
          >
            <Input
              value={newAlbumName}
              placeholder="Enter value"
              onChange={event => {
                appDispatch(albumActions.clearErrorMessages())
                appDispatch(albumActions.updateSlice({ newAlbumName: event.detail.value }))
              }}
            />
          </FormField>
        </form>
        {errorMessages["newAlbum"] && (
          <Alert type="error">
            {errorMessages["newAlbum"]}
          </Alert>
        )}
      </SpaceBetween>
    </Modal>
  )
}
