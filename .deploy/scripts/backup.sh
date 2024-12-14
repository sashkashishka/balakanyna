#!/bin/bash

timestamp=$(date +"%Y%m%d%H%M%S")

dir="$1"
db_file="$2"
image_dir="$3"

tar -czf $dir/backup/backup-$timestamp.tar.gz $(realpath "$dir/$db_file") $(realpath "$dir$image_dir")
