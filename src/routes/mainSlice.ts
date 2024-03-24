import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit"
import { AlertProps, FlashbarProps } from "@cloudscape-design/components"
import { AsyncStatus, uuid } from "../common/typedUtils"
import type { RootState } from "../common/reducers"
import React from "react"
import { DefaultService, OpenAPI } from "../../openapi-client"
import { getActionName } from "../common/utils"
import axios from "axios"

export interface MainState {
  navigationOpen: boolean;
  toolsOpen?: boolean;
  toolsHidden: boolean;
  tools: React.ReactNode;
  notifications: Array<FlashbarProps.MessageDefinition>;
  mainModalVisible: boolean;
  mainModalHeader?: string;
  mainModalMessage?: string;
  mainModalAlertType?: AlertProps.Type;
  lockScroll?: boolean;
  startingPath?: string;
  username: string;
  password: string;
  isAuthenticated?: boolean;
  asyncStatus: Record<string, AsyncStatus>;
  settingsSaved: boolean;
  settingsLoginAttempted: boolean;
  newCookies: File[];
}

const initialState: MainState = {
  navigationOpen: false,
  toolsOpen: false,
  toolsHidden: true,
  tools: null,
  notifications: [],
  mainModalVisible: false,
  mainModalHeader: undefined,
  mainModalMessage: undefined,
  mainModalAlertType: undefined,
  lockScroll: false,
  startingPath: undefined,
  username: "",
  password: "",
  isAuthenticated: undefined,
  asyncStatus: {},
  settingsSaved: false,
  settingsLoginAttempted: false,
  newCookies: [],
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

export const updateCookies = createAsyncThunk(
  "main/updateCookies",
  async (_payload, { getState, dispatch }) => {
    const getState2 = getState as () => RootState
    const { newCookies } = getState2().main
    const formData = new FormData()
    formData.append("cookies", newCookies[0])
    await axios.postForm(OpenAPI.BASE + "/main/cookies", formData, {
      auth: {
        username: OpenAPI.USERNAME as string,
        password: OpenAPI.PASSWORD as string,
      },
    })
    dispatch(mainActions.updateSlice({ newCookies: [] }))
  }
)

export const mainReducer = mainSlice.reducer
export const mainActions = mainSlice.actions
export const mainSelector = (state: RootState) => state.main
