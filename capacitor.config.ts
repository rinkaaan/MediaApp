import { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.nguylinc.media",
  appName: "Media",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
}

export default config
