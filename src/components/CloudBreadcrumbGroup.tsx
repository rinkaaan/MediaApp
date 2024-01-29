import { BreadcrumbGroup, BreadcrumbGroupProps } from "@cloudscape-design/components"
import { useNavigate } from "react-router-dom"
import { mainActions, mainSelector } from "../routes/mainSlice"
import { useSelector } from "react-redux"
import { appDispatch } from "../common/store"

export default function CloudBreadcrumbGroup(props: BreadcrumbGroupProps) {
  const navigate = useNavigate()
  const { dirty } = useSelector(mainSelector)

  return (
    <BreadcrumbGroup
      {...props}
      onClick={e => {
        e.preventDefault()
        const { detail } = e
        if (!detail.href) return
        if (!dirty) {
          navigate(detail.href)
        } else {
          appDispatch(mainActions.updateSlice({ dirtyModalVisible: true, dirtyRedirectUrl: detail.href }))
        }
      }}
    />
  )
}
