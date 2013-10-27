#include "status_object.hpp"
#include "status_registry.hpp"
#include "status_server.hpp"

//
// This is an example usage of the status object, status registry and status server inside a process
// to get live status values.
//

class cache_stats : public status_object_base
{
public:
   cache_stats() : _hit_count(0), _miss_count(0), _size(0)
   {
      add_ref("hit", tag::COUNT, status_value::FINE, _hit_count,
              "Number of cache hits.");
      
      add_ref("miss", tag::COUNT, status_value::FINE, _miss_count,
              "Number of cache misses.");
      
      add_ref("size", tag::CURRENT, status_value::INFO, _size,
              "The current number of items in the cache.");
   }

   void hit(uint64_t size) 
   {
      boost::lock_guard<boost::mutex> lock(_mutex);
      _hit_count++;
      _size = size;
   }
  
   void miss(uint64_t size)
   {
      boost::lock_guard<boost::mutex> lock(_mutex);
      _miss_count++;      
      _size = size;
   }   
   
private:
   uint64_t _hit_count;
   uint64_t _miss_count;
   uint64_t _size;
};

int main()
{
   try {
      // Set up my cache stats, registry and status server.
      cache_stats cache_stats;
      status_registry status_registry;
      status_registry.reg("/cache", &cache_stats);
      status_server status_server(status_registry, "/example-usage-process");
      status_server.port(22200);
      status_server.start();
   }
   catch (std::exception& e) {
      std::cerr << e.what() << std::endl;
   }
}
