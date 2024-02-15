import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../common/reducers"
import { Album, AlbumService } from "../../../openapi-client"
import { mainActions } from "../mainSlice"
import store, { appDispatch } from "../../common/store"
import { getActionName } from "../../common/utils"
import { AsyncStatus, getApiErrorMessage, sleep } from "../../common/typedUtils"


export interface AlbumState {
  errorMessages: Record<string, string>;
  asyncStatus: Record<string, AsyncStatus>;

  // new album modal
  newAlbumName: string;
  newAlbumModalOpen: boolean;

  // rename album modal
  renameAlbumName: string;
  renameAlbumId: string;
  renameAlbumModalOpen: boolean;

  // list albums route
  albums: Array<Album> | undefined;
  noMoreAlbums: boolean;
  searchQuery: string;
  actionsMode: "view" | "select";
  selectedAlbums: Array<Album>;
}

const initialState: AlbumState = {
  errorMessages: {},
  asyncStatus: {},

  // new album modal
  newAlbumName: "",
  newAlbumModalOpen: false,

  // rename album modal
  renameAlbumName: "",
  renameAlbumId: "",
  renameAlbumModalOpen: false,

  // list albums route
  albums: undefined,
  noMoreAlbums: false,
  searchQuery: "",
  actionsMode: "view",
  selectedAlbums: [],
}

export const albumSlice = createSlice({
  name: "album",
  initialState,
  reducers: {
    updateSlice: (state, action: PayloadAction<Partial<AlbumState>>) => {
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
    toggleActionsMode: (state) => {
      const currentMode = state.actionsMode
      state.actionsMode = currentMode === "view" ? "select" : "view"
      if (currentMode === "select") {
        state.selectedAlbums = []
      }
    },
    resetSlice: () => {
      return initialState
    },
    resetNewAlbumState: (state) => {
      const keysToReset = ["newAlbumName", "newAlbumModalOpen"]
      keysToReset.forEach(key => {
        state[key] = initialState[key]
      })
    },
    resetRenameAlbumState: (state) => {
      const keysToReset = ["renameAlbumName", "renameAlbumId", "renameAlbumModalOpen"]
      keysToReset.forEach(key => {
        state[key] = initialState[key]
      })
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
  },
})

export const addAlbum = createAsyncThunk(
  "album/addAlbum",
  async (_payload, { dispatch }) => {
    const { newAlbumName } = store.getState().album
    try {
      const { name } = await AlbumService.postAlbum({ name: newAlbumName })
      dispatch(
        mainActions.addNotification({
          content: `${name} album created`,
          type: "success",
        }),
      )
      appDispatch(queryAlbums())
    } catch (e) {
      dispatch(albumActions.addErrorMessage({
        key: "newAlbum",
        message: getApiErrorMessage(e),
      }))
      throw new Error()
    }
  },
)

export const renameAlbum = createAsyncThunk(
  "album/renameAlbum",
  async (_payload, { dispatch }) => {
    const { renameAlbumName, renameAlbumId } = store.getState().album
    await AlbumService.putAlbumRename({ album_id: renameAlbumId, new_name: renameAlbumName })
    dispatch(
      mainActions.addNotification({
        content: "Album renamed",
        type: "success",
      }),
    )
    appDispatch(queryAlbums())
  },
)

export const queryAlbums = createAsyncThunk(
  "album/queryAlbums",
  async (_payload, { dispatch }) => {
    const { searchQuery } = store.getState().album
    const queryAlbumsOut = await AlbumService.getAlbumQuery(undefined, 30, true, searchQuery)
    dispatch(albumActions.updateSlice({ albums: queryAlbumsOut.albums, noMoreAlbums: queryAlbumsOut.no_more_albums, selectedAlbums: [] }))
    await sleep(100)
  },
)

export const queryMoreAlbums = createAsyncThunk(
  "album/queryMoreAlbums",
  async (_payload, { dispatch }) => {
    const { albums: curAlbums, noMoreAlbums } = store.getState().album
    if (noMoreAlbums || !curAlbums) return
    const lastId = curAlbums[curAlbums.length - 1].id
    if (!lastId) return
    const queryAlbumsOut = await AlbumService.getAlbumQuery(lastId, 30, true)
    if (!queryAlbumsOut.albums || queryAlbumsOut.albums?.length === 0) {
      dispatch(albumActions.updateSlice({ noMoreAlbums: true }))
    } else {
      dispatch(albumActions.updateSlice({ albums: [...curAlbums, ...queryAlbumsOut.albums], noMoreAlbums: queryAlbumsOut.no_more_albums }))
    }
  },
)

export const deleteAlbums = createAsyncThunk(
  "album/deleteAlbums",
  async (albumIds: Array<string>, { dispatch }) => {
    await AlbumService.deleteAlbum({ album_ids: albumIds })
    dispatch(
      mainActions.addNotification({
        content: "Albums deleted",
        type: "success",
      }),
    )
    appDispatch(queryAlbums())
  },
)

export const albumReducer = albumSlice.reducer
export const albumActions = albumSlice.actions
export const albumSelector = (state: RootState) => state.album
