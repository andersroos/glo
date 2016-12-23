# Glo #

Copyright (c) Anders Roos. Licensed under the [MIT License](https://github.com/andersroos/LICENSE.txt).

## About ##

A simple status data format, javascript client and server libraries
for live monitoring of server status in other repos. It is extremly
valueble to be able to get specific measurements or data points from a
system, either for debugging or for just understanding the system
better.

This is inspired by JMX and MBeans, but read only and simpler to
use. The basic idea is to only specify a JSON message format and leave
the rest to each implementation.

## Related Repositories ##

* [Javscript Client](http://github.com/andersroos/glo-client)

* [C++ Server Library](http://github.com/andersroos/glo-cpplib)

* [Python Server Library](http://github.com/andersroos/glo-pylib)

## Status Data Format ##

The status format is used to get status items from a server to display
or aggregate.

The format can also be used to push status item updates to a remote
registry. For example batch programs may not have their own servers
but report status data items to a server.

The status data is communicated through JSON, either plain JSON or
wrapped in a JSONP callback.

Normally the status data is serverd from a HTTP-server and responding
with all status items on `/`. If providing the query parameter
`callback` the response will be wrapped in a jsonp callback.

### Message Format ###

The current version is 3.

    {
      "version": <number, the current version>,
      "timestamp": <number, server time since EPOC in seconds>,
      "items": [
        {
          "key": <string, path + ':' + tag + ['-' + type],
                  path is an hierarchical name separated by / all chars but : are allowed,
                  the tag describes the value in a machine readable way described below,
                  the type part is optional and types are described below,
                  the full key should be unique in the message>,
          "value": <number or string>,
          "level": <number or string, level of importance where 0 is the highest, can
                    also be a symbol each representing a number, see below>,
          "desc": <string, a human readable description>,
        },
        ...
      ]
    }

To make clients complatible with future versions they should silently
ignore unrecognized keys.

### Tags ####

Currently available tags are (clients should just present unknown tags
as they are, but known tags can/will be used to present calcualted
values, for example total and count can be combined into average):

<table>
  <tr><th>Tag</th>                <th>Description</th>                                                                               <th colspan=2>Deduced Type From JSON Types</th> </tr>
  <tr><th></th>                   <th></th>                                                                                          <th align=left>number</th> <th align=left>string</th> </tr>
  <tr><th align=left>count</th>   <td>A counter that increases over time. For example a request counter.</td>                        <td align=left>int</td>    <td align=left>N/A</td>    </tr>
  <tr><th align=left>current</th> <td>A current value. For example the numer of objects in a cache.</td>                             <td align=left>int</td>    <td align=left>string</td> </tr>
  <tr><th align=left>last</th>    <td>The last value of something. For example the size of the last request or a status string.</td> <td align=left>int</td>    <td align=left>string</td> </tr>
  <tr><th align=left>total</th>   <td>A total sum of something. For example the total duration of all requests.</td>                 <td align=left>int</td>    <td align=left>string</td> </tr>
  <tr><th align=left>max</th>     <td>The max value of something. For example the max number of objects in a cache.</td>             <td align=left>int</td>    <td align=left>string</td> </tr>
  <tr><th align=left>min</th>     <td>The min value of something. For example the min number of objects in a cache.</td>             <td align=left>int</td>    <td align=left>string</td> </tr>
</table>

### Types ###

Defined types, types are optional and will be deduced from tag (and
value) if not given, see tags. Type may also be needed to make keys
unique even if the type gets deduced correctly.
<table>
  <tr><th>Type</th>                 <th>Description</th>                        <th>JSON Type</th>  </tr>
  <tr><th align=left>int</th>       <td>An integer.</td>                        <td>number</td>     </tr>
  <tr><th align=left>float</th>     <td>A float.</td>                           <td>number</td>     </tr>
  <tr><th align=left>duration</th>  <td>A duration in seconds.</td>             <td>number</td>     </tr>
  <tr><th align=left>timestamp</th> <td>The number of seconds since EPOCH.</td> <td>number</td>     </tr>
  <tr><th align=left>string</th>    <td>A string.</td>                          <td>string</td>     </tr>
  <tr><th align=left>bool</th>      <td>A bool.</td>                            <td>true/false</td> </tr>
</table>

### Levels ###

Named levels, each named level represents a number where 0 is the highest level of importance.
<table>
  <tr><th>Level Symbol</th>       <th>Level</th> </tr>
  <tr><th align=left>highest</th> <td>0</td>     </tr>
  <tr><th align=left>high</th>    <td>1</td>     </tr>
  <tr><th align=left>medium</th>  <td>2</td>     </tr>
  <tr><th align=left>low</th>     <td>3</td>     </tr>
  <tr><th align=left>lowes</th>   <td>4</td>     </tr>
</table>

### Message Example ###

    {
      "version": 3,
      "timestamp": 1313152128.209000,
      "items": [
        {
          "key": "/server/request:count",
          "value": "45023",
          "desc": "Number of requests to server.",
          "level": "high",
        },
        {
          "key": "/server/cache/size:max",
          "value": 134,
          "desc": "The max cache size.",
          "level": "medium",
        },
        {
          "key": "/server/request:last-timestamp",
          "value": "1313152128.209000",
          "desc": "The time of the last request.",
          "level": 3
        },
        {
          "key": "/server/request:last-duration",
          "value": "0.000012",
          "desc": "The duration of the last request.",
          "level": 2,
        }
      ]
    }

### Changes From Version 3 ###

* Added named symbols usable as levels.

* Changed timestamp to float and seconds from int and microseconds.

* Introduced types and removed tags that was used for typing.

* Changed name of data to items.

### Changes From Version 2 ###

* Renamed lvl to level.

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

## Source ##

The source can be found at [GitHub](https://github.com/andersroos/glo).
