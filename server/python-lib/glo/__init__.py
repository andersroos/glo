from logging import getLogger


logger = getLogger("glo")


class StatusServer(object):
    """ Server for serving StatusItems in a StatusRegistry by the Glo message format using a HTTP server. """
    
    def __init__(self, registry, port=None, path='', sleep_time=0.5):
        """
        Create a status server to serve all the items in registry.

        :port: the port number for the server, if unset the first available port in the range 22200-22240 will be used
        :path: the HTTP path to serve the status for
        :sleep_time: sleep time after each request, this works a simple throttle to prevent too frequent requests
        """
        
        self._port = port
        self.registry = registry
        self.path = path
        self.sleep_time = sleep_time

    @property
    def port(self):
        """ Return the port used or None if no free port was found. """
        return self._port

    def serve_once(self, timeout=None):
        """ Block and wait for one request and then return. If timeout is set, timeout after timeout seconds. """
        pass

    def serve_forever(self, timeout=0):
        """ Block and server forever, not returning. """
        pass

    def start(self):
        """ Start serving in a new thread. """
        pass

    def stop(self):
        """ Stop the serving thread. """
        pass


class StatusRegistry(object):
    """ A container for StatusItems, a dict in a class. """

    def __init__(self):
        self.items = {}

    def register(self, item):
        """ Register StatusItem in registry using item.key as key. Duplicate registration will replace the item. """
        self.items[item.key] = item


class Tag(object):

    COUNT = 'count'
    CURRENT = 'current'
    LAST = 'last'
    LAST_DURATION_US = 'last-duration-us'
    TOTAL_DURATION_US = 'total-duration-us'
    MAX_US = 'max-us'


class StatusItem(object):
    """ Representing one status item (or value). """
    
    def __init__(self, key=None, path=None, tag=None, description=None, level=0, value=None, value_callback=None):
        """
        Create a status item. Either key or (path and tag) should be set. Everything else is optional.

        :key: the fully concatenated key /path/as/with:tag
        :path: as a string
        :tag: one of Tags
        :description: description of the status item
        :level: the importance level wehre 0 is the highest
        :value: the initial status value
        :value_callback: if set the value will be retrieved by calling it instead of returning the value
        """
        if key:
            self.key = key
        else:
            self.key = "%s:%s" % (path, tag)

        self.description = description
        self.level = level
        self.value = value
        self.value_callback = value_callback

    def set(self, value):
        """ Set the value of this status item. """
        self.value = value

    def item(self):
        """ Return the status item as an item for the item list. """
        return {
            "key": self.key,
            "value": self.value if self.value_callback is None else self.value_callback(),
            "description": self.description,
            "lvl": self.level,
        }
