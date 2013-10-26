
.PHONY: doc

doc: README.html

README.html: README.md
	markdown $< > $@
