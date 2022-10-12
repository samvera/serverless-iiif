# Variables
SHARP_VERSION=0.30.7 #$(npm show sharp version)
NODE_VERSION=$(node -v)

# current dir where the build.sh is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

cd $DIR

# https://docs.aws.amazon.com/en_pv/lambda/latest/dg/configuration-layers.html#configuration-layers-path

# NPM install sharp
npm install --omit=dev --prefix /opt/nodejs sharp@$SHARP_VERSION
