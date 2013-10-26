
.PHONY: all doc build

all: build

doc: README.html

README.html: README.md
	markdown $< > $@

build: doc

clean:
	rm -f README.html
	find . -name "*.gch" | xargs rm -f
