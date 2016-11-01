# Glo #

Copyright (c) Anders Roos. Licensed under the [MIT License].

## About ##

A simple status data format, javascript client and server libraries
for live monitoring of server status. It is extremly valueble to be
able to get specific measurements or data points from a system, either
for debugging or for just understanding the system better.

This is inspired by JMX and MBeans, but read only and much simpler to
use. The basic idea is to only specify a JSON message format and leave
the rest to each implementation.

## Status Data Format ##

The status data is communicated through JSON, either plain JSON or
wrapped in a Javascript callback.

### Message Format ###

The current version is 2

    {
      "version": <number, the current version>,
      "timestamp": <number, server time since EPOC in microseconds>,
      "data": [
        {
          "key": <string, path + ':' + tag, path is an hierarchical name separated by /, tags are described below >, TODO Change back to string + string?
          "value": <number or string, the type of value will>,
          "desc": <string, a human readable description>,
          "lvl": <number, level of importance where 0 is the highest> TODO Change to level? Change to named levels?
          TODO Change tag to type + tag?
        },
        ...
      ]
    }

To make clients complatible with future versions they should silently
ignore unrecognized keys in the top dict and in the data dicts.
    
### Tags ####

Currently available tags are:
<table>
  <tr><th align=left>count</th><td>A counter that increases over time. For example a request counter. Positive integer.</td></tr>
  <tr><th align=left>current</th><td>A current value. For example the numer of objects in a cache. Any number.</td></tr>
  <tr><th align=left>last</th><td>The last value of something. For example the size of the last request or a status string. Any string or number.</td></tr>
  <tr><th align=left>last-duration-us</th><td>The last duration in microseconds. For example the last duration of processing a request. Positive number.</td></tr>
  <tr><th align=left>total-duration-us</th><td>The total duration in microseconds, a value that will increase over time. For example the total duration of pricessing all requests. Positive number.</td></tr>
  <tr><th align=left>max-us</th><td>The maximum time of something in microseconds. For example the maximum time to process a request. Positive number.</td></tr>
</table>

### Changes From Version 1 ###

* Key is now hierarchical.

* Number values allowed.

* Added info by tag how value will be interpreted.

* Changed timestamp to be in microseconds to make all times microseconds.

### Changes From Version 0 ###

* The version number was added. This was added to make the code be able to distinguish between versions.

* The data changed from a list of lists to a list of dicts containing
  the keys "key", "value", "desc", "lvl". This was done to make it
  easier to extend the data entries without breaking existing
  implementations. Clients should ignore keys they don't recognize.

### Message Example ###

    {
      "version": 2,
      "timestamp": 1313152128209000,
      "data": [
        {
          "key": "/server/request:count",
          "value": "45023",
          "desc": "Number of successful requests to server.",
          "lvl": 1
        },
        {
          "key": "/server/cache/size:current",
          "value": "134",
          "desc": "The current cache size.",
          "lvl": 2
        },
        {
          "key": "/server/cache/miss:count",
          "value": "23",
          "desc": "Number of cache misses.",
          "lvl": 3
        },
        {
          "key": "/server/cache/hit:count",
          "value": "224233",
          "desc": "Number of cache hits.",
          "lvl": 3
        },
        {
          "key": "/server/request:last-duration-us",
          "value": "12323090239",
          "desc": "The duration of the last request in microseconds.",
          "lvl": 2
        }
      ]
    }

### Previous Versions ###

List of old versions.

#### Version 1 ####

    {
      "version": <number, the current version>,
      "timestamp": <number, server time since EPOC in milliseconds>,
      "data": [
        {
          "key": "<string, name + : + tag>",
          "value": "<string, the value as a string>",
          "desc": "<string, a human readable description>",
          "lvl": "<number, level of importance where 0 is the highest>
        },
        ...
      ]
    }

#### Version 0 ####

Version 0 was never publicly released.

    {
      timestamp: <timestamp ms>,
      data: [
        ["<key>", "<value>", "<description>"],
        ...
      ]
    }


## Source ##

The source can be found at [GitHub].

[MIT License]: http://github.com/andersroos/LICENSE.txt
[GitHub]: http://github.com/andersroos/glo
