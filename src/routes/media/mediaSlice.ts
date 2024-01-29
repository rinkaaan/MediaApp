import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../common/reducers"
import { Media, MediaService } from "../../../openapi-client"
import { getActionName } from "../../common/utils"
import { AsyncStatus, sleep } from "../../common/typedUtils"


export interface MediaState {
  errorMessages: Record<string, string>;
  asyncStatus: Record<string, AsyncStatus>;

  // new media modal
  newMediaModalOpen: boolean;

  // list media route
  medias: Array<Media> | undefined;
  noMoreMedia: boolean;
}

const initialState: MediaState = {
  errorMessages: {},
  asyncStatus: {},

  // new media modal
  newMediaModalOpen: false,

  // list media route
  medias: undefined,
  noMoreMedia: false,
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

// export const addAlbum = createAsyncThunk(
//   "album/addAlbum",
//   async (_payload, { dispatch }) => {
//     const { newAlbumName } = store.getState().album
//     try {
//       const album = await AlbumService.postAlbum({ name: newAlbumName })
//       dispatch(
//         mainActions.addNotification({
//           content: `Album "${album.name}" created`,
//           type: "success",
//         }),
//       )
//       let { albums } = store.getState().album
//       if (!albums) albums = []
//       dispatch(albumActions.updateSlice({ albums: [album, ...albums] }))
//     } catch (e) {
//       dispatch(albumActions.addErrorMessage({
//         key: "newAlbum",
//         message: getApiErrorMessage(e),
//       }))
//       throw new Error()
//     }
//   }
// )

export const queryMedia = createAsyncThunk(
  "media/queryMedia",
  async (_payload, { dispatch }) => {
    const queryMediaOut = await MediaService.getMediaQuery(undefined, 30, true)
    dispatch(mediaActions.updateSlice({ medias: queryMediaOut.media, noMoreMedia: queryMediaOut.no_more_media }))
    await sleep(100)
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
//
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

export const mediaReducer = mediaSlice.reducer
export const mediaActions = mediaSlice.actions
export const mediaSelector = (state: RootState) => state.media
