import CloudButton from "../../../components/CloudButton"
import React from "react"
import { appDispatch } from "../../../common/store"
import { addMedia, mediaActions, mediaSelector, queryMedia } from "../mediaSlice"
import { mainActions, mainSelector } from "../../mainSlice"
import { useSelector } from "react-redux"
import { Breakpoints } from "../../../common/constants"
import useWindowSize from "../../../hooks/useWindowSize"

export function AddMediaButton() {
  const { toolsOpen } = useSelector(mainSelector)
  const { downloadingMediaCount } = useSelector(mediaSelector)
  const { width } = useWindowSize()

  async function onCreate() {
    const text = await navigator.clipboard.readText()

    if (text.trim() !== "") {
      appDispatch(addMedia(text))
    } else {
      appDispatch(mainActions.addNotification({
        type: "error",
        content: "No URL found in clipboard",
      }))
    }
  }

  let buttonText: any  = "Add media"
  let buttonClass: string | undefined = "add-media"
  let buttonIcon: any = "add-plus"

  if (downloadingMediaCount > 0) {
    buttonText = `Adding ${downloadingMediaCount}`
    buttonIcon = undefined
  }
  if (width <= Breakpoints.small && !toolsOpen) {
    buttonText = null
    buttonClass = undefined
    if (downloadingMediaCount > 0) {
      buttonText = downloadingMediaCount
    }
  }

  return (
    <div className={buttonClass}>
      <CloudButton
        onClick={onCreate}
        iconName={buttonIcon}
        variant={toolsOpen ? undefined : "primary"}
      >
        {buttonText}
      </CloudButton>
    </div>
  )
}

export function RefreshButton() {
  const { toolsOpen } = useSelector(mainSelector)
  const { asyncStatus } = useSelector(mediaSelector)

  function onRefresh() {
    appDispatch(queryMedia())
    if (window.innerWidth <= Breakpoints.xSmall) {
      appDispatch(mainActions.updateSlice({ toolsOpen: false }))
    }
  }

  let buttonText: string | null = null
  let buttonIcon: any = "refresh"

  if (toolsOpen) {
    buttonText = "Refresh"
    buttonIcon = "refresh"
  }

  return (
    <CloudButton
      onClick={onRefresh}
      iconName={buttonIcon}
      disabled={asyncStatus["queryMedia"] === "pending"}
    >
      {buttonText}
    </CloudButton>
  )
}

export function ListModeButton() {
  const { toolsOpen } = useSelector(mainSelector)
  const { listMode } = useSelector(mediaSelector)

  let buttonText: string | null = null
  let buttonIcon: any = "drag-indicator"

  if (toolsOpen) {
    buttonText = "Select"
    buttonIcon = "drag-indicator"
  }
  if (listMode === "select") {
    buttonText = "Done"
    buttonIcon = null
  }

  function onClick() {
    appDispatch(mediaActions.toggleListMode())
    if (window.innerWidth <= Breakpoints.xSmall) {
      appDispatch(mainActions.updateSlice({ toolsOpen: false }))
    }
  }

  return (
    <CloudButton
      iconName={buttonIcon}
      onClick={onClick}
    >
      {buttonText}
    </CloudButton>
  )
}

export function DeleteMediaButton() {
  const { selectedItems } = useSelector(mediaSelector)
  const { toolsOpen } = useSelector(mainSelector)
  const { width } = useWindowSize()

  function onShowDelete() {
    if (width <= Breakpoints.xSmall) {
      appDispatch(mainActions.updateSlice({ toolsOpen: false }))
    }
    appDispatch(mediaActions.updateSlice({ deleteMediaModalVisible: true }))
  }

  let buttonText: string | null = "Delete"
  let buttonIcon: any = undefined

  if (width <= Breakpoints.small && !toolsOpen) {
    buttonText = null
    buttonIcon = "remove"
  }

  return (
    <CloudButton
      disabled={selectedItems.length === 0}
      onClick={onShowDelete}
      iconName={buttonIcon}
    >
      {buttonText}
    </CloudButton>
  )
}

export function EditMediaButton() {
  const { selectedItems } = useSelector(mediaSelector)
  const { toolsOpen } = useSelector(mainSelector)
  const { width } = useWindowSize()
  // const isOnlyOneSelected = selectedItems.length === 1

  let buttonText: string | null = "Edit"
  let buttonIcon: any = undefined

  if (width <= Breakpoints.small && !toolsOpen) {
    buttonText = null
    buttonIcon = "edit"
  }

  return (
    <CloudButton
      // disabled={!isOnlyOneSelected}
      disabled={selectedItems.length === 0}
      iconName={buttonIcon}
    >
      {buttonText}
    </CloudButton>
  )
}
