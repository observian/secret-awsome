NAME=$(node -p "require('./package.json').displayName")
PLATFORM="linux"
VERSION=$(node -p "require('./package.json').version")
for file in out/make/*.*; do mv "$file" "out/make/$NAME-$PLATFORM-$VERSION.${file##*.}"; done
