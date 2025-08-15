# =========================
# build stage (Debian/glibc)
# =========================
FROM node:22-bookworm-slim AS build

ARG WEBP_VERSION=1.4.0
ARG LIBOPENJP2_VERSION=2.5.2
ARG VIPS_VERSION=8.17.1

ENV PREFIX_PATH=/usr/local \
  LIB_PATH=/usr/local/lib \
  PKG_CONFIG_PATH=/usr/local/lib/pkgconfig \
  LD_LIBRARY_PATH=/usr/local/lib

RUN apt-get update \
 && apt-get install -y autoconf automake autotools-dev build-essential ca-certificates \
    cmake curl gobject-introspection libcfitsio-dev libexif-dev libexpat1-dev libfftw3-dev \
    libgif-dev libgirepository1.0-dev libglib2.0-dev libheif-dev libimagequant-dev \
    libjpeg62-turbo-dev liblcms2-dev libmatio-dev libopenexr-dev liborc-0.4-dev libpng-dev \
    libpoppler-glib-dev librsvg2-dev libtiff-dev libtool libxml2-dev meson nasm ninja-build \
    pkg-config jq \
 && rm -rf /var/lib/apt/lists/*

# ---- libwebp ----
RUN curl -L "https://github.com/webmproject/libwebp/archive/v${WEBP_VERSION}.tar.gz" | tar zx; \
  cd "libwebp-${WEBP_VERSION}"; \
  ./autogen.sh; \
  ./configure --enable-libwebpmux --prefix="${PREFIX_PATH}"; \
  make -j"$(nproc)"; \
  make install

# ---- openjpeg (libopenjp2) ----
RUN curl -L "https://github.com/uclouvain/openjpeg/archive/refs/tags/v${LIBOPENJP2_VERSION}.tar.gz" | tar zx; \
  mkdir -p "openjpeg-${LIBOPENJP2_VERSION}/build"; \
  cd "openjpeg-${LIBOPENJP2_VERSION}/build"; \
  cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_LIBDIR="${LIB_PATH}"; \
  make -j"$(nproc)"; \
  make install

# ---- libvips (Meson) ----
RUN curl -L "https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz" | tar xJ \
 && cd "vips-${VIPS_VERSION}" \
 && meson setup build \
      --prefix="${PREFIX_PATH}" \
      --libdir="${LIB_PATH}" \
      -Dopenjpeg=enabled \
      -Dwebp=enabled \
      -Dlcms=enabled \
      --buildtype=release \
 && meson compile -C build \
 && meson install -C build \
 && ldconfig
RUN vips --version && pkg-config --modversion vips-cpp

# =========================
# deps stage (provider-specific SDKs)
# =========================
FROM build AS deps
WORKDIR /app
RUN npm install -g npm@latest
ARG SHARP_VERSION=0.34.3
RUN npm install --build-from-source --verbose --foreground-scripts sharp@"${SHARP_VERSION}" \
 && npm cache clean --force
