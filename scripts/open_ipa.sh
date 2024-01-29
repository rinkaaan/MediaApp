WORKPLACE="$HOME/workplace/Media"
WORKSPACE="$WORKPLACE/MediaApp"

#ARCHIVE_PATH="/Users/nguylinc/Library/Developer/Xcode/Archives/2024-01-07/App 1-7-24, 11.06 PM.xcarchive"
# Find the newest xcarchive file in the newest folder under the Archives directory
ARCHIVE_PATH=$(find "$HOME/Library/Developer/Xcode/Archives/" -type d -name "*.xcarchive" -print0 | xargs -0 ls -td | head -n 1)
OUTPUT_DIR="$WORKSPACE/dist"

(
  open "$OUTPUT_DIR"
)
