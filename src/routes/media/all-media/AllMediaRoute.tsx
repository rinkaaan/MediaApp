import { Alert, Box, Cards, Header, HelpPanel, SpaceBetween, Spinner, TextContent } from "@cloudscape-design/components"
import React, { Fragment, useEffect, useState } from "react"
import { uuid } from "../../../common/typedUtils"
import { useSelector } from "react-redux"
import { addMedia, deleteMedias, mediaActions, mediaSelector, queryMedia, queryMoreMedia } from "../mediaSlice"
import { appDispatch } from "../../../common/store"
import ConfirmModal from "../../../components/ConfirmModal"
import BadgeLink from "../../../components/BadgeLink"
import { mainActions, mainSelector } from "../../mainSlice"
import useScrollToBottom from "../../../hooks/useScrollToBottom"
import CloudButton from "../../../components/CloudButton"
import useWindowSize from "../../../hooks/useWindowSize"
import { Breakpoints } from "../../../common/constants"

// const items: Media[] = [
//   {
//     title: "Item 1",
//     // thumbnail_path: "https://picsum.photos/682/383",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//     albums: [{ name: "test album" }, { name: "test album 2" }]
//   },
//   {
//     title: "Item 2",
//     // thumbnail_path: "https://picsum.photos/682/384",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     title: "Item 3",
//     // thumbnail_path: "https://picsum.photos/683/385",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//     albums: [{ name: "test album" }]
//   },
//   {
//     title: "Item 4",
//     // thumbnail_path: "https://picsum.photos/683/386",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//     albums: [{ name: "test album" }, { name: "test album 2" }]
//   },
//   {
//     title: "Item 5",
//     // thumbnail_path: "https://picsum.photos/683/387",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     title: "Item 6",
//     // thumbnail_path: "https://picsum.photos/683/388",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//     albums: [{ name: "test album" }]
//   },
// ]

