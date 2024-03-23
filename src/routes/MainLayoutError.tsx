import { useEffect } from "react"
import { useNavigate, useRouteError } from "react-router-dom"
import { mainActions } from "./mainSlice"
import { appDispatch } from "../common/store"

export default function MainLayoutError() {
  const navigate = useNavigate()
  const error = useRouteError()

  useEffect(() => {
    if (error) {
      console.error(error)
      const errorAny = error
      let errorMessage: string
      if (errorAny["error"]) {
        errorMessage = errorAny["error"].toString()
      } else {
        errorMessage = errorAny.toString()
      }
      appDispatch(
        mainActions.updateSlice({
          mainModalVisible: true,
          mainModalMessage: errorMessage,
          mainModalHeader: "Error",
          mainModalAlertType: "error",
        }
      ))
    }
    navigate("/media", { replace: true })
  }, [error])

  return null
}
