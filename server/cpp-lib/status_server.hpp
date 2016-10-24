#ifndef GLO_STATUS_SERVER_HPP
#define GLO_STATUS_SERVER_HPP

#include <boost/asio.hpp>
#include <boost/bind.hpp>
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

using boost::asio::ip::tcp;

class status_server
{
public:
   status_server(status_registry& registry, const std::string& server_path_prefix)
      : _status_registry(registry), _server_path_prefix(server_path_prefix),
        _port(0), _sleep_us(50000) {}

   // Set the port, if not set the first available port from 22200 will be used. Port 22200-22272
   // are unassigned according to http://www.iana.org/assignments/port-numbers.
   // TODO Autmatic port assigment not implemented.
   void port(uint16_t port)
   {
      _port = port;
   }

   // Get the actual port used if not manually set (available after start).
   in_port_t port()
   {
      return _port;
   }

   // Set the sleep time in microseconds after each served request.
   void throttling_sleep(uint64_t sleep_us=50000)
   {
      _sleep_us = sleep_us;
   }
   
   // Start listening for requests. This method will not return. But it will contain boost
   // interruption_points at strategic places so an interrupt should be possible.
   //
   // \throws TODO if it fails to start listening on port or if there is a unrecovarable
   // communications error
   void start()
   {
      boost::asio::io_service io_service;
      
      tcp::endpoint endpoint(tcp::v4(), _port);
      tcp::acceptor acceptor(io_service, endpoint);

      while (true) {
         
         boost::asio::ip::tcp::socket socket(io_service);
         std::cerr << "Listening on port " << _port << "." << std::endl;
         acceptor.accept(socket);
         std::cerr << "Got connection." << std::endl;

         boost::asio::streambuf request_buffer;
         
         boost::system::error_code error;
         size_t length = boost::asio::read_until(socket, request_buffer, "nice", error);
         std::cerr << "Error: " << error << std::endl;
         std::cerr << "Got " << length << " bytes." << std::endl;
         std::string data((std::istreambuf_iterator<char>(&request_buffer)),
                          std::istreambuf_iterator<char>());
         std::cerr << "Data: " << data << std::endl;
         boost::asio::write(socket, boost::asio::buffer("Bye!"), error);
         std::cerr << "Closing connection." << std::endl;

         // repsonse buffer
      }
   }
         

   // Same as start but more comvenient to use with boost thread.
   void operator()()
   {
      start();
   }


private:

   const status_registry& _status_registry;
   const std::string& _server_path_prefix;
   uint16_t _port;
   uint64_t _sleep_us;
};

#endif
