import 'babel-polyfill';
import {Servers, FakeServer, ServerDiscover, Server} from "./server";
import {Ui} from "./ui";
import React from 'react';
import ReactDOM from 'react-dom';


class App {
    constructor() {
        this.servers = new Servers();
    }

    render() {
        ReactDOM.render(<Ui servers={this.servers.all()}/>, document.getElementById("glo"));
    }

    add(spec) {
        let [host, port] = spec.split(":", 2);
        port = parseInt(port);

        if (host === "fake") {
            this.servers.add(new FakeServer(port || 22200));
        }
        else if (!port) {
            this.servers.add(new ServerDiscover(host));
        }
        else {
            this.servers.add(new Server(host, port));
        }

        this.render();
    }
}


document.addEventListener('DOMContentLoaded', function() {

    let app = new App();

    // Parse specs from url and add as servers.

    let params = document.URL.split("?", 2)[1] || "fake:22200";
    params.split("&").forEach(spec => {
        app.add(spec);
    });
    console.info("hej", app.servers.collection);

    setTimeout(() => {
        console.info("sune");
        app.servers.collection["localhost:0"].value = 100;
        app.render();
    }, 3000);

});
