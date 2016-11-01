from setuptools import setup
from codecs import open
from os import path

setup_dir = path.abspath(path.dirname(__file__))

with open(path.join(setup_dir, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='glo',
    version='0.0.0.dev1',
    description='Library for using Glo monitoring in Python.',
    long_description=long_description,
    url='https://github.com/andersroos/glo',
    author='Anders Roos',
    author_email='anders.roos@gmail.com',
    license='MIT',
    classifiers=[
        'Development Status :: 1 - Planning',
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Topic :: System :: Monitoring',
    ],
    keywords='',
    packages=["glo"],
)
