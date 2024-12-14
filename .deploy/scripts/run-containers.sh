#! /bin/bash

(
  # Load environment variables
  script_dir=$(dirname "$0")
  source $script_dir/../.env

  backup_dir=$script_dir/../backup
  logs_dir=$script_dir/../logs

  mkdir -p $backup_dir
  mkdir -p $logs_dir
  mkdir -p $script_dir/..$IMAGES_DIR

  if [ ! -f "$logs_dir/$LOG_FILE" ]; then
    touch $logs_dir/$LOG_FILE;
  fi

  if [ ! -f "$script_dir/../$DB_FILE" ]; then
    touch $script_dir/../$DB_FILE;
  fi

  echo 'Load images';
  docker load -i $DOCKER_IMAGES_DIR/$BALAKANYNA_IMAGE_FILE

  echo 'Stop previous';
  docker compose -f $DIR/docker-compose.yaml stop balakanyna

  echo 'Start balakanyna';
  docker compose -f $DIR/docker-compose.yaml up balakanyna -d --wait
)
