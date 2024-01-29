import { Alert, Box, Cards, Header, SpaceBetween, Spinner, TextContent, TextFilter } from "@cloudscape-design/components"
import { Fragment, useEffect, useState } from "react"
import { Album } from "../../../../openapi-client"
import CloudLink from "../../../components/CloudLink"
import CloudButton from "../../../components/CloudButton"
import { appDispatch } from "../../../common/store"
import { albumActions, albumSelector, deleteAlbums, queryAlbums, queryMoreAlbums } from "../albumSlice"
import NewAlbumModal from "./NewAlbumModal"
import { useSelector } from "react-redux"
import useScrollToBottom from "../../../hooks/useScrollToBottom"
import ConfirmModal from "../../../components/ConfirmModal"

// const items: Album[] = [
//   {
//     name: "Item 1",
//     // thumbnail_path: "https://picsum.photos/682/383",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     name: "Item 2",
//     // thumbnail_path: "https://picsum.photos/682/384",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     name: "Item 3",
//     // thumbnail_path: "https://picsum.photos/683/385",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     name: "Item 4",
//     // thumbnail_path: "https://picsum.photos/683/386",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     name: "Item 5",
//     // thumbnail_path: "https://picsum.photos/683/387",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
//   {
//     name: "Item 6",
//     // thumbnail_path: "https://picsum.photos/683/388",
//     thumbnail_path: "https://dummyimage.com/600x400/000/fff",
//   },
// ]

export function Component() {
  const [
    selectedItems,
    setSelectedItems,
  ] = useState<Album[]>([])
  const { asyncStatus, albums, searchQuery } = useSelector(albumSelector)
  // const showLoader = useDelayedTrue()
  const isOnlyOneSelected = selectedItems.length === 1
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  useEffect(() => {
    if (albums === undefined) {
      appDispatch(queryAlbums())
    }
  }, [])

  useScrollToBottom(() => {
    appDispatch(queryMoreAlbums())
  }, asyncStatus["queryAlbums"] === "pending" || asyncStatus["queryMoreAlbums"] === "pending")

  function onDelete() {
    const albumIds = selectedItems.map(item => item.id!)
    appDispatch(deleteAlbums(albumIds))
  }

  useEffect(() => {
    if (asyncStatus["deleteAlbums"] === "fulfilled") {
      setDeleteModalVisible(false)
    }
  }, [asyncStatus["deleteAlbums"]])

  function onRefresh() {
    appDispatch(queryAlbums())
    setSelectedItems([])
  }

  function onSearch() {
    appDispatch(queryAlbums())
    setSelectedItems([])
  }

  function onCreate() {
    appDispatch(albumActions.updateSlice({ newAlbumModalOpen: true }))
  }

  return (
    <Fragment>
      <Cards
        // loading={showLoader && (asyncStatus["queryAlbums"] === "pending" || albums === undefined)}
        loading={asyncStatus["queryAlbums"] === "pending" || albums === undefined}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail?.selectedItems ?? [])
        }
        selectedItems={selectedItems}
        ariaLabels={{
          itemSelectionLabel: (e, t) => `select ${t.name}`,
          selectionGroupLabel: "Item selection",
        }}
        cardDefinition={{
          header: (item) => {
            return (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <CloudLink
                  href="#"
                  fontSize="heading-m"
                >
                  {
                    item.name!
                      .replace("uploader=", "")
                      .replace("website=", "")
                      .replace("media_type=", "")
                  }
                </CloudLink>
              </div>
            )
          },
          sections: [
            // {
            //   id: "type",
            //   header: "Type",
            //   content: item => item.type,
            // },
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
        items={albums || []}
        loadingText="Loading albums"
        selectionType="multi"
        trackBy="name"
        variant="full-page"
        visibleSections={["type", "image"]}
        stickyHeader={true}
        empty={
          <Box
            margin={{ vertical: "xs" }}
            textAlign="center"
            color="inherit"
          >
            <SpaceBetween size="m">
              <b>No albums</b>
              <CloudButton onClick={onCreate}>Create album</CloudButton>
            </SpaceBetween>
          </Box>
        }
        filter={
          <TextFilter
            filteringPlaceholder="Search albums"
            filteringText={searchQuery}
            onChange={event => appDispatch(albumActions.updateSlice({ searchQuery: event.detail.filteringText }))}
            onDelayedChange={onSearch}
          />
        }
        header={
          <Header
            variant="awsui-h1-sticky"
            counter={
              albums
                ? selectedItems?.length
                  ? `(${selectedItems.length}/${albums.length})`
                  : `(${albums.length})`
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
            Albums
          </Header>
        }
      />
      {
        asyncStatus["queryMoreAlbums"] === "pending" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: "0.5rem", color: "#5f6b7a" }}>
              <SpaceBetween
                size="xs"
                direction="horizontal"
                alignItems="center"
              >
                <Spinner size="normal" />
                <TextContent>
                  <p style={{ color: "#5f6b7a" }}>Loading albums</p>
                </TextContent>
              </SpaceBetween>
            </div>
        )
      }
      <NewAlbumModal />
      <ConfirmModal
        confirmText="Delete"
        title="Delete albums"
        onConfirm={onDelete}
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        loading={asyncStatus["deleteAlbums"] === "pending"}
      >
        <Alert type="warning" statusIconAriaLabel="Warning">
          Are you sure you want to delete the selected albums?
        </Alert>
      </ConfirmModal>
    </Fragment>
  )
}
