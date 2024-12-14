#! /bin/bash

directory="$1"

# Check if directory exists
if [ ! -d "$directory" ]; then
    echo "Directory $directory does not exist."
    exit 1
fi

# Change to the directory
cd "$directory" || exit 1

# List files by modification time in descending order
files=($(ls -t))

# Keep the two most recent files
for ((i=2; i < ${#files[@]}; i++)); do
    rm "${files[i]}"
done
