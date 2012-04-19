
// Takes a name and turns it into something usable as a html id.
function idfy(key) {
    return key.replace(/[:./]/g, '-');
}

var TestProcess = function(host, port, url, level) {
    
    var json = {
        version: 1,
        timestamp: new Date().getTime(),
        data: [
            {key: "/localhost/gloserver/request:count",
             value: "0",
             desc: "The number of requests to the process server.",
             lvl: 0},
            {key: "/localhost/gloserver/cache/size:current",
             value: "100",
             desc: "The size of the cache.",
             lvl: 0}
        ]
    };
    
    var failed = false;
    
    var process = Process(host, port, url, level);
    
    var button = $("<button>good</button>")
    button.click(function() {
        failed = !failed;
        if (failed) button.text("failed")
        else button.text("good");
    });
    button.appendTo("body");
    
    process.update = function() {
        if (failed) {
            process.updated(undefined);
            return;
        }
        json.timestamp = new Date().getTime();
        json.data[0].value = (3 + parseInt(json.data[0].value)) + '';
        process.updated(json);
    }
    return process;
}

var ValueUI = function(processId, key, description, level)
{
    var id = processId + "-" + idfy(key);

    var html = $("<tr id='" + id + "' class='lvl" + level + "  " + processId + "'><td>" + key + "</td>" +
                 "<td class=value></td><td class=computed></td><td>" + description + "</td></tr>");
    
    return {
        value: function(value) {
            $("#" + id + " > .value").text(value);
        },
        computed: function(computed) {
            $("#" + id + " > .computed").text(computed);
        },
        html: function() {
            return html;
        }
    }
}

var Value = function(key, ui)
{
    var tag = key.substring(1 + key.lastIndexOf(":"));
    var lastTime = 0;
    var lastValue = 0;
    
    return {
        // Update with new value and timestamp.
        update: function(valueString, time) {
            ui.value(valueString);
            if (tag == "count") {
                var value = parseInt(valueString)
                var rate = Math.round((value - lastValue) * 1000 / (time - lastTime));
                ui.computed(rate + "/s")
                lastValue = value;
                lastTime = time;
            }
        }
    };
}

var ProcessUI = function(host, port, level)
{
    var id = idfy(host + "-" + port);

    var lvl = level;
    
    var rows = {};

    var html = $("<tr id='" + id + "'><th colspan='4'>" + host + ":" + port + "</th></tr>");
    
    html.appendTo("#data");
    
//    var levelSelect = $("<input type=radio value=0 name='level-select-" + pid() + "'>" +
//                        "<input type=radio value=1 name='level-select-" + pid() + "'>" +
//                        "<input type=radio value=2 name='level-select-" + pid() + "' checked>" +
//                        "<input type=radio value=3 name='level-select-" + pid() + "'>" +
//                        "<input type=radio value=4 name='level-select-" + pid() + "'>");
//    levelSelect.appendTo("#" + pid() + " >  th");

    return {
        add: function(key, description, level, atkey) {
            rows[key] = ValueUI(id, key, description, level);
            var html = rows[key].html();
            if (level > lvl) html.css("display", "none");
            html.insertAfter("#" + (atkey ? id + "-" + idfy(atkey) : id));
        },
        get: function(key) {
            return rows[key];
        },
        filter: function(level) {
            lvl = level;
            var i = 0;
            for (;i <= lvl; ++i) {
                $("." + id + ".lvl" + i).css("display", "");
            }
            for (;i <= 10; ++i) {
                $("." + id + ".lvl" + i).css("display", "none");
            }
        },
        online: function() {
            $("." + id).removeClass('failed');
        },
        offline: function() {
            $("tr." + id).addClass('failed');
        },
        html: function() {
            return html;
        }
    }
}

var Process = function(host, port, url, level)
{
    var hostport = host + ":" + port;
    var failed = 0;
    var data = {};

    var ui = ProcessUI(host, port, level);
    
    function updated(json) {
        if (json == undefined) {
            if (!failed) {
                ui.offline();
                failed = true;
            }
            return;
        }

        if (failed) {
            ui.online();
            failed = false;
        }
        
        var lastkey;
        $.each(json.data, function(i, value) {
            v = data[value.key];
            if (!v) {
                ui.add(value.key, value.desc, value.lvl, lastkey);
                v = Value(value.key, ui.get(value.key));
                data[value.key] = v;
            }
            v.update(value.value, json.timestamp);
            lastkey = value.key;
        });
    }

    function update() {
        if (failed && ++failed % 30 == 0) return;
        $.ajax({
            type: "GET", 
            dataType: "json",
            url: url,
            success: function(json) {
                updated(json);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                updated(undefined);
            },
            timeout: 500});
    }
    
    return {
        // Apply new json data to this process. Calling with undefined
        // means that we failed to get updated data. This will trigger
        // an offline state.
        updated: function(json) {
            updated(json);
        },
        
        // Get latest data from server and update display.
        update: function() {
            update();
        },

        filter: function(lvl) {
            ui.filter(lvl);
        }
    }
};

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

var s = Status(1);

$(function() {
    s.rediscover();
    setInterval(s.update, 1000);
    //setTimeout("s.update()", 1000);
   $('#lvl0').click(function() { s.filter(0); return false; });
   $('#lvl1').click(function() { s.filter(1); return false; });
   $('#lvl2').click(function() { s.filter(2); return false; });
   $('#lvl3').click(function() { s.filter(3); return false; });
   $('#lvl4').click(function() { s.filter(4); return false; });
   $('#lvl5').click(function() { s.filter(5); return false; });
});
