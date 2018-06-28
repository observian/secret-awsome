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
