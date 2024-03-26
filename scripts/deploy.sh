source ~/startup.sh
WORKPLACE="$HOME/workplace/Media"

WORKSPACE="$WORKPLACE/MediaApp"
(
  cd "$WORKSPACE"
  rsync-project Media
#  ssh root@hetzner "cd ~/workplace/Media/MediaApp && npm run build"
#  ssh root@hetzner "cd ~/workplace/Media/MediaApp && npm run gen:openapi && npm run build"
  ssh root@hetzner "cd ~/workplace/Media/MediaApp && npm i && npm run build"
)
