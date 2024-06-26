#!/usr/bin/env bash

# Minifies each .js file individually

# Requires:
#   $ npm install terser --save-dev

# Paths to source and destination directories respectively, specified relative
# to the project root
SRC_PATH="./src/js"
DEST_PATH="./src/minjs"

ABS_SRC_PATH=$( realpath "$SRC_PATH" )
ABS_DEST_PATH=$( realpath "$DEST_PATH" )

while IFS= read -r -d '' FILE; do
  OUT="$ABS_DEST_PATH/$(basename "$FILE" .js)".js;
  echo "$SRC_PATH/$( basename "$FILE" ) -> $DEST_PATH/$( basename "$OUT" )"
  npx terser "$FILE" -o "$OUT"
done < <( find "$ABS_SRC_PATH" -type f -name "*.js" -print0 )
