#!/usr/bin/env bash
set -euo pipefail

[[ "$(hostname -s)" == ash ]] || { echo 'Publish from /home/tc/QuackleReportViewer on Ash.' >&2; exit 1; }
source_dir=${1:-/home/tc/QuackleReportViewer/dist}
publish_root=/var/www/quackle.by.tc
[[ -f "$source_dir/index.html" && -d "$source_dir/assets" ]] || { echo 'Missing compiled site.' >&2; exit 1; }
[[ -d "$publish_root" ]] || { echo 'Missing publication directory.' >&2; exit 1; }

# Make new assets available before changing the document that references them.
# Retain old hashed assets for existing browser sessions.
rsync -a --exclude=/index.html "$source_dir/" "$publish_root/"
pending=$(mktemp "$publish_root/.index.next.XXXXXXXX")
trap 'rm -f -- "$pending"' EXIT
cp -- "$source_dir/index.html" "$pending"
chmod 644 "$pending"
mv -f -- "$pending" "$publish_root/index.html"
echo 'Published Quackle on Ash.'
