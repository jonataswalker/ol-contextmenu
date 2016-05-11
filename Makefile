SHELL		:= /bin/bash
NOW		:= $(shell date --iso=seconds)
ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build
JS_DEBUG 	:= $(BUILD_DIR)/ol3-contextmenu-debug.js
JS_FINAL 	:= $(BUILD_DIR)/ol3-contextmenu.js
CSS_COMBINED 	:= $(BUILD_DIR)/ol3-contextmenu.css
CSS_FINAL 	:= $(BUILD_DIR)/ol3-contextmenu.min.css
TMPFILE 	:= $(BUILD_DIR)/tmp
TEST_DIR 	:= $(ROOT_DIR)/test/spec/
TEST_INC_FILE 	:= $(ROOT_DIR)/test/include.js

define GetFromPkg
$(shell node -p "require('./package.json').$(1)")
endef

LAST_VERSION	:= $(call GetFromPkg,version)
DESCRIPTION	:= $(call GetFromPkg,description)
PROJECT_URL	:= $(call GetFromPkg,homepage)

JS_FILES 	:= $(SRC_DIR)/wrapper-head.js \
		   $(SRC_DIR)/utils.js \
		   $(SRC_DIR)/base.js \
		   $(SRC_DIR)/internal.js \
		   $(SRC_DIR)/html.js \
		   $(SRC_DIR)/wrapper-tail.js

CSS_FILES 	:= $(SRC_DIR)/ol3-contextmenu.css

NODE_MODULES	:= ./node_modules/.bin
CLEANCSS 	:= $(NODE_MODULES)/cleancss
CLEANCSSFLAGS 	:= --skip-restructuring
POSTCSS 	:= $(NODE_MODULES)/postcss
POSTCSSFLAGS 	:= --use autoprefixer -b "last 2 versions"
ESLINT 		:= $(NODE_MODULES)/eslint
UGLIFYJS 	:= $(NODE_MODULES)/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 -c warnings=false
JS_BEAUTIFY	:= $(NODE_MODULES)/js-beautify
BEAUTIFYFLAGS 	:= -f - --indent-size 2 --preserve-newlines
NODEMON 	:= $(NODE_MODULES)/nodemon
PARALLELSHELL 	:= $(NODE_MODULES)/parallelshell

CASPERJS 	:= $(NODE_MODULES)/casperjs
CASPERJSFLAGS 	:= test $(TEST_DIR) --includes=$(TEST_INC_FILE) --ssl-protocol=any --ignore-ssl-errors=true


define HEADER
/**
 * $(DESCRIPTION)
 * $(PROJECT_URL)
 * Version: v$(LAST_VERSION)
 * Built: $(NOW)
 */

endef
export HEADER

# targets
build-watch: build watch

watch:
	$(PARALLELSHELL) "make watch-js" "make watch-css"

.PHONY: ci
ci: build test

.PHONY: test
test:
	@$(CASPERJS) $(CASPERJSFLAGS)

.PHONY: build
build: build-js build-css

build-js: combine-js lint uglifyjs addheader
	@echo `date +'%H:%M:%S'` " - build JS ... OK"

build-css: combine-css cleancss
	@echo `date +'%H:%M:%S'` " - build CSS ... OK"

uglifyjs:
	@$(UGLIFYJS) $(JS_DEBUG) $(UGLIFYJSFLAGS) > $(JS_FINAL)

lint:
	@$(ESLINT) $(JS_DEBUG)

addheader-debug:
	@echo "$$HEADER" | cat - $(JS_DEBUG) > $(TMPFILE) && mv $(TMPFILE) $(JS_DEBUG)

addheader-min:
	@echo "$$HEADER" | cat - $(JS_FINAL) > $(TMPFILE) && mv $(TMPFILE) $(JS_FINAL)

addheader: addheader-debug addheader-min

cleancss:
	@cat $(CSS_COMBINED) | $(CLEANCSS) $(CLEANCSSFLAGS) > $(CSS_FINAL)

combine-js:
	@cat $(JS_FILES) | $(JS_BEAUTIFY) $(BEAUTIFYFLAGS) > $(JS_DEBUG)

combine-css:
	@cat $(CSS_FILES) | $(POSTCSS) $(POSTCSSFLAGS) > $(CSS_COMBINED)

watch-js: $(SRC_DIR)
	@$(NODEMON) --on-change-only --watch $^ --ext js --exec "make build-js"

watch-css: $(SRC_DIR)
	@$(NODEMON) --on-change-only --watch $^ --ext css --exec "make build-css"
	
.DEFAULT_GOAL := build
