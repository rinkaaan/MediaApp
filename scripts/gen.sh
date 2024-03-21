WORKPLACE="$HOME/workplace/Media"

WORKSPACE="$WORKPLACE/MediaApi"
(
  cd "$WORKSPACE"
  ./scripts/gen.sh
)

WORKSPACE="$WORKPLACE/MediaApp"
SCHEMA_PATH="$WORKPLACE/MediaApi/api/openapi.yaml"
(
  cd "$WORKSPACE"
  rm -rf openapi-client
  npx openapi -i "$SCHEMA_PATH" -o openapi-client
)
