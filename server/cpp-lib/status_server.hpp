#ifndef GLO_STATUS_SERVER_HPP
#define GLO_STATUS_SERVER_HPP

#include <netinet/in.h>

#include "status_registry.hpp"

//
// A class for servring status messages using a minimal HTTP server implementation (supports only
// GET and will close the connection after every request).
//
// The GET path acts as a filter and the response will contain all keys (<status object
// path>/<status value name>:<status value tag> that matches the path. The <server pregix path> will
// be prepended to each key after filtering.
//
// It is important that the server is not accessed to often because each request will access status
// objects which in turn will cause locking of mutexes shared with the actual business
// logic. Therefore the server is throttled by sleeping 50 ms after each request. This is
// configurable.
//
// It is possible to get the reposnse in three formats (controlled by HTTP query parameters):
//
// text/plain: human readable default
//
// application/json: by adding json as a request parameter
//
// application/javascript: by adding callback=<javascript function name> as a request parameter,
//                         this will work nice together with for example jQuery.getJSON.
//

class status_server
{
public:
   status_server(status_registry& registry, const std::string& server_path_prefix);

   // Set the port, if not set the first available port from 22200 will be used.
   void port(in_port_t port);

   // Get the actual port used if not manually set (available after start).
   in_port_t port();

   // Set the sleep time in microseconds after each served request.
   void throttling_sleep(long sleep_us=50000);
   
   // Start listening for requests. This method will not return. But it will contain boost
   // interruption_points at strategic places so an interrupt should be possible.
   //
   // \throws TODO if it fails to start listening on port or if there is a unrecovarable
   // communications error
   //
   void start();

   // Same as start but more comvenient to use with boost thread.
   void operator()();
};




#endif
