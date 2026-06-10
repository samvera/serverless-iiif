BUILD_TYPE ?= esbuild

build-MetadataFunction: ENTRYPOINT=utils/create-metadata
build-IiifFunction: ENTRYPOINT=index

build-%:
	bun install
	bun build --outdir=$(ARTIFACTS_DIR) --platform=node --target=node --external:sharp --external:@img/sharp-linux-x64 $(ENTRYPOINT).ts