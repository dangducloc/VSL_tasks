#!/bin/bash

WATCH_DIR="/var/www/html/images"

while true; do
    find "$WATCH_DIR" -type f ! \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) -delete
    sleep 4
done
