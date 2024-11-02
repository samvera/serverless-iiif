build-IiifFunction:
	rsync -ar --exclude node_modules . $(ARTIFACTS_DIR)
	npm ci --omit=optional --omit=dev --prefix $(ARTIFACTS_DIR)
