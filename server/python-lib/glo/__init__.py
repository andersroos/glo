from glo.server import Server


__all__ = ['Server', 'Registry', 'Tag', 'StatusItem']


class Registry(object):
    """ A container for StatusItems, a dict in a class. """

    def __init__(self):
        self.items = {}

    def register(self, item):
        """ Register StatusItem in registry using item.key as key. Duplicate registration will replace the item,
        it is a dict. """
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
    
    def __init__(self, key=None, path=None, tag=None, description=None, level=0, value=None):
        """
        Create a status item. Either key or (path and tag) should be set. Everything else is optional.

        :key: the fully concatenated key /path/as/with:tag

        :path: as a string

        :tag: one of Tags

        :description: description of the status item

        :level: the importance level wehre 0 is the highest

        :value: the initial status value, the value can also be a callable which will be called each time a value
        should be produced

        """
        if key:
            self.key = key
        else:
            self.key = "%s:%s" % (path, tag)

        self.description = description
        self.level = level
        if callable(value):
            self.value_fun = value
            self.value = None
        else:
            self.value_fun = None
            self.value = value

    def set(self, value):
        """ Set the value of this status item, callable not allowed here. """
        self.value = value

    def item(self):
        """ Return the status item as an item for the item list. """
        return {
            "key": self.key,
            "value": self.value if self.value_fun is None else self.value_fun(),
            "description": self.description,
            "lvl": self.level,
        }



