Glo
===

Copyright (c) Anders Roos. Licensed under the [MIT License].

About
-----

A javascript program for monitoring status values by getting data as
JSON/javascript callback periodically.

The status data is received from port 22200 to 22216 by default. Those
are unassigned according to [IANA port assignments].

Status Data Format
------------------

The status data is communicated through JSON, either plain JSON or
wrapped in a Javascript callback.

    {
        "version": <number, the current version>,
        "timestamp": <number, server time since EPOC in milliseconds>,
        "data": [ { "key": "<string, name + : + tag>",
                    "value": "<string, the value as a string>",
                    "desc": "<string, a human readable description>",
                    "lvl": "<number, level of importance where 0 is the highest> },
                  ... ]
    }

Example:

    {
        "version": 1,
        "timestamp": 1313152128209,
        "data": [
            { "key": "\/server\/request:count",
              "value": "45023",
              "desc": "Number of successful requests to server.",
              "lvl": 1 },
            { "key": "\/server\/request:last-duration-us",
              "value": "12323090239",
              "desc": "The duration of the last request in microseconds.",
              "lvl": 2 }
        ]
    }
        
Source
------

The source can be found at [GitHub].

[MIT License]: http://github.com/andersroos/LICENSE.txt
[GitHub]: http://github.com/andersroos/glo
[IANA port assignments]: http://www.iana.org/assignments/port-numbers
