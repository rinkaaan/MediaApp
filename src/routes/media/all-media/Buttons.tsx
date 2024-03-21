import CloudButton from "../../../components/CloudButton"
import React from "react"
import { appDispatch } from "../../../common/store"
import { addMedia, mediaSelector, queryMedia } from "../mediaSlice"
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

  let buttonText: string | null  = "Add media"
  let buttonClass: string | undefined = "add-media"

  if (downloadingMediaCount > 0) {
    buttonText = `Adding ${downloadingMediaCount}`
  }
  if (width <= Breakpoints.xSmall && !toolsOpen) {
    buttonText = null
    buttonClass = undefined
  }

  return (
    <div className={buttonClass}>
      <CloudButton
        onClick={onCreate}
        iconName="add-plus"
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
  const { width } = useWindowSize()

  function onRefresh() {
    appDispatch(queryMedia())
    if (window.innerWidth <= Breakpoints.xSmall) {
      appDispatch(mainActions.updateSlice({ toolsOpen: false }))
    }
  }

  let buttonText: string | null = "Refresh"

  if (width <= Breakpoints.xSmall && !toolsOpen) {
    buttonText = null
  }

  return (
    <CloudButton
      onClick={onRefresh}
      iconName="refresh"
      loading={asyncStatus["queryMedia"] === "pending"}
    >
      {buttonText}
    </CloudButton>
  )
}
