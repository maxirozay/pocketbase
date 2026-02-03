#!/bin/sh

SERVER_URL="debian@dev.visioncompliance.ch"
SSH_KEY="~/.ssh/test"
REMOTE_PATH="~/pocketbase"

npm run build

# Use rsync to only upload files that have changed
rsync -av -e "ssh -i $SSH_KEY" pocketbase/pb_migrations $SERVER_URL:$REMOTE_PATH/
rsync -av -e "ssh -i $SSH_KEY" pocketbase/pb_public $SERVER_URL:$REMOTE_PATH/
rsync -av -e "ssh -i $SSH_KEY" pocketbase/pb_hooks $SERVER_URL:$REMOTE_PATH/

# Clean up files in pb_public older than 30 days to save space
ssh -i $SSH_KEY $SERVER_URL "find $REMOTE_PATH/pb_public -type f -mtime +30 -delete"

if [ "$1" = "--pb" ]; then
  echo "Uploading new PocketBase binary..."
  scp -i $SSH_KEY pocketbase/pocketbase_server $SERVER_URL:$REMOTE_PATH/pocketbase_new
  ssh -i $SSH_KEY $SERVER_URL "chmod +x $REMOTE_PATH/pocketbase_new"

  echo "Restarting service..."
  ssh -i $SSH_KEY $SERVER_URL "sudo systemctl stop pocketbase && mv $REMOTE_PATH/pocketbase_new $REMOTE_PATH/pocketbase && sudo systemctl start pocketbase"
  echo "PocketBase binary updated and service restarted."
else
  echo "Skipping binary update. Run with --pb to update the server binary."
fi

## scp alternative (uncomment if you prefer scp over rsync)
# scp -r -i $SSH_KEY pocketbase/pb_migrations $SERVER_URL:$REMOTE_PATH/pb_migrations
# scp -r -i $SSH_KEY pocketbase/pb_public $SERVER_URL:$REMOTE_PATH/pb_public
