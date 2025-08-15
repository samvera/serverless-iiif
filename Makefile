# AWS

AWS_PACKAGE_BUCKET ?= nul-serverless-applications
AWS_PACKAGE_PREFIX ?= serverless-iiif
NODE_BASE_CONTAINER_ID_FILE := $(shell mktemp)
NODE_BASE_CONTAINER_ID = $(shell cat $(NODE_BASE_CONTAINER_ID_FILE))
AWS_DEPENDENCIES_DIR = $(shell pwd)/dependencies
AWS_NODEJS_DIR = $(AWS_DEPENDENCIES_DIR)/nodejs
AWS_LIB_DIR = $(AWS_DEPENDENCIES_DIR)/lib

SAM_CONFIG_FILE := $(firstword $(wildcard samconfig.yaml samconfig.yml samconfig.toml deploy.yaml deploy.yml deploy.toml))

all: build

clean:
	rm -rf sam/.aws-sam dependencies/lib dependencies/nodejs

deps-image:
	docker buildx build --target deps --iidfile $(NODE_BASE_CONTAINER_ID_FILE) .

define copy_from_container
	mkdir -p "$(1)"
	docker run --rm $(NODE_BASE_CONTAINER_ID) tar -C $(2) -cf - $(3) | \
		tar -C "$(1)" -xf -
endef

$(AWS_NODEJS_DIR): deps-image
	$(call copy_from_container,$(AWS_NODEJS_DIR),/app,node_modules)

$(AWS_LIB_DIR): deps-image
	$(call copy_from_container,$(AWS_LIB_DIR),/usr/local/lib,.)

deps: | $(AWS_NODEJS_DIR) $(AWS_LIB_DIR)

build: deps
	sam build

package: build
	sam package \
		--profile ${AWS_PROFILE} \
		--s3-bucket ${AWS_PACKAGE_BUCKET} \
		--s3-prefix ${AWS_PACKAGE_PREFIX} \
		--output-template-file package.yml

deploy: build
	sam deploy $(if $(SAM_CONFIG_FILE),--config-file $(SAM_CONFIG_FILE),--guided)

deploy-guided: build
	sam deploy $(if $(SAM_CONFIG_FILE),--config-file $(SAM_CONFIG_FILE),) --guided

delete-stack:
	sam delete $(if $(SAM_CONFIG_FILE),--config-file $(SAM_CONFIG_FILE),)

publish: package
	sam publish

dev: deps
	sam sync $(if $(SAM_CONFIG_FILE),--config-file $(SAM_CONFIG_FILE),) --watch
