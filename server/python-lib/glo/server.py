from logging import getLogger


logger = getLogger("glo")


class Server(object):
    """ Server for serving StatusItems in a Registry by the Glo message format using a HTTP server. """

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


