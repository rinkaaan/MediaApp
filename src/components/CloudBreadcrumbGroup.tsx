import { BreadcrumbGroup, BreadcrumbGroupProps } from "@cloudscape-design/components"
import { mainActions } from "../routes/mainSlice"
import { appDispatch } from "../common/store"

export default function CloudBreadcrumbGroup(props: BreadcrumbGroupProps) {
  return (
    <BreadcrumbGroup
      {...props}
      onClick={e => {
        e.preventDefault()
        const { detail } = e
        if (!detail.href) return
        appDispatch(mainActions.updateSlice({ mainModalVisible: true, mainModalMessage: detail.href }))
      }}
    />
  )
}
