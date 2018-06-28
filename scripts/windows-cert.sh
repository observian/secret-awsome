#!/bin/bash

# A POSIX variable
OPTIND=1 # Reset in case getopts has been used previously in the shell.
CERT_FILE="." # Certificate file name and path
CERT_PASS="" # Certificate password
small_f=false
small_p=false

while getopts ":f:p:" opt; do
	case $opt in
		f  ) small_f=true; CERT_FILE=$OPTARG;;
		p  ) small_p=true; CERT_PASS=$OPTARG;;
		\? ) echo "Unknown option: -$OPTARG" >&2; exit 1;;
		:  ) echo "Missing option argument for -$OPTARG" >&2; exit 1;;
		*  ) echo "Unimplemented option: -$OPTARG" >&2; exit 1;;
	esac
done

if ! $small_f
then
	echo "-f [file path] is required" >&2
	exit 1
fi

if ! $small_p
then
	echo "-p [password] is required" >&2
	exit 1
fi

sed -i -- "s#{{CERT_FILENAME}}#$CERT_FILE#g" package.json
sed -i -- "s#{{CERT_PASSWORD}}#$CERT_PASS#g" package.json
