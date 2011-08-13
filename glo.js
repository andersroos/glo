
// Takes a name and turns it into something usable as a html id.
function id(key) {
    return key.replace(/[:/]/g, '-');
}

var Value = function(key) {

    var tdvalue = $("#" + id(key) + " .value");
    
    return {
        // Update the value with the newest data.
        update: function(newvalue, timestamp) {
            tdvalue.text(newvalue);
        }
    };
}

var Process = function(host, port, url) {

    var hostport = host + ":" + port;
    var failed = false;
    var data = {};
    
    $("#data").append("<tr id='" + id(hostport) + "'><th colspan='4'>" + hostport + "</th></tr>");

    function transformVersion(version, statusvalue) {
        var v = {};
        switch (version) {
        case 1:
            v = statusvalue;
            break;
        case undefined:
            v.key = statusvalue[0];
            v.value = statusvalue[1];
            v.desc = statusvalue[2];
            v.lvl = 1;
        }
        return v;
    }
    
    return {
        // Get latest data from server and update display.
        update: function() {
            if (!failed) {
                $.ajax({
                    type: "GET", 
                    dataType: "json",
                    url: url,
                    success: function(json) {
                        var lastid = id(hostport);
                        $.each(json.data, function(i, statusvalue) {
                            var v = transformVersion(json.version, statusvalue);
                            var row = $("#" + id(v.key));
                            if (row.length == 0) {
                                row = $("<tr id='" + id(v.key) + "' class='lvl" + v.lvl + "  " + id(hostport) + "'><td>" + v.key + "</td>" +
                                        "<td class=value></td><td></td><td class=desc>" + v.desc + "</td></tr>");
                                row.insertAfter("#" + lastid);
                                row.data(Value(v.key));
                            }
                            row.data().update(v.value, json.timestamp);
                            lastid = id(v.key);
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $("tr." + id(hostport)).css('color', 'darkred');
                        failed = true;
                    },
                    timeout: 500});
            }
        },
        // Reset the fail flag to make it try an update again.
        retry: function() {
            $("." + id(hostport)).css('color', '');
            failed = false;
        }
    };
};

var Status = function() {

    // hosts => port => process
    var hosts = {};
    
    // Discover processes at host and add dynamically whenever found.
    function discover(host, port) {
        port = port || 22200;
        var host;
        var url = "http://" + host + ":" + port + "/?callback=?";
        $.ajax({
            type: "GET", 
            dataType: "json",
            url: url,
            success: function(json) {
                hosts[host] = hosts[host] || {};
                hosts[host][port] = hosts[host][port] || Process(host, port, url);
                hosts[host][port].retry();
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
        }
    }
};

var s = Status();

$(function() {
    s.rediscover();
    setInterval(s.update, 1000);
    //setTimeout("s.update()", 1000);
    //setTimeout("s.update()", 2000);
});
