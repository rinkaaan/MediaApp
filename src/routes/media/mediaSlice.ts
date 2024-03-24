import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../common/reducers"
import { Media, MediaService } from "../../../openapi-client"
import { getActionName } from "../../common/utils"
import { AsyncStatus, getApiErrorMessage, sleep } from "../../common/typedUtils"
import store, { appDispatch } from "../../common/store"
import { mainActions } from "../mainSlice"


export interface MediaState {
  errorMessages: Record<string, string>;
  asyncStatus: Record<string, AsyncStatus>;

  // new media modal
  newMediaModalOpen: boolean;
  newMediaUrls: Array<string>;
  downloadingMediaCount: number;

  // list media route
  medias: Array<Media> | undefined;
  noMoreMedia: boolean;
  selectedItems: Array<Media>;
  listMode: "select" | "view";
  listFirstLoad: boolean;
  deleteMediaModalVisible: boolean;
}

const initialState: MediaState = {
  errorMessages: {},
  asyncStatus: {},

  // new media modal
  newMediaModalOpen: false,
  newMediaUrls: [],
  downloadingMediaCount: 0,

  // list media route
  medias: undefined,
  noMoreMedia: false,
  selectedItems: [],
  listMode: "view",
  listFirstLoad: true,
  deleteMediaModalVisible: false,
}

export const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    updateSlice: (state, action: PayloadAction<Partial<MediaState>>) => {
      return { ...state, ...action.payload }
    },
    clearErrorMessages: (state) => {
      state.errorMessages = {}
      state.asyncStatus = {}
    },
    addMissingErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessages[action.payload] = "Required"
    },
    addErrorMessage: (state, action: PayloadAction<{ key: string, message: string }>) => {
      state.errorMessages[action.payload.key] = action.payload.message
    },
    resetSlice: () => {
      return initialState
    },
    resetNewMediaState: (state) => {
      const keysToReset = ["newMediaModalOpen", "newMediaUrl"]
      keysToReset.forEach(key => {
        state[key] = initialState[key]
      })
    },
    toggleListMode: (state) => {
      state.selectedItems = []
      state.listMode = state.listMode === "view" ? "select" : "view"
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state, action) => {
        state.asyncStatus[getActionName(action)] = "pending"
      })
      .addMatcher(isRejected, (state, action) => {
        state.asyncStatus[getActionName(action)] = "rejected"
      })
      .addMatcher(isFulfilled, (state, action) => {
        state.asyncStatus[getActionName(action)] = "fulfilled"
      })
  }
})

export const addMedia = createAsyncThunk(
  "media/addMedia",
  async (newMediaUrl: string, {  dispatch }) => {
    const { toolsOpen } = store.getState().main
    const { downloadingMediaCount } = store.getState().media

    function updateCount() {
      const { downloadingMediaCount: newDownloadingMediaCount } = store.getState().media
      dispatch(mediaActions.updateSlice({ downloadingMediaCount: newDownloadingMediaCount - 1 }))
    }

    try {
      dispatch(mediaActions.updateSlice({ downloadingMediaCount: downloadingMediaCount + 1 }))
      await MediaService.postMedia({ media_url: newMediaUrl })
      updateCount()
      if (!toolsOpen) {
        await appDispatch(queryMedia())
      }
    } catch (e) {
      updateCount()
      dispatch(
        mainActions.updateSlice({
          mainModalVisible: true,
          mainModalMessage: getApiErrorMessage(e),
          mainModalHeader: "Error",
          mainModalAlertType: "error"
        }),
      )
    }
  },
)

export const queryMedia = createAsyncThunk(
  "media/queryMedia",
  async (_payload, { dispatch }) => {
    const queryMediaOut = await MediaService.getMediaQuery(undefined, 30, true)
    dispatch(mediaActions.updateSlice({ medias: queryMediaOut.media, noMoreMedia: queryMediaOut.no_more_media, selectedItems: [] }))
    await sleep(100)
    dispatch(mediaActions.updateSlice({ listFirstLoad: false }))
  }
)

// export const queryMoreAlbums = createAsyncThunk(
//   "album/queryMoreAlbums",
//   async (_payload, { dispatch }) => {
//     const { albums: curAlbums, noMoreAlbums } = store.getState().album
//     if (noMoreAlbums || !curAlbums) return
//     const lastId = curAlbums[curAlbums.length - 1].id
//     if (!lastId) return
//     const queryAlbumsOut = await AlbumService.getAlbumQuery(lastId, 30, true)
//     if (!queryAlbumsOut.albums || queryAlbumsOut.albums?.length === 0) {
//       dispatch(albumActions.updateSlice({ noMoreMedia: true }))
//     } else {
//       dispatch(albumActions.updateSlice({ albums: [...curAlbums, ...queryAlbumsOut.albums], noMoreMedia: queryAlbumsOut.no_more_albums }))
//     }
//   }
// )

export const queryMoreMedia = createAsyncThunk(
  "media/queryMoreMedia",
  async (_payload, { dispatch }) => {
    const { medias: curMedias, noMoreMedia } = store.getState().media
    if (noMoreMedia || !curMedias) return
    const lastId = curMedias[curMedias.length - 1].created_at_ksuid
    if (!lastId) return
    const queryMediaOut = await MediaService.getMediaQuery(lastId, 30, true)
    if (!queryMediaOut.media || queryMediaOut.media?.length === 0) {
      dispatch(mediaActions.updateSlice({ noMoreMedia: true }))
    } else {
      dispatch(mediaActions.updateSlice({ medias: [...curMedias, ...queryMediaOut.media], noMoreMedia: queryMediaOut.no_more_media }))
    }
  }
)

// export const deleteAlbums = createAsyncThunk(
//   "album/deleteAlbums",
//   async (albumIds: Array<string>, { dispatch }) => {
//     await AlbumService.deleteAlbum({ album_ids: albumIds })
//     dispatch(
//       mainActions.addNotification({
//         content: "Albums deleted",
//         type: "success",
//       }),
//     )
//     let { albums } = store.getState().album
//     if (!albums) albums = []
//     dispatch(albumActions.updateSlice({ albums: albums.filter(a => !albumIds.includes(a.id!)) }))
//   }
// )

export const deleteMedias = createAsyncThunk(
  "media/deleteMedias",
  async (mediaIds: Array<string>, { dispatch }) => {
    await MediaService.deleteMedia({ media_ids: mediaIds })
    dispatch(
        mainActions.updateSlice({
        mainModalVisible: true,
        mainModalMessage: "Media(s) deleted",
        mainModalHeader: "Success",
        mainModalAlertType: "success"
      })
    )
    appDispatch(queryMedia())
    appDispatch(mediaActions.updateSlice({ listMode: "view" }))
  }
)

export const mediaReducer = mediaSlice.reducer
export const mediaActions = mediaSlice.actions
export const mediaSelector = (state: RootState) => state.media
