import { createHashRouter, Navigate, Outlet, RouterProvider } from "react-router-dom"
import MainLayout from "./routes/MainLayout"
import MainLayoutError from "./routes/MainLayoutError"
import { mainSelector } from "./routes/mainSlice"
import { useSelector } from "react-redux"
import "@cloudscape-design/global-styles/index.css"
import "./app.css"
import { Fragment } from "react"
import { OpenAPI } from "../openapi-client"

const router = createHashRouter([
  {
    path: "/",
    Component: MainLayout,
    errorElement: <MainLayoutError/>,
    loader: async () => {
      // OpenAPI.BASE = "http://127.0.0.1:34200"
      OpenAPI.BASE = "http://65.21.126.28:34201"
      return null
    },
    children: [
      {
        path: "/albums",
        Component: Outlet,
        handle: createCrumb("Albums", "/albums"),
        children: [
          {
            index: true,
            lazy: () => import("./routes/albums/list-albums/ListAlbumsRoute"),
          },
        ],
      },
      {
        path: "/media",
        Component: Outlet,
        handle: createCrumb("All Media", "/media"),
        children: [
          {
            index: true,
            lazy: () => import("./routes/media/all-media/AllMediaRoute"),
          },
          {
            path: "new",
            lazy: () => import("./routes/media/add-media/AddMediaRoute"),
            handle: createCrumb("Add Media", "/media/new"),
          },
        ],
      },
      {
        path: "settings",
        lazy: () => import("./routes/settings/SettingsRoute"),
        handle: createCrumb("Settings", "/settings"),
      },
      {
        path: "*",
        Component: () => <Navigate to="/media"/>,
      }
    ],
  },
])

export interface CrumbHandle {
  crumbs: () => { crumb: string, path: string }
}

function createCrumb(crumb: string, path: string): CrumbHandle {
  return {
    crumbs: () => {
      return {
        crumb,
        path,
      }
    }
  }
}

export default function App() {
  const { lockScroll } = useSelector(mainSelector)

  return (
    <Fragment>
      <div
        id="test"
        style={lockScroll ? { height: "100%", position: "absolute", width: "100%", overflow: "hidden" } : {}}
      >
        <RouterProvider router={router} />
      </div>
      <div id="top-filler" />
    </Fragment>
  )
}
