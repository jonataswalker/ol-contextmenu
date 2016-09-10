SHELL		:= /bin/bash
NOW		:= $(shell date --iso=seconds)
ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build
TMPFILE 	:= $(BUILD_DIR)/tmp
TEST_DIR 	:= $(ROOT_DIR)/test/spec/
TEST_INC_FILE 	:= $(ROOT_DIR)/test/include.js

define GetFromPkg
$(shell node -p "require('./package.json').$(1)")
endef

LAST_VERSION	:= $(call GetFromPkg,version)
DESCRIPTION	:= $(call GetFromPkg,description)
PROJECT_URL	:= $(call GetFromPkg,homepage)

JS_DEBUG	:= $(ROOT_DIR)/$(call GetFromPkg,rollup.dest)
JS_FINAL	:= $(ROOT_DIR)/$(call GetFromPkg,main)

CSS_COMBINED 	:= $(BUILD_DIR)/ol3-contextmenu.css
CSS_FINAL 	:= $(BUILD_DIR)/ol3-contextmenu.min.css

JS_SRC 		:= $(SRC_DIR)/js
SASS_SRC 	:= $(SRC_DIR)/sass
SASS_VENDOR_SRC	:= $(SASS_SRC)/vendor

SASS_MAIN_FILE 	:= $(SASS_SRC)/main.scss


NODE_MODULES	:= ./node_modules/.bin

CLEANCSS 	:= $(NODE_MODULES)/cleancss
CLEANCSSFLAGS 	:= --skip-restructuring

POSTCSS 	:= $(NODE_MODULES)/postcss
POSTCSSFLAGS 	:= --use autoprefixer -b "last 3 versions, ie >= 9" --replace

ESLINT 		:= $(NODE_MODULES)/eslint

UGLIFYJS 	:= $(NODE_MODULES)/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 -c warnings=false

NODEMON 	:= $(NODE_MODULES)/nodemon
PARALLELSHELL 	:= $(NODE_MODULES)/parallelshell

SASS	 	:= $(NODE_MODULES)/node-sass
SASSFLAGS	:= --importer node_modules/node-sass-json-importer/dist/node-sass-json-importer.js

ROLLUP	 	:= $(NODE_MODULES)/rollup
ROLLUPFLAGS 	:= -c config/rollup.config.js

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
.PHONY: default
default: help

.PHONY: help
help:
	@echo
	@echo "The most common targets are:"
	@echo
	@echo "- install                 Install node dependencies"
	@echo "- build                   Build JavaScript and CSS files"
	@echo "- build-watch             Build files and watch for modifications"
	@echo "- test                    Run unit tests in the console"
	@echo "- help                    Display this help message"
	@echo
	@echo "Other less frequently used targets are:"
	@echo
	@echo "- lint                    Check the code with the linter"
	@echo "- build-js                Build JavaScript files"
	@echo "- build-css               Build CSS files"
	@echo "- ci                      Run the full continuous integration process"
	@echo


.PHONY: npm-install
npm-install: install

.PHONY: install
install: package.json
	@mkdir -p $(@D)
	npm install
	@touch $@

build-watch: build watch

watch:
	$(PARALLELSHELL) "make watch-js" "make watch-css"

.PHONY: ci
ci: build test

.PHONY: test
test: build
	@$(CASPERJS) $(CASPERJSFLAGS)

.PHONY: build
build: install build-js build-css

.PHONY: build-js
build-js: bundle-js lint uglifyjs add-js-header
	@echo `date +'%H:%M:%S'` " - build JS ... OK"

.PHONY: build-css
build-css: compile-sass prefix-css cleancss add-css-header
	@echo `date +'%H:%M:%S'` "Build CSS ... OK"

.PHONY: compile-sass
compile-sass: $(SASS_MAIN_FILE)
	@$(SASS) $(SASSFLAGS) $^ $(CSS_COMBINED)

.PHONY: prefix-css
prefix-css: $(CSS_COMBINED)
	@$(POSTCSS) $(POSTCSSFLAGS) $^

.PHONY: bundle-js
bundle-js:
	@$(ROLLUP) $(ROLLUPFLAGS)

.PHONY: uglifyjs
uglifyjs: $(JS_DEBUG)
	@$(UGLIFYJS) $^ $(UGLIFYJSFLAGS) > $(JS_FINAL)

.PHONY: lint
lint: $(JS_SRC)
	@$(ESLINT) $^

.PHONY: add-js-header-debug
add-js-header-debug: $(JS_DEBUG)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-js-header-min
add-js-header-min: $(JS_FINAL)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-js-header
add-js-header: add-js-header-debug add-js-header-min

.PHONY: add-css-header-debug
add-css-header-debug: $(CSS_COMBINED)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-css-header-min
add-css-header-min: $(CSS_FINAL)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-css-header
add-css-header: add-css-header-debug add-css-header-min

.PHONY: build
cleancss: $(CSS_COMBINED)
	@cat $^ | $(CLEANCSS) $(CLEANCSSFLAGS) > $(CSS_FINAL)

watch-js: $(JS_SRC)
	@$(NODEMON) --on-change-only --watch $^ --ext js --exec "make build-js"

watch-css: $(SASS_SRC)
	@$(NODEMON) --on-change-only --watch $^ --ext scss --ignore $(SASS_VENDOR_SRC) --exec "make build-css"
	
.DEFAULT_GOAL := default
