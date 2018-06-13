#!/bin/bash

# A POSIX variable
OPTIND=1 # Reset in case getopts has been used previously in the shell.
BASEDIR="." # Path to source code base directory (ie. path containing package.json)
PLATFORM=""

while getopts ":p:d:" opt; do
	case $opt in
		p)
			PLATFORM="$OPTARG"
			;;
		d)
			BASEDIR="$OPTARG"
			;;
		\?)
			echo "Invalid option: -$OPTARG" >&2
			exit 1
			;;
		:)
			echo "Option -$OPTARG requires an argument." >&2
			exit 1
			;;
	esac
done

NAME=$(node -p "require('$BASEDIR/package.json').displayName")
VERSION=$(node -p "require('$BASEDIR/package.json').version")
MAKEDIR="$BASEDIR/out/make"
FINALDIR="$MAKEDIR/final"

mkdir -p "$FINALDIR"

for file in $(find "$MAKEDIR" -type f -name "*.*" ! -name ".DS*"); do cp "${file}" "$FINALDIR/$NAME-$PLATFORM-$VERSION.${file##*.}"; done

echo "Files Created"
for file in $(find "$FINALDIR" -type f); do echo "${file}"; done

GITHUB_TOKEN='put token here'
API_JSON=$(printf '{"tag_name": "v%s","target_commitish": "master","name": "v%s","body": "Release of version %s","draft": true,"prerelease": false}' $VERSION $VERSION $VERSION)
RELEASE_JSON=$(curl --silent --data "$API_JSON" https://api.github.com/repos/observian/aws-ssm-parameter-manager/releases?access_token=$GITHUB_TOKEN)
UPLOAD_URL=$(echo "$RELEASE_JSON" | pcregrep -o1 -i '"upload_url".*"(.+)\{\?')

for file in $(find "$FINALDIR" -type f); do curl --data-binary @"${file}" -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/octet-stream" "$UPLOAD_URL?name=${file##*/}"; done