export function Component() {
  const { toolsOpen } = useSelector(mainSelector)
  const { asyncStatus, medias, selectedItems } = useSelector(mediaSelector)
  const { width } = useWindowSize()
  const isOnlyOneSelected = selectedItems.length === 1
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  function onRefresh() {
    appDispatch(queryMedia())
  }

  async function onCreate() {
    const text = await navigator.clipboard.readText()

    if (text.trim() !== "") {
      appDispatch(mediaActions.updateSlice({ newMediaUrl: text }))
      appDispatch(addMedia())
    } else {
      appDispatch(mainActions.addNotification({
        type: "error",
        content: "No URL found in clipboard",
      }))
    }
  }

  function onDelete() {
    const mediaIds = selectedItems.map((media) => media.id!)
    appDispatch(deleteMedias(mediaIds))
  }

  function onShowDelete() {
    if (width <= Breakpoints.xSmall) {
      appDispatch(mainActions.updateSlice({ toolsOpen: false }))
    }
    setDeleteModalVisible(true)
  }

  useScrollToBottom(() => {
    appDispatch(queryMoreMedia())
  }, asyncStatus["queryMedia"] === "pending" || asyncStatus["queryMoreMedia"] === "pending")

  useEffect(() => {
    const tools = (
      <HelpPanel header={<h2>Media Actions</h2>}>
        <SpaceBetween size="s" direction="horizontal">
          <CloudButton
            onClick={onRefresh}
            iconName="refresh"
            disabled={asyncStatus["queryMedia"] === "pending"}
          >
            Refresh
          </CloudButton>
          <CloudButton
            onClick={onCreate}
            iconName="add-plus"
            loading={asyncStatus["addMedia"] === "pending"}
          >
            Add media
          </CloudButton>
          <CloudButton
            disabled={selectedItems.length === 0}
            onClick={onShowDelete}
            iconName="remove"
          >
            Delete
          </CloudButton>
          <CloudButton
            disabled={!isOnlyOneSelected}
            iconName="edit"
          >
            Edit
          </CloudButton>
        </SpaceBetween>
      </HelpPanel>
    )
    appDispatch(mainActions.updateSlice({ tools, toolsHidden: false }))
  }, [asyncStatus["queryMedia"], asyncStatus["addMedia"], selectedItems])

  useEffect(() => {
    appDispatch(mediaActions.resetSlice())
    appDispatch(queryMedia())

    return () => {
      appDispatch(mainActions.updateSlice({ toolsHidden: true }))
      appDispatch(mediaActions.resetSlice())
    }
  }, [])

  useEffect(() => {
    if (asyncStatus["deleteMedias"] === "fulfilled") {
      setDeleteModalVisible(false)
    }
  }, [asyncStatus["deleteMedias"]])

  return (
    <Fragment>
      <Cards
        loading={asyncStatus["queryMedia"] === "pending" || medias === undefined}
        onSelectionChange={({ detail }) => {
          appDispatch(mediaActions.updateSlice({ selectedItems: detail?.selectedItems ?? [] }))
        }}
        selectedItems={selectedItems}
        ariaLabels={{
          itemSelectionLabel: (e, t) => `select ${t.title}`,
          selectionGroupLabel: "Item selection",
        }}
        cardDefinition={{
          header: (item) => {
            const links = item.albums?.map((album) => {
              let albumName = album.name!
              albumName = albumName.replace("uploader=", "")
              albumName = albumName.replace("website=", "")
              albumName = albumName.replace("media_type=", "")
              return (
                <BadgeLink
                  key={uuid()}
                  to="#"
                  className="pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    height: "min-content"
                  }}
                >
                  {albumName}
                </BadgeLink>
              )
            })

            links?.push(
              <BadgeLink
                key={uuid()}
                to={item.webpage_url!}
                className="pointer"
                onClick={(e) => {
                  e.stopPropagation()
                }}
                target="_blank"
                style={{
                  height: "min-content",
                  backgroundColor: "#276498",
                }}
              >
                Open
              </BadgeLink>
            )

            return (
              <SpaceBetween size="xs" direction="horizontal">
                {links}
              </SpaceBetween>
            )
          },
          sections: [
            {
              id: "image",
              content: item => (
                <img
                  src={item.thumbnail_path}
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                />
              ),
            }
          ],
        }}
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 1000, cards: 2 },
        ]}
        entireCardClickable
        items={medias || []}
        loadingText="Loading media"
        // selectionType="multi"
        // selectionType="multi"
        trackBy="id"
        variant="full-page"
        visibleSections={["albums", "image"]}
        stickyHeader={true}
        empty={
          <Box
            margin={{ vertical: "xs" }}
            textAlign="center"
            color="inherit"
          >
            <SpaceBetween size="m">
              <b>No media</b>
              {/*<CloudButton onClick={onCreate}>Add media</CloudButton>*/}
            </SpaceBetween>
          </Box>
        }
        header={
          <Header
            variant="awsui-h1-sticky"
            counter={
              medias?
                selectedItems?.length
                  ? `(${selectedItems.length}/${medias.length})`
                  : `(${medias.length})`
                : ""
            }
            actions={
              !toolsOpen && (
                <SpaceBetween
                  size="xs"
                  direction="horizontal"
                >
                  <CloudButton
                    onClick={onRefresh}
                    iconName="refresh"
                    disabled={asyncStatus["queryMedia"] === "pending"}
                  />
                  <CloudButton
                    variant="primary"
                    onClick={onCreate}
                    iconName="add-plus"
                    loading={asyncStatus["addMedia"] === "pending"}
                  />
                </SpaceBetween>
              )
            }
          >
            All Media
          </Header>
        }
      />
      {
        asyncStatus["queryMoreMedia"] === "pending" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: "0.5rem", color: "#5f6b7a" }}>
              <SpaceBetween
                size="xs"
                direction="horizontal"
                alignItems="center"
              >
                <Spinner size="normal" />
                <TextContent>
                  <p style={{ color: "#5f6b7a" }}>Loading media</p>
                </TextContent>
              </SpaceBetween>
            </div>
        )
      }
      <ConfirmModal
        confirmText="Delete"
        title="Delete media"
        onConfirm={onDelete}
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        loading={asyncStatus["deleteMedias"] === "pending"}
      >
        <Alert type="warning" statusIconAriaLabel="Warning">
          Are you sure you want to delete the {selectedItems.length} selected media?
        </Alert>
      </ConfirmModal>
    </Fragment>
  )
}
