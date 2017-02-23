#-----------------------------------------------------------------------------#
#   Makefile                                                                  #
#                                                                             #
#   Copyright © 2016-2017, Rajiv Bakulesh Shah, original author.              #
#   All rights reserved.                                                      #
#-----------------------------------------------------------------------------#



install upgrade: formulae := {node}



install:
	-xcode-select --install
	command -v brew >/dev/null 2>&1 || \
		ruby -e "$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	brew analytics off
	brew analytics regenerate-uuid
	brew install $(formulae)
	npm install

upgrade:
	brew update
	-brew upgrade $(formulae)
	brew cleanup
	npm prune
	-npm outdated
	npm update --save-dev
	npm update --save
	-npm outdated
	git status
	git diff

clean:
	rm -rf {public/*.bundle.js,public/*.style.css,stats.json}

uninstall:
	npm uninstall `ls -1 node_modules | tr '/\n' ' '`
