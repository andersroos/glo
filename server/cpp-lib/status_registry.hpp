#ifndef GLO_STATUS_REGISTRY_HPP
#define GLO_STATUS_REGISTRY_HPP

#include <set>
#include <map>

#include <boost/thread.hpp>

#include "status_object.hpp"

//
// The status_registry is a place to register status_objets so that others (the staus server) can
// read them. Registration is done with a path (/-separated). In the status message from the server
// the actual values will end up with the key [<server prefix path>/]<path>/<name>:<tag>.
//

class status_registry
{
public:

   status_registry() : _registry(), _mutex() {}

   // Register a status object with a path (key).
   void reg(const std::string& key, const status_object* object)
   {
      boost::lock_guard<boost::mutex> lock(_mutex);
      _registry[key] = object;
   }

   // List all registered paths (keys).
   std::set<std::string> keys() const
   {
      std::set<std::string> keys;
      boost::lock_guard<boost::mutex> lock(_mutex);
      for (std::map<std::string, const status_object*>::const_iterator i = _registry.begin();
           i != _registry.end(); ++i) {
         keys.insert(i->first);
      }
      return keys;
   }
   
   
   // Get the status object for a path (key).
   //
   // \return null if not found
   const status_object* get(const std::string& key) const
   {
      boost::lock_guard<boost::mutex> lock(_mutex);
      std::map<std::string, const status_object*>::const_iterator i = _registry.find(key);
      if (i == _registry.end()) {
         return NULL;
      }
      return i->second;      
   }

   virtual ~status_registry() {};

private:

   std::map<std::string, const status_object*> _registry;
   
   mutable boost::mutex _mutex;
};


#endif
