import './ui.scss';
import React from 'react';


class Value extends  React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        console.info(this.props);
        return (
            <tr>
                <td>{this.props.value.key}</td>
                <td>{this.props.value.value}</td>
                <td>{this.props.value.computed}</td>
                <td>{this.props.value.desc}</td>
            </tr>
        );
    }

}


class Server extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        console.info(this.props);
        let values = [{key: this.props.server.key + '/localhost/gloserver/request:count', value: '1244', computed: '3/s', desc: 'Hits.'}]
            .map((v) => <Value key={this.props.server.key + ':' + v.key} value={v}/> );

        return (
            <tbody>
                <tr><th colSpan="4">{ this.props.server.key }</th></tr>
                { values }
            </tbody>
        );
    }
}


export class Ui extends React.Component  {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        console.info(this.props);
        let servers = this.props.servers.map((s) => <Server key={s.key} server={s}/>);
        return (
            <table>
                <thead>
                <tr><th>Name</th><th>Value</th><th>Computed</th><th>Description</th></tr>
                </thead>
                { servers }
            </table>
        );
    }
}
