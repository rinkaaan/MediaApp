WORKPLACE="$HOME/workplace/Media"
WORKSPACE="$WORKPLACE/MediaApp"

(
  cd "$WORKSPACE"
  ICON_SRC="$WORKPLACE/MediaApp/src/assets/MacIcon.png"

  rm -rf temp
  rm -rf src/assets/MacIcon.iconset
  rm -rf src/assets/MacIcon.icns

  mkdir temp
  mkdir src/assets/MacIcon.iconset

  convert "$ICON_SRC" -resize 16x16 temp/icon_16.png
  convert "$ICON_SRC" -resize 32x32 temp/icon_32.png
  convert "$ICON_SRC" -resize 64x64 temp/icon_64.png
  convert "$ICON_SRC" -resize 128x128 temp/icon_128.png
  convert "$ICON_SRC" -resize 256x256 temp/icon_256.png
  convert "$ICON_SRC" -resize 512x512 temp/icon_512.png
  convert "$ICON_SRC" -resize 1024x1024 temp/icon_1024.png

  cp temp/icon_16.png src/assets/MacIcon.iconset/icon_16x16.png
  cp temp/icon_32.png src/assets/MacIcon.iconset/icon_16x16@2x.png
  cp temp/icon_32.png src/assets/MacIcon.iconset/icon_32x32.png
  cp temp/icon_64.png src/assets/MacIcon.iconset/icon_32x32@2x.png
  cp temp/icon_128.png src/assets/MacIcon.iconset/icon_128x128.png
  cp temp/icon_256.png src/assets/MacIcon.iconset/icon_128x128@2x.png
  cp temp/icon_256.png src/assets/MacIcon.iconset/icon_256x256.png
  cp temp/icon_512.png src/assets/MacIcon.iconset/icon_256x256@2x.png
  cp temp/icon_512.png src/assets/MacIcon.iconset/icon_512x512.png
  cp temp/icon_1024.png src/assets/MacIcon.iconset/icon_512x512@2x.png

  iconutil -c icns src/assets/MacIcon.iconset

  ICON_SRC="$WORKPLACE/MediaApp/src/assets/WindowsIcon.png"
  convert "$ICON_SRC" -resize 64x64 temp/favicon.png
  cp temp/favicon.png public/favicon.png

  rm -rf temp
  rm -rf src/assets/MacIcon.iconset
)
