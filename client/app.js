import 'babel-polyfill';
import {Ui} from './ui.js';
import React from 'react';
import ReactDOM from 'react-dom';
import {$} from 'jquery';


ReactDOM.render(<Ui servers={[{key: 'test:1'}, {key:'test:2'}]}/>,
                document.getElementById("glo"));


// host:port => Server/TestServer for all discovered servers.
const servers = {};


// Try to connect to host and port once, success called on success with initial response.
function tryDiscover(host, port, success) {
    var url = "http://" + host + ":" + port;
    $.ajax({
               type: "GET",
               dataType: "json",
               url: url,
               success: success,
               timeout: 500
           });
}


// Try to 
function discover() {

}


const urlHostPorts = {};

var url = document.URL;
var index = url.indexOf('?');
var params = url.substr(index + 1);
if (index === -1) params = "localhost:22200";

$.each(params.split('&'),
       function(index, param) {
           var split = param.split(':');
           var host = split[0];
           var port = split[1] || -1;
           if (port == -1) for (i = 22200; i < 22216; ++i) discover(host, i);
           else discover(host, port);
       });



setInterval(update, 1000);


var Status = function(level) {

    // hosts => port => process
    var hosts = {};

    var lvl = level;

    // Discover processes at host and add dynamically whenever found.
    function discover(host, port) {
        if (host == 'test') {
            hosts[host] = hosts[host] || {};
            hosts[host][port] = hosts[host][port] || TestProcess(host, port, url, lvl);
            hosts[host][port].update();
            return;
        }
        port = port || 22200;
        var host;
        var url = "http://" + host + ":" + port + "/?callback=?";
        $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            success: function(json) {
                hosts[host] = hosts[host] || {};
                hosts[host][port] = hosts[host][port] || Process(host, port, url, lvl);
                hosts[host][port].update();
            },
            error: function(jqXHR, textStatus, errorThrown) {
            },
            timeout: 500});
    };

    return {
        // Rediscover new processes based on document URL (address in location bar).
        rediscover: function() {
            var url = document.URL;
            var index = url.indexOf('?');
            var params = url.substr(index + 1);
            if (index == -1) params = "localhost:22200";

            $.each(params.split('&'),
                   function(index, param) {
                       var split = param.split(':');
                       var host = split[0];
                       var port = split[1] || -1;
                       if (port == -1) for (i = 22200; i < 22216; ++i) discover(host, i);
                       else discover(host, port);
                   });
        },
        // Update all processes currently known and the info about them.
        update: function() {
            var processlist = "";
            $.each(hosts, function(host, ports) {
                $.each(ports, function(port, process) {
                    process.update();
                });
            });
        },
        filter: function(level) {
            lvl = level;
            $.each(hosts, function(host, ports) {
                $.each(ports, function(port, process) {
                    process.filter(lvl);
                });
            });
        }
    }
};

