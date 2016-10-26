import './ui.scss';
import React from 'react';

class Value extends  React.Component {

    render() {
        return (
            <tr>
                <td/>
                <td>{this.props.value.key}</td>
                <td className="value">{this.props.value.value}</td>
                <td className="computed">{this.props.value.computed}</td>
                <td>{this.props.value.desc}</td>
            </tr>
        );
    }
}


class Server extends React.Component {

    render() {
        let {server} = this.props;

        let values = [{key: '/localhost/gloserver/request:count', value: server.value, computed: '3/s', desc: 'Hits.'}]
            .map((v) => <Value key={server.spec + ':' + v.spec} value={v}/> );

        return (
            <tbody>
                <tr>
                    <th>Ok</th>
                    <th colSpan="4">{ server.spec }</th>
                </tr>
                { values }
            </tbody>
        );
    }
}


export class Ui extends React.Component {

    render() {
        let servers = this.props.servers.map(s => <Server key={s.spec} server={s}/>);
        return (
            <table>
                <thead>
                <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Computed</th>
                    <th>Description</th>
                </tr>
                </thead>
                { servers }
            </table>
        );
    }
}
