
.PHONY: doc

doc: README.html

README.html:
	markdown README.md > $@
