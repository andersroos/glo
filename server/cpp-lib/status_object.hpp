#ifndef GLO_STATUS_OBJECT_HPP
#define GLO_STATUS_OBJECT_HPP

#include <vector>
#include <string>

#include <boost/shared_ptr.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/thread/lock_guard.hpp>
#include <boost/lexical_cast.hpp>

//
// This file contains the following:
//
// tag: Constants for current tags.
//
// status_value: API for a single status value.
//
// status_value_base: Base class for implementing status values.
//
// referring_status_value: A status value where the actual value is a refernce to a variable.
//
// status_object: API for a class holding multiple status values that belongs together, can be put
//                into a status registry.
//
// status_object_base; Base class for implementing status objects.
//

//
// Constants for current tags.
//  

namespace tag {
   
   static const std::string COUNT("count");
   static const std::string CURRENT("current");
   static const std::string LAST("last");
   static const std::string LAST_US("last-duration-us");
   static const std::string TOTAL_US("total-duration-us");
}


//
// API for a single status value.
//

class status_value
{
public:

   // The level, designates how important the value is, realted to filter level in client.
   enum level {
      SUMM,
      INFO,
      FINE,
      DEBG, 
   };
   
   // The name part of the status value. This forms a key togheter with the tag.
   virtual std::string name() const = 0;
   
   // The tag of this status value. This forms a key together with the name.
   virtual std::string tag() const = 0;

   // The full key.
   virtual std::string key() { return name() + ":" + key(); }
   
   // The value, a string but can be interpreted correctly using the tag.
   virtual std::string value() const = 0;

   // Human readable description of this status value.
   virtual std::string description() const = 0;

   // The level of importance.
   virtual level lvl() const = 0;
   
   virtual ~status_value() {}
};

typedef boost::shared_ptr<status_value> status_value_ptr;


//
// Base class for implementing status values.
//

class status_value_base : public status_value
{
public:
   
   status_value_base(const std::string& name, const std::string& tag,
                     const status_value::level& lvl, const std::string& description)
      : _name(name), _tag(tag), _lvl(lvl), _description(description) {}
   
   virtual std::string name() const { return _name; }

   virtual std::string tag() const { return _tag; }
   
   virtual std::string description() const { return _description; }

   virtual status_value::level lvl() const { return _lvl; }
   
   virtual ~status_value_base() {}
   
private:
   std::string _name;
   std::string _tag;
   status_value::level _lvl;
   std::string _description;
};


//
// A status value where the actual value is a reference to a variable. Used in the implementation of
// status_object_base.
//

template<class T>
class referring_status_value : public status_value_base
{
public:
   
   referring_status_value(const std::string& name, const std::string& tag,
                          const status_value::level& lvl, T& value,
                          const std::string& description)
      : status_value_base(name, tag, lvl, description), _value(value) {}
   
   virtual std::string value() const { return boost::lexical_cast<std::string>(_value); }
   
   virtual ~referring_status_value() {}
   
private:
   T& _value;
};


//
// API for a class holding multiple status values that belongs together.
//
// A status object should not contain two values with the same <name, type> pair. The status object
// can be put at a path in a status registry.
//

typedef std::vector<status_value_ptr> status_value_list;
typedef boost::shared_ptr<status_value_list> status_value_list_ptr;

class status_object
{
public:

   //
   // Return a list of status values.
   //
   // This method has to support multimple threads calling it at once. In case the actual values in
   // the list are shared they also should suport support multi threaded access.  (In the
   // status_object_base implementation the values in the list are copied.)
   //
   virtual status_value_list_ptr values() const = 0;
   
   virtual ~status_object() {};
   
};


//
// This is an implementation of status_object that can be used as a base class for status objects.
//
// It provides a protected mutex that is used when copying data from values in this status object to
// a returned value list. This mutex is good to use when updating values held by the status
// object. See examples.
//

class status_object_base : public status_object
{

   class value_impl : public status_value_base
   {
   public:
      value_impl(const std::string& name, const std::string& tag,
                 const status_value::level& lvl, const std::string& value,
                 const std::string& description)
         : status_value_base(name, tag, lvl, description), _value(value) {}
      
      virtual std::string value() const { return _value; }
      
   private:
      std::string _value;
   };
   
public:
   status_object_base() : _mutex(), _values() {}

   virtual status_value_list_ptr values() const
   {
      status_value_list_ptr values(new status_value_list());
      {
         boost::lock_guard<boost::mutex> lock(_mutex);
         for (status_value_list::const_iterator i = _values.begin(); i != _values.end(); ++i) {
            values->push_back(status_value_ptr(new value_impl((*i)->name(),
                                                              (*i)->tag(),
                                                              (*i)->lvl(),
                                                              (*i)->value(),
                                                              (*i)->description())));
         }
      }
      
      return values;
   }
   
   virtual ~status_object_base() {};

protected:

   // Add a new value to be handled by this status object (to the end of the list).
   void add(status_value_ptr value)
   {
      boost::lock_guard<boost::mutex> lock(_mutex);
      _values.push_back(value);      
   }

   // Add a ReferringStatusValue to this status object.
   template<class T>
   void add_ref(const std::string& name, const std::string& tag,
                const status_value::level& lvl, T& value,
                const std::string& description)
   {
      add(status_value_ptr(new referring_status_value<T>(name, tag, lvl, value, description)));
   }

   //
   // Boost mutex for accessing the addded status values. If type of the values is non basic or
   // complete accuracy is wanted, locking this when updating is mandatory.
   //
   // For RAII locking: boost::lock_guard<boost::mutex> lock(_mutex);
   //
   mutable boost::mutex _mutex;
   
private:
   
   status_value_list _values;
};

#endif
