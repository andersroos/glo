# Glo #

Copyright (c) Anders Roos. Licensed under the [MIT License].

## About ##

Javascrip client for Glo servers.

## Usage ##

<glo html>?<host>:<port>&<host>:<port>&...

Example: file:///tmp/glo.html?localhost:22200&localhost:22201

If port is omitted it will scan ports from 22000 to 22100 and show all
servers it finds.

Example: file:///tmp/glo.html?localhost

To get random test data you can also use the special host "test".

Example: file:///tmp/glo.html?test:123&test:321
