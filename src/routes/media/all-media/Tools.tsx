import { HelpPanel, SpaceBetween } from "@cloudscape-design/components"
import React, { Fragment } from "react"
import { AddMediaButton, DeleteMediaButton, EditMediaButton, ListModeButton, RefreshButton } from "./Buttons"
import { useSelector } from "react-redux"
import { mediaSelector } from "../mediaSlice"

export default function Tools() {
  const { listMode } = useSelector(mediaSelector)

  return (
    <HelpPanel header={<h2>Media Actions</h2>}>
      <SpaceBetween size="s" direction="horizontal">
        {
          listMode === "view" && (
            <Fragment>
              <AddMediaButton />
              <RefreshButton />
            </Fragment>
          )
        }
        {
          listMode === "select" && (
            <Fragment>
              <DeleteMediaButton />
              <EditMediaButton />
            </Fragment>
          )
        }
        <ListModeButton />
      </SpaceBetween>
    </HelpPanel>
  )
}
