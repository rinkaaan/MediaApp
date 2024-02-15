import { Alert, Box, Button, FormField, Input, Modal, SpaceBetween } from "@cloudscape-design/components"
import { useSelector } from "react-redux"
import { renameAlbum, albumActions, albumSelector, queryAlbums } from "../albumSlice"
import store, { appDispatch } from "../../../common/store"
import { FormEvent, useEffect } from "react"

export default function RenameAlbumModal() {
  const { errorMessages, renameAlbumName, asyncStatus, renameAlbumModalOpen } = useSelector(albumSelector)
  const loading = asyncStatus["renameAlbum"] === "pending"

  useEffect(() => {
    if (asyncStatus["renameAlbum"] === "fulfilled") {
      appDispatch(albumActions.resetSlice())
      appDispatch(queryAlbums())
    }
  }, [asyncStatus["renameAlbum"]])

  function onClose() {
    appDispatch(albumActions.resetRenameAlbumState())
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await onRename()
  }

  async function onRename() {
    if (!validate()) return
    await appDispatch(renameAlbum())
  }

  function validate() {
    const { renameAlbumName } = store.getState().album
    if (renameAlbumName.trim().length === 0) {
      appDispatch(albumActions.addMissingErrorMessage("renameAlbumName"))
      return false
    }
    return true
  }

  return (
    <Modal
      visible={renameAlbumModalOpen}
      header="Rename Album"
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
              onClick={onRename}
              loading={loading}
            >
              Rename
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
            errorText={errorMessages["renameAlbumName"]}
          >
            <Input
              value={renameAlbumName}
              placeholder="Enter value"
              onChange={event => {
                appDispatch(albumActions.clearErrorMessages())
                appDispatch(albumActions.updateSlice({ renameAlbumName: event.detail.value }))
              }}
            />
          </FormField>
        </form>
        {errorMessages["renameAlbum"] && (
          <Alert type="error">
            {errorMessages["renameAlbum"]}
          </Alert>
        )}
      </SpaceBetween>
    </Modal>
  )
}
