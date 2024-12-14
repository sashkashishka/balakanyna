#!/bin/bash

script_dir=$(dirname "$0")
env_file=$script_dir/../.env

echo "TAG=$TAG" >> tmp0
echo "DOCKER_IMAGES_DIR=$DOCKER_IMAGES_DIR" >> tmp0
echo "BALAKANYNA_IMAGE_FILE=$BALAKANYNA_IMAGE_FILE" >> tmp0
cat $env_file >> tmp0

sort -u -t '=' -k 1,1 tmp0 $env_file > $env_file

rm tmp0
