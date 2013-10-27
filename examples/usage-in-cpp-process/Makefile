CXXFLAGS=-g -I../../server/cpp-lib
LDFLAGS= -lboost_system

.PHONY: clean all

all: main

main: main.o
	g++ -o $@ $^ $(LDFLAGS)

clean:
	rm -f *.o main