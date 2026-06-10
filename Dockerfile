# =========================
# build stage (Debian/glibc)
# =========================
FROM amazonlinux:2023 AS nodejs
RUN dnf install -y nodejs24-devel \
 && npm install -g npm@latest

FROM nodejs AS build

ENV PREFIX_PATH=/usr/local \
LIB_PATH=/usr/local/lib \
PKG_CONFIG_PATH=/usr/local/lib/pkgconfig \
LD_LIBRARY_PATH=/usr/local/lib

RUN dnf groupinstall -y "Development Tools" && \
dnf install -y glibc-langpack-en glib2-devel expat-devel libjpeg-turbo-devel libpng-devel libwebp-devel \
libexif-devel libimagequant-devel librsvg2-devel libtiff-devel lcms2-devel gobject-introspection-devel \
cmake nasm pkg-config meson ninja-build

# ---- cgif (Meson) ----
ARG CGIF_VERSION=0.5.3
RUN <<EOF
  curl -L "https://github.com/dloebl/cgif/archive/refs/tags/v${CGIF_VERSION}.tar.gz" | tar zx
  cd "cgif-${CGIF_VERSION}"
  meson setup build --prefix="${PREFIX_PATH}" --libdir="${LIB_PATH}" --buildtype=release
  meson compile -C build
  meson install -C build
  ldconfig
EOF

# ---- openjpeg (libopenjp2) ----
ARG LIBOPENJP2_VERSION=2.5.4
# curl -L "https://github.com/uclouvain/openjpeg/archive/refs/tags/v${LIBOPENJP2_VERSION}.tar.gz" | tar zx
# mkdir -p "openjpeg-${LIBOPENJP2_VERSION}/build"
# cd "openjpeg-${LIBOPENJP2_VERSION}/build"
RUN <<EOF
  git clone --single-branch --branch fix-interleaved-tile-parts https://github.com/mbklein/openjpeg.git
  cd openjpeg
  cmake -B build . -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_LIBDIR="${LIB_PATH}"
  cd build
  make -j"$(nproc)"
  make install
EOF

# ---- libvips (Meson) ----
ARG VIPS_VERSION=8.18.3
RUN <<EOF
  curl -L "https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz" | tar xJ
  cd "vips-${VIPS_VERSION}"
  meson setup build --prefix="${PREFIX_PATH}" --libdir="${LIB_PATH}" --buildtype=release
  meson compile -C build
  meson install -C build
  ldconfig
EOF
RUN vips --version && pkg-config --modversion vips-cpp

# =========================
# deps stage (provider-specific SDKs)
# =========================
FROM build AS deps
WORKDIR /app
ARG SHARP_VERSION=0.35.0
RUN <<EOF
  npm install node-gyp@latest node-addon-api@latest
  npm install sharp@${SHARP_VERSION}
  npm explore sharp -- npm run build
  npm cache clean --force
EOF
RUN <<EOF
  mkdir -p /export/lib
  ldd ./node_modules/sharp/src/build/Release/sharp-linux-x64-${SHARP_VERSION}.node | awk '{ print $3 }' | xargs cp -v --target-directory=/export/lib
EOF
