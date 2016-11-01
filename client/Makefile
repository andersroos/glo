# Does not work if multiple makefiles, but is not dangerous if space in filename.
BASE_DIR := $(dir $(MAKEFILE_LIST))

NPM_BIN := node_modules/.bin


.PHONY: default build init watch clean

default: build

init:
	npm install

build:
	$(NPM_BIN)/webpack
	cat $(BASE_DIR)/head.html $(BASE_DIR)/build/glo.js $(BASE_DIR)/foot.html > $(BASE_DIR)/build/glo.html

watch: 
	$(NPM_BIN)/webpack --watch

clean:
	rm -rf $(BASE_DIR)/build
