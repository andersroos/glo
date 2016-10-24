MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
BASE_DIR := $(realpath $(CURDIR)/$(MAKEFILE_DIR))


.PHONY: default build

default: build

dependencies:
	npm install

build:
	$(BASE_DIR)/node_modules/.bin/webpack
	cat $(BASE_DIR)/head.html $(BASE_DIR)/build/glo.js $(BASE_DIR)/foot.html > $(BASE_DIR)/build/glo.html

watch: 
	$(BASE_DIR)/node_modules/.bin/webpack --watch

clean:
	rm -rf $(BASE_DIR)/build

