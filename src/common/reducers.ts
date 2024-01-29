import { combineReducers } from "@reduxjs/toolkit"
import { mainReducer } from "../routes/mainSlice"
import { albumReducer } from "../routes/albums/albumSlice"
import { mediaReducer } from "../routes/media/mediaSlice"

export const reducers = combineReducers({
  main: mainReducer,
  album: albumReducer,
  media: mediaReducer,
})

export type RootState = ReturnType<typeof reducers>
