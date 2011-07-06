#!/bin/zsh

PROFILE_NAME="jscontest"
GOOGLE_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
USER_DIR="/Users/$USER/Library/Application Support/Google/Chrome/${PROFILE_NAME}"

exec $GOOGLE_CHROME \
    --enable-udd-profiles \
    --user-data-dir=$USER_DIR "$@" &