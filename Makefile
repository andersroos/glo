
.PHONY: default build

default: build

build:

clean:
	find . -name "*.gch" | xargs rm -f
