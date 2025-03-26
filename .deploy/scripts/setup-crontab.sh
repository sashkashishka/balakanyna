#!/bin/bash

(
  # Load environment variables
  script_dir=$(dirname "$0")
  source $script_dir/../.env

  PROD_BACKUP_CMD="bash $DIR/scripts/backup.sh $DIR $DB_FILE $IMAGES_DIR"
  PROD_DELETE_OLD_BACKUPS="bash $DIR/scripts/delete_old_files.sh $DIR/backup"
  DELETE_OLD_BALAKANYNA_IMAGES="bash $DIR/scripts/delete_old_docker_images.sh balakanyna"

  table=~/.crontab.d/balakanyna.cron
  echo "" > $table

  echo "0 0 * * * $PROD_BACKUP_CMD" >> $table
  echo "0 0 * * 0 $PROD_DELETE_OLD_BACKUPS" >> $table
  echo "0 0 * * 0 $DELETE_OLD_BALAKANYNA_IMAGES" >> $table

  crontab -r
  cat ~/.crontab.d/*.cron | crontab -

  echo "Cron job for added successfully."
)
