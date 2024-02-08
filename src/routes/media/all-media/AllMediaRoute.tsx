import { Alert, Box, Cards, Header, SpaceBetween } from "@cloudscape-design/components"
import { Fragment, useEffect, useState } from "react"
import { Media } from "../../../../openapi-client"
import { uuid } from "../../../common/typedUtils"
import CloudButton from "../../../components/CloudButton"
import { useSelector } from "react-redux"
import { mediaActions, mediaSelector, queryMedia } from "../mediaSlice"
import { appDispatch } from "../../../common/store"
import ConfirmModal from "../../../components/ConfirmModal"
import BadgeLink from "../../../components/BadgeLink"
import NewMediaModal from "./NewMediaModal"

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
  const [
    selectedItems,
    setSelectedItems,
  ] = useState<Media[]>([])
  const { asyncStatus, medias } = useSelector(mediaSelector)
  const isOnlyOneSelected = selectedItems.length === 1
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  useEffect(() => {
    if (medias === undefined) {
      appDispatch(queryMedia())
    }
  }, [])

  function onRefresh() {
    appDispatch(queryMedia())
    setSelectedItems([])
  }

  function onCreate() {
    appDispatch(mediaActions.updateSlice({ newMediaModalOpen: true }))
  }

  return (
    <Fragment>
      <Cards
        loading={asyncStatus["queryMedia"] === "pending" || medias === undefined}
        onSelectionChange={({ detail }) => {
          setSelectedItems(detail?.selectedItems ?? [])
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
        selectionType="multi"
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
              <CloudButton onClick={onCreate}>Add media</CloudButton>
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
              <SpaceBetween size="xs" direction="horizontal">
                <CloudButton
                    disabled={!isOnlyOneSelected}
                    iconName="edit"
                  />
                  <CloudButton
                    disabled={selectedItems.length === 0}
                    onClick={() => setDeleteModalVisible(true)}
                    iconName="remove"
                  />
                  <CloudButton
                    onClick={onRefresh}
                    iconName="refresh"
                    disabled={asyncStatus["queryAlbums"] === "pending"}
                  />
                  <CloudButton
                    variant="primary"
                    onClick={onCreate}
                    iconName="add-plus"
                  />
              </SpaceBetween>
            }
          >
            All Media
          </Header>
        }
      />
      <NewMediaModal />
      <ConfirmModal
        confirmText="Delete"
        title="Delete media"
        onConfirm={() => {}}
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        loading={asyncStatus["deleteMedias"] === "pending"}
      >
        <Alert type="warning" statusIconAriaLabel="Warning">
          Are you sure you want to delete the selected media?
        </Alert>
      </ConfirmModal>
    </Fragment>
  )
}
