import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { FlashbarProps } from "@cloudscape-design/components"
import { uuid } from "../common/typedUtils"
import type { RootState } from "../common/reducers"
import React from "react"

export interface MainState {
  navigationOpen: boolean;
  toolsOpen?: boolean;
  tools: React.ReactNode;
  notifications: Array<FlashbarProps.MessageDefinition>;
  dirty: boolean;
  dirtyModalVisible: boolean;
  dirtyRedirectUrl?: string;
  lockScroll?: boolean;
  startingPath?: string;
  username: string;
  password: string;
}

const initialState: MainState = {
  navigationOpen: false,
  toolsOpen: false,
  tools: null,
  notifications: [],
  dirty: false,
  dirtyModalVisible: false,
  dirtyRedirectUrl: undefined,
  lockScroll: false,
  startingPath: undefined,
  username: "",
  password: "",
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
    }
  },
})

export const mainReducer = mainSlice.reducer
export const mainActions = mainSlice.actions
export const mainSelector = (state: RootState) => state.main
