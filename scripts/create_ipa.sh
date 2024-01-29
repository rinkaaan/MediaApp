WORKPLACE="$HOME/workplace/Media"
WORKSPACE="$WORKPLACE/MediaApp"

#ARCHIVE_PATH="/Users/nguylinc/Library/Developer/Xcode/Archives/2024-01-07/App 1-7-24, 11.06 PM.xcarchive"
# Find the newest xcarchive file in the newest folder under the Archives directory
ARCHIVE_PATH=$(find "$HOME/Library/Developer/Xcode/Archives/" -type d -name "*.xcarchive" -print0 | xargs -0 ls -td | head -n 1)
OUTPUT_DIR="$WORKSPACE/dist"

echo "Creating .ipa file from $ARCHIVE_PATH"

(
  # Check if the .xcarchive exists
  if [ ! -d "$ARCHIVE_PATH" ]; then
      echo "Archive not found at $ARCHIVE_PATH"
      exit 1
  fi

  # Create a Payload directory
  PAYLOAD_DIR="$OUTPUT_DIR/Payload"
  mkdir -p "$PAYLOAD_DIR"

  # Find the App.app folder and copy it to the Payload directory
  APP_PATH=$(find "$ARCHIVE_PATH" -name "App.app" -type d)
  if [ -z "$APP_PATH" ]; then
      echo "App.app not found in archive"
      exit 1
  fi

  cp -R "$APP_PATH" "$PAYLOAD_DIR"

  # Change to the output directory and zip the Payload folder into an .ipa file
  cd "$OUTPUT_DIR"
  zip -r "App.ipa" "Payload"

  # Clean up (optional)
  rm -rf "$PAYLOAD_DIR"

  # Remove all files in Archives directory
  rm -rf "$HOME/Library/Developer/Xcode/Archives/"

  echo "App.ipa created at $OUTPUT_DIR/App.ipa"

  open "$OUTPUT_DIR"
)
