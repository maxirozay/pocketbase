#!/bin/sh

SERVER_URL="debian@dev.visioncompliance.ch"
SSH_KEY="~/.ssh/test"
REMOTE_PATH="~/pocketbase"

npm run build

# Use rsync to only upload files that have changed
rsync -av -e "ssh -i $SSH_KEY" pocketbase/pb_migrations $SERVER_URL:$REMOTE_PATH/
rsync -av -e "ssh -i $SSH_KEY" pocketbase/pb_public $SERVER_URL:$REMOTE_PATH/

# Clean up files in pb_public older than 30 days to save space
ssh -i $SSH_KEY $SERVER_URL "find $REMOTE_PATH/pb_public -type f -mtime +30 -delete"


## scp alternative (uncomment if you prefer scp over rsync)
# scp -r -i $SSH_KEY pocketbase/pb_migrations $SERVER_URL:$REMOTE_PATH/pb_migrations
# scp -r -i $SSH_KEY pocketbase/pb_public $SERVER_URL:$REMOTE_PATH/pb_public

# scp -i $SSH_KEY pocketbase/pocketbase $SERVER_URL:$REMOTE_PATH/pocketbase # deploy pocketbase binary if needed (make sure it's built for the right architecture)