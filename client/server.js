import sprintf from 'sprintf';
import {ajax} from "jquery";

export let State = {
    INIT: 'init',
    FAIL: 'fail',
    GOOD: 'good',
};

  
// Represents a server with hostport that may or may not be connected.
export class ServerBase {

    // Create a server. For a standard server it will be hostport.
    constructor(app, host, port) {
        this.app = app;
        this.host = host;
        this.port = port || 0;
        this.spec = sprintf("%s:%d", this.host, this.port);

        this.failCount = 0;
        this.state = State.INIT;
    }

    // Update will be called periodically, on update the server is expected to try to update the data. If not //
    // connected it should try to connect, until max retries are reached. A scanning server may start its scan on
    // update. The server will decide if it should do anything or not.
    update() {
    }
}

export class Server extends ServerBase {

    success(data) {
        this.failCount = 0;
        this.state = State.GOOD;
        this.app.render();
    }

    fail() {
        this.failCount++;
        this.state = State.FAIL;
        this.app.render();
    }

    update() {
        // Find alternative to jsonp with jquery, maybe require CORS from servers, or find another lib.
        ajax({
                 type:     "GET",
                 dataType: "json",
                 url:      sprintf("http://%s:%d/?callback=?", this.host, this.port),
                 success:  this.success.bind(this),
                 error:    this.fail.bind(this),
                 timeout:  200,
             });
    }
}


export class FakeServer extends ServerBase {

    constructor(app, port) {
        super(app, "fake", port || 22200);
    }
}

export class ServerDiscover extends ServerBase {

    constructor(app, host) {
        super(app, host);
    }
}


// Servers structure, holds all Server/HostScanner and FakeServer instances. Key is host or hostport.
export class Servers {
    constructor() {
        this.collection = {}
    }

    // Add server to collection.
    add(server) {
        let spec = server.spec;
        if (spec in this.collection) {
            // TODO Add error message area on page.
            console.error(sprintf("server '%s' already exists", spec));
            return;
        }
        this.collection[spec] = server;
    }

    // Return all servers in order.
    all() {
        return Object.values(this.collection).sort(s => s.spec);
    }

    // Let all servers get the chance to update.
    update() {
        Object.values(this.collection).forEach(s => s.update());
    }
}
