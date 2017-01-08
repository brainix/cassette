#-----------------------------------------------------------------------------#
#   Makefile                                                                  #
#                                                                             #
#   Copyright © 2016-2017, Rajiv Bakulesh Shah, original author.              #
#   All rights reserved.                                                      #
#-----------------------------------------------------------------------------#



install:
	-xcode-select --install
	command -v brew >/dev/null 2>&1 || \
		ruby -e "$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	brew analytics off
	brew analytics regenerate-uuid
	brew install node
	npm install

upgrade:
	brew update
	brew upgrade
	brew cleanup
	-npm outdated
	npm update --save
	npm update --save-dev
	-npm outdated
	git status
	git diff
