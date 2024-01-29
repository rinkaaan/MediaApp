import { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.nguylinc.photos",
  appName: "Media",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
}

export default config
