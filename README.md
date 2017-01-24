# Glo #

Copyright (c) Anders Roos. Licensed under the [MIT License](https://github.com/andersroos/LICENSE.txt).

**WARNING: The data formats are still in development and changes frequently.**

## About ##

A simple status data format for monitoring of process internals. See
below for javascript client and server libraries.

To be able to get specific measurements or data points from a system
can be very useful, either for debugging or for just understanding the
system better. Logging, debugging or other alternative methods
sometimes affect the system too much and can't be run in production.

This is inspired by JMX and MBeans, but is read only and (hopefully)
simpler to use. This repo only specifies JSON message formats and
leave the rest to each implementation.

## Related Repositories ##

* [Javscript Client](http://github.com/andersroos/glo-client)

* [C++ Server Library](http://github.com/andersroos/glo-cpplib)

* [Python Server Library](http://github.com/andersroos/glo-pylib)

## Status Data Format ##

The status format is used to get status items from a server to
display, aggregate, store or whatever.

The format can also be used to push status item updates to a remote
registry. For example batch programs may not have their own servers
but report status items to a server.

The status data is communicated through JSON, either plain JSON or
wrapped in a JSONP callback.

Normally the status data is serverd from a HTTP-server and responding
with all status items on `/` or another path. If providing the query
parameter `callback` the response will be wrapped in a jsonp callback.

### Message Format ###

The current version is 4.

    {
      "version": <number, the current version>,
      "timestamp": <number, server time since EPOC in seconds>,
      "items": [
        {
          "key": <string, path + ':' + tag + ['-' + tag ...],
                  path is an hierarchical name separated by / all chars but : are allowed,
                  the tag describes the value in a human and machine readable way described below,
                  the full key should be unique in the message>,
          "value": <number, string or bool>,
          "level": <number or string, level of importance where 0 is the highest, can
                    also be a symbol each representing a number, see below>,
          "desc": <string, a human readable description>,
        },
        ...
      ]
    }

### Tags ####

Tags are used to add information about a value for both the human and
(possibly) the machine. A client can use tags to present values in a
better way (for example formatted time). Or it can be used to combine
values with the same key, like total and count into average.

A client should always display unknown tags or unexpected tag type
combinations as is (even if the machine can't make any sense of it).

If using multiple tags they should be separated by '-'. Be warned
using too many tags will probably make the machine confused and unable
to present a value in any but the most basic way.

A tag can be any string not containing '-' or ':'.

<table>
  <tr><th>Tag</th>                 <th>Description</th>                                                                               <th>Recommended JSON Type</th>                </tr>
  <tr><th align=left>count</th>    <td>A count of something probably strictly increasing. For example a request counter.</td>         <td align=left>number (without fraction)</td> </tr>
  <tr><th align=left>size</th>     <td>A size of something. For example number of obejcts in a cache.</td>                            <td align=left>number</td>                    </tr>
  <tr><th align=left>last</th>     <td>The last value of something. For example the last status string returned.</td>                 <td align=left>number, string or bool</td>    </tr>
  <tr><th align=left>total</th>    <td>A total sum of something. For example the total size of all requests.</td>                     <td align=left>number</td>                    </tr>
  <tr><th align=left>max</th>      <td>The max value of something. For example the max number of objects in a cache.</td>             <td align=left>number</td>                    </tr>
  <tr><th align=left>min</th>      <td>The min value of something. For example the min number of objects in a cache.</td>             <td align=left>number</td>                    </tr>
  <tr><th align=left>average</th>  <td>The average of something. For example the average response size.</td>                          <td align=left>number</td>                    </tr>
  <tr><th align=left>current</th>  <td>A current value. Just a value.</td>                                                            <td align=left>number, string or bool</td>    </tr>
  <tr><th align=left>duration</th> <td>A duration in seconds. For example last request duration.</td>                                 <td align=left>number</td>                    </tr>
  <tr><th align=left>time</th>     <td>A timestamp. The number of seconds since EPOCH.</td>                                           <td align=left>number</td>                    </tr>
</table>

### Levels ###

Named levels, each named level represents a number where 0 is the highest level of importance.
<table>
  <tr><th>Level Symbol</th>       <th>Level</th> </tr>
  <tr><th align=left>highest</th> <td>0</td>     </tr>
  <tr><th align=left>high</th>    <td>1</td>     </tr>
  <tr><th align=left>medium</th>  <td>2</td>     </tr>
  <tr><th align=left>low</th>     <td>3</td>     </tr>
  <tr><th align=left>lowest</th>  <td>4</td>     </tr>
</table>

### Message Example ###

    {
      "version": 3,
      "timestamp": 1313152128.209000,
      "items": [
        {
          "key": "/server/cache:max-size",
          "value": 134,
          "desc": "The max cache size.",
          "level": "medium",
        },
        {
          "key": "/server/request:count",
          "value": "45023",
          "desc": "Number of requests since server restart.",
          "level": "high",
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

### Changes From Version 4 ###

* Merged tag and types.

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
