import sprintf from 'sprintf';


// Represents a server with hostport that may or may not be connected.
export class ServerBase {

    // Create a server. For a standard server it will be hostport.
    constructor(host, port) {
        this.host = host;
        this.port = port || 0;
        this.spec = sprintf("%s:%d", this.host, this.port);
        this.value = 0;
    }

    // Update will be called periodically, on update the server is expected to try to update the data. If not //
    // connected it should try to connect, until max retries are reached. A scanning server may start its scan on
    // update. The server will decide if it should do anything or not.
    update() {

    }
}


export class Server extends ServerBase {
}


export class TestServer extends ServerBase {

    constructor(port) {
        super("test", port || 22200);
    }
}

export class ServerDiscover extends ServerBase {

    constructor(host) {
        super(host);
    }
}


// Servers structure, holds all Server/HostScanner and TestServer instances. Key is host or hostport.
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
}
