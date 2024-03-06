import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit"
import { FlashbarProps } from "@cloudscape-design/components"
import { AsyncStatus, uuid } from "../common/typedUtils"
import type { RootState } from "../common/reducers"
import React from "react"
import { DefaultService } from "../../openapi-client"
import { getActionName } from "../common/utils"

export interface MainState {
  navigationOpen: boolean;
  toolsOpen?: boolean;
  toolsHidden: boolean;
  tools: React.ReactNode;
  notifications: Array<FlashbarProps.MessageDefinition>;
  dirty: boolean;
  dirtyModalVisible: boolean;
  dirtyRedirectUrl?: string;
  lockScroll?: boolean;
  startingPath?: string;
  username: string;
  password: string;
  isAuthenticated?: boolean;
  asyncStatus: Record<string, AsyncStatus>;
}

const initialState: MainState = {
  navigationOpen: false,
  toolsOpen: false,
  toolsHidden: true,
  tools: null,
  notifications: [],
  dirty: false,
  dirtyModalVisible: false,
  dirtyRedirectUrl: undefined,
  lockScroll: false,
  startingPath: undefined,
  username: "",
  password: "",
  asyncStatus: {},
}

type Notification = Pick<FlashbarProps.MessageDefinition, "type" | "content">

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    updateSlice: (state, action: PayloadAction<Partial<MainState>>) => {
      return { ...state, ...action.payload }
    },
    addNotification(state, action: PayloadAction<Notification>) {
      // if there is already a notification with the same content, don't add it
      if (state.notifications.find(n => n.content === action.payload.content)) return
      const notification: FlashbarProps.MessageDefinition = {
        ...action.payload,
        dismissible: true,
        id: uuid(),
      }
      state.notifications.push(notification)
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    resetDirty(state) {
      state.dirty = false
      state.dirtyModalVisible = false
      state.dirtyRedirectUrl = undefined
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
  },
})

export const ping = createAsyncThunk(
  "main/ping",
  async (_payload, { dispatch }) => {
    try {
      await DefaultService.getPing()
      dispatch(mainSlice.actions.updateSlice({ isAuthenticated: true }))
    } catch (e) {
      dispatch(mainSlice.actions.updateSlice({ isAuthenticated: false }))
      throw e
    }
  },
)

export const mainReducer = mainSlice.reducer
export const mainActions = mainSlice.actions
export const mainSelector = (state: RootState) => state.main
