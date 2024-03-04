import { Alert, Box, Cards, CardsProps, Header, Icon, NonCancelableCustomEvent, SpaceBetween, Spinner, TextContent, TextFilter, TextFilterProps } from "@cloudscape-design/components"
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
import RenameAlbumModal from "./RenameAlbumModal"
import "./style.css"
import { mainActions } from "../../mainSlice"
import { scrollToTop } from "../../../common/typedUtils"

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
  const { asyncStatus, albums, searchQuery, actionsMode, selectedAlbums } = useSelector(albumSelector)
  // const showLoader = useDelayedTrue()
  const isOnlyOneSelected = selectedAlbums.length === 1
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  useScrollToBottom(() => {
    appDispatch(queryMoreAlbums())
  }, asyncStatus["queryAlbums"] === "pending" || asyncStatus["queryMoreAlbums"] === "pending")

  useEffect(() => {
    appDispatch(albumActions.resetSlice())
    appDispatch(queryAlbums())
  }, [])

  useEffect(() => {
    if (asyncStatus["deleteAlbums"] === "fulfilled") {
      setDeleteModalVisible(false)
    }
  }, [asyncStatus["deleteAlbums"]])

  function onDelete() {
    const albumIds = selectedAlbums.map(item => item.id!)
    appDispatch(deleteAlbums(albumIds))
  }

  function onRefresh() {
    appDispatch(queryAlbums())
  }

  function onSearch() {
    appDispatch(queryAlbums())
  }

  function onFilterChange(e: NonCancelableCustomEvent<TextFilterProps>) {
    appDispatch(albumActions.updateSlice({ searchQuery: e.detail.filteringText }))
  }

  function onCreate() {
    appDispatch(albumActions.updateSlice({ newAlbumModalOpen: true }))
  }

  function onEdit() {
    // const selectedAlbum = selectedAlbums[0]
    // const isLocked = selectedAlbum.name!.includes("=")
    // if (isLocked) {
    //   appDispatch(mainActions.addNotification({
    //     type: "error",
    //     content: "This album cannot be edited",
    //   }))
    //   appDispatch(albumActions.updateSlice({ selectedAlbums: [] }))
    //   scrollToTop()
    // } else {
    //   appDispatch(albumActions.updateSlice({ renameAlbumModalOpen: true, renameAlbumId: selectedAlbums[0].id, renameAlbumName: selectedAlbums[0].name }))
    // }
    appDispatch(albumActions.updateSlice({ renameAlbumModalOpen: true, renameAlbumId: selectedAlbums[0].id, renameAlbumName: selectedAlbums[0].name }))
  }

  function onToggleActionsMode() {
    appDispatch(albumActions.toggleActionsMode())
  }

  function onSelectionChange(e: NonCancelableCustomEvent<CardsProps.SelectionChangeDetail<Album>>) {
    appDispatch(albumActions.updateSlice({ selectedAlbums: e.detail.selectedItems, actionsMode: "select" }))
  }

  return (
    <Fragment>
      <Cards
        // loading={showLoader && (asyncStatus["queryAlbums"] === "pending" || albums === undefined)}
        loading={asyncStatus["queryAlbums"] === "pending" || albums === undefined}
        onSelectionChange={onSelectionChange}
        selectedItems={selectedAlbums}
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
                style={{
                  width: "min-content",
                  whiteSpace: "nowrap",
                }}
                className="link"
              >
                <CloudLink
                  href="#"
                  fontSize="heading-m"
                >
                  {
                    item.name!.split("=").pop()!
                  }
                  {/*{*/}
                  {/*  item.name!.includes("=") && (*/}
                  {/*    <Icon name="lock-private" size="small"  />*/}
                  {/*  )*/}
                  {/*}*/}
                </CloudLink>
              </div>
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
        entireCardClickable={true}
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
            onChange={onFilterChange}
            onDelayedChange={onSearch}
          />
        }
        header={
          <Header
            variant="awsui-h1-sticky"
            counter={
              albums
                ? selectedAlbums?.length
                  ? `(${selectedAlbums.length}/${albums.length})`
                  : `(${albums.length})`
                : ""
            }
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                {/*{*/}
                {/*  selectedAlbums.length > 0 && (*/}
                {/*    <CloudButton*/}
                {/*      onClick={onClearSelection}*/}
                {/*    >*/}
                {/*      Clear selection*/}
                {/*    </CloudButton>*/}
                {/*  )*/}
                {/*}*/}
                {/*<CloudButton*/}
                {/*  disabled={!isOnlyOneSelected}*/}
                {/*  // onClick={(e) => console.log(e)}*/}
                {/*  onClick={onEdit}*/}
                {/*  iconName="edit"*/}
                {/*/>*/}
                {/*<CloudButton*/}
                {/*  disabled={selectedAlbums.length === 0}*/}
                {/*  onClick={() => setDeleteModalVisible(true)}*/}
                {/*  iconName="remove"*/}
                {/*/>*/}
                {
                  actionsMode === "view" && (
                    <Fragment>
                      <CloudButton
                        onClick={onToggleActionsMode}
                      >
                        Select
                      </CloudButton>
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
                    </Fragment>
                  )
                }
                {
                  actionsMode === "select" && (
                    <Fragment>
                      <CloudButton
                        onClick={onToggleActionsMode}
                      >
                        Cancel
                      </CloudButton>
                      <CloudButton
                        disabled={!isOnlyOneSelected}
                        onClick={onEdit}
                        iconName="edit"
                      />
                      <CloudButton
                        disabled={selectedAlbums.length === 0}
                        onClick={() => setDeleteModalVisible(true)}
                        iconName="remove"
                      />
                    </Fragment>
                  )
                }
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
      <RenameAlbumModal />
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
