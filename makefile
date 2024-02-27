BIN_DIR ?= node_modules/.bin
ROOT_DIR ?= ./
ROOT_BIN_DIR ?= $(ROOT_DIR)node_modules/.bin
P := "\\033[32m[+]\\033[0m"
OUTPUT_DIR ?= lib

help:
	@echo "\033[33mmake dev\033[0m - Watch source code and re-complie if there's any change"
	@echo "\033[33mmake lint\033[0m - Run prettier and eslint"
	@echo "\033[33mmake prettier\033[0m - Run prettier"
	@echo "\033[33mmake build\033[0m - Build distribution package files"
	@echo "\033[33mmake publish\033[0m - Publish the package to npm"

check-deps:
	@echo "$(P) Check dependencies of the project"
	yarn install

dev:
	@echo "$(P) Start babel watch mode"
	NODE_ENV=development $(ROOT_BIN_DIR)/babel src --out-dir $(OUTPUT_DIR) --watch --source-maps

build: clean
	@echo "$(P) Build distribution package files"
	NODE_ENV=production $(ROOT_BIN_DIR)/babel src --out-dir $(OUTPUT_DIR)

clean:
	@echo "$(P) Clean $(OUTPUT_DIR)/"
	$(ROOT_BIN_DIR)/rimraf $(OUTPUT_DIR)/

publish: check-deps prettier lint build
	@echo "$(P) Publish package to npm"
	npm publish

# This will only prettier files under this package
prettier:
	@echo "$(P) Run prettier"
	$(ROOT_BIN_DIR)/prettier --write --ignore-path "$(ROOT_DIR).eslintignore" "**/*.{js,json,css,md,html,htm}"

# This will only lint files under this package
lint:
	@echo "$(P) Run eslint"
	$(ROOT_BIN_DIR)/eslint -c "$(ROOT_DIR).eslintrc" --ignore-path "$(ROOT_DIR).eslintignore" --fix "**/*.js"

version:
	@echo "$(P) Bump new version"
	$(ROOT_BIN_DIR)/commit-and-tag-version

.PHONY: build clean lint prettier dev check-deps version
