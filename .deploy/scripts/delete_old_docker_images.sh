#! /bin/bash

repository="$1"

# List images, sort by creation date (newest first), extract image IDs
IMAGE_IDS=$(docker image ls --filter=reference="$repository" --format="{{.ID}} {{.CreatedAt}}" | sort -k 2 -r | awk '{print $1}')

# Keep only the two most recent image IDs
IMAGE_IDS_TO_KEEP=$(echo "$IMAGE_IDS" | head -n 2)

# Remove all images except the ones to keep
for IMAGE_ID in $IMAGE_IDS; do
    if [[ ! $IMAGE_IDS_TO_KEEP =~ $IMAGE_ID ]]; then
        echo "Removing image: $IMAGE_ID"
        docker image rm -f $IMAGE_ID
    fi
done
