#!/usr/bin/env bash

# Cleans out old files except .git/ and .gitignore (and node files, including
# package*.json files if they exist) from $DEPLOY_PATH

# * Note NB *
# The environment variable DEPLOY_PATH must be set before running this script.
# Be aware though that this value should *not* be committed to git. It should
# instead be stored in a '.env' file which is not added to source control, E.g.
#   $ cat .env
#   DEPLOY_PATH="/path/to/target"
# It will not cause a problem if DEPLOY_PATH is specified with a trailing slash.
# The contents of '.env' will be loaded by the scripts in package.json.

# Stand-alone usage from the command line:
#   $ export DEPLOY_PATH="/path/to/target"; ./tools/clean-dest.sh

FAIL_RETVAL=254

# ------------------------------------------------------------------------------

# Check destination path

if [[ -z "$DEPLOY_PATH" ]]; then
  echo -e "\nError: Environment variable 'DEPLOY_PATH' must be set for the target deployment directory."
  echo -e "Please create a dotenv file '.env' in the project root and add 'DEPLOY_PATH=\"/path/to/target\"' to it.\n"
  exit $FAIL_RETVAL
fi

# Strip a potential trailing slash (forward or backward)
DEPLOY_PATH="${DEPLOY_PATH%\/}"
DEPLOY_PATH="${DEPLOY_PATH%\\}"

echo -e "\nTarget deployment directory: '$DEPLOY_PATH'"

if [[ ! -d "$DEPLOY_PATH" ]] || [[ ! -w "$DEPLOY_PATH" ]]; then
  echo -e "\nError: Target deployment directory '$DEPLOY_PATH' not found or not writable.\n"
  exit $FAIL_RETVAL
fi

declare -r DEPLOY_PATH

# --------------------------------------
echo -e "\n-> Removing old files (except git and node files including
package*.json files if they exist) from '$DEPLOY_PATH'"

while IFS= read -r -d '' file; do
  # echo "rm -v \"$file\""
  rm -v "$file"
done < <( find "$DEPLOY_PATH" -type f \
-not -path "$DEPLOY_PATH/.git*" \
-not -path "$DEPLOY_PATH/package*.json" \
-not -path "$DEPLOY_PATH/node_modules*" \
-print0 )

echo

# ------------------------------------------------------------------------------
