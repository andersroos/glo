
// Takes a name and turns it into something usable as a html id.
function idfy(key) {
    return key.replace(/[:/]/g, '-');
}

var Value = function(id) {

    var tdvalue = $("#" + id + " .value");
    
    return {
        // Update the value with the newest data.
        update: function(newvalue, timestamp) {
            tdvalue.text(newvalue);
        }
    };
}

var TestProcess = function(host, port, url) {
    
    var json = {
        version: 1,
        timestamp: new Date().getTime(),
        data: [
            {key: "/localhost/gloserver/request:count",
             value: "0",
             desc: "The number of requests to the process server.",
             lvl: 0}
        ]
    };
    
    var failed = false;
    
    var process = Process(host, port, url);
    
    var button = $("<button>good</button>")
    button.click(function() {
        failed = !failed;
        if (failed) button.text("failed")
        else button.text("good");
    });
    button.appendTo("#test-processes");
    
    process.update = function() {
        if (failed) {
            process.updated(undefined);
            return;
        }
        json.timestamp = new Date().getTime();
        json.data[0].value = (1 + parseInt(json.data[0].value)) + '';
        process.updated(json);
    }
    return process;
}

var Process = function(host, port, url) {

    var hostport = host + ":" + port;
    var failed = 0;
    var data = {};
    
    $("#data").append("<tr id='" + pid() + "'><th colspan='4'>" + hostport + "</th></tr>");

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

    function pid() {
        return idfy(hostport);
    }

    function setGoodState() {
        if (failed) {
            $("." + pid()).removeClass('failed');
            failed = 0;
        }
    }

    function setFailedState() {
        if (!failed) {
            $("tr." + pid()).addClass('failed');
            failed = 1;
        }
    }
    
    function updated(json) {
        if (json == undefined) {
            setFailedState();
            return;
        }

        setGoodState();
        var lastid = pid();
        $.each(json.data, function(i, statusvalue) {
            var v = transformVersion(json.version, statusvalue);
            var id = pid() + "-" + idfy(v.key);
            var row = $("#" + id);
            if (row.length == 0) {
                row = $("<tr id='" + id + "' class='lvl" + v.lvl + "  " + pid() + "'><td>" + v.key + "</td>" +
                        "<td class=value></td><td></td><td class=desc>" + v.desc + "</td></tr>");
                row.insertAfter("#" + lastid);
                row.data(Value(id));
            }
            row.data().update(v.value, json.timestamp);
            lastid = id;
        });
    }

    function update() {
        if (failed && ++failed % 30 == 0) return;
        $.ajax({
            type: "GET", 
            dataType: "json",
            url: url,
            success: function(json) {
                setGoodState();
                updated(json);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                setFailedState();
                updated(undefined);
            },
            timeout: 500});
    }
    
    return {
        // Get the (html) id for this process.
        pid: function() {
            pid();
        },
        
        // Apply new json data to this process. Calling with undefined
        // means that we failed to get updated data. This will trigger
        // a failed state.
        updated: function(json) {
            updated(json);
        },
        
        // Get latest data from server and update display.
        update: function() {
            update();
        }
    }
};

var Status = function() {

    // hosts => port => process
    var hosts = {};
    
    // Discover processes at host and add dynamically whenever found.
    function discover(host, port) {
        if (host == 'test') {
            hosts[host] = hosts[host] || {};
            hosts[host][port] = hosts[host][port] || TestProcess(host, port, url);
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
                hosts[host][port] = hosts[host][port] || Process(host, port, url);
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
