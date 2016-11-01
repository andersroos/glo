
.PHONY: default dev publish clean init

default: dev

init:
	pip3 install -r requirements.txt --upgrade

dev:
	pip3 install -e .

publish: clean
	python3 setup.py sdist
	python3 setup.py bdist_wheel
	twine upload dist/*

clean:
	rm -rf dist glo.egg-info build

