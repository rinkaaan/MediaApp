import { Alert, Box, Cards, Header, SpaceBetween, Spinner, TextContent } from "@cloudscape-design/components"
import React, { Fragment, useEffect } from "react"
import { uuid } from "../../../common/typedUtils"
import { useSelector } from "react-redux"
import { deleteMedias, mediaActions, mediaSelector, queryMedia, queryMoreMedia } from "../mediaSlice"
import { appDispatch } from "../../../common/store"
import ConfirmModal from "../../../components/ConfirmModal"
import BadgeLink from "../../../components/BadgeLink"
import { mainActions, mainSelector } from "../../mainSlice"
import useScrollToBottom from "../../../hooks/useScrollToBottom"
import "./style.css"
import { AddMediaButton, DeleteMediaButton, EditMediaButton, ListModeButton, RefreshButton } from "./Buttons"
import Tools from "./Tools"

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
  const { asyncStatus, medias, selectedItems, listMode, deleteMediaModalVisible } = useSelector(mediaSelector)

  function onDelete() {
    const mediaIds = selectedItems.map((media) => media.id!)
    appDispatch(deleteMedias(mediaIds))
  }

  useScrollToBottom(() => {
    appDispatch(queryMoreMedia())
  }, asyncStatus["queryMedia"] === "pending" || asyncStatus["queryMoreMedia"] === "pending")

  useEffect(() => {
    appDispatch(mainActions.updateSlice({ tools: <Tools />, toolsHidden: false }))
    return () => {
      appDispatch(mainActions.updateSlice({ toolsHidden: true }))
    }
  }, [])

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
      appDispatch(mediaActions.updateSlice({ deleteMediaModalVisible: false }))
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
        selectionType={listMode === "select" ? "multi" : undefined}
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
                  {
                    listMode === "select" && (
                      <Fragment>
                        <DeleteMediaButton />
                        <EditMediaButton />
                      </Fragment>
                    )
                  }
                  <ListModeButton />
                  {
                    listMode === "view" && (
                      <Fragment>
                        <RefreshButton />
                        <AddMediaButton />
                      </Fragment>
                    )
                  }
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
        visible={deleteMediaModalVisible}
        onClose={() => appDispatch(mediaActions.updateSlice({ deleteMediaModalVisible: false }))}
        loading={asyncStatus["deleteMedias"] === "pending"}
      >
        <Alert type="warning" statusIconAriaLabel="Warning">
          Are you sure you want to delete the {selectedItems.length} selected media?
        </Alert>
      </ConfirmModal>
    </Fragment>
  )
}
