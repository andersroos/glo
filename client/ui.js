import './ui.scss';
import React from 'react';

class Item extends  React.Component {

    render() {
        let {item} = this.props;
        return (
            <tr>
                <td/>
                <td>{item.key}</td>
                <td className="value">{item.value}</td>
                <td className="computed">{item.computed}</td>
                <td>{item.desc}</td>
            </tr>
        );
    }
}


class Server extends React.Component {

    render() {
        let {server} = this.props;

        let items = Object.keys(server.items).sort().map((key) => {
            return <Item key={key} item={server.items[key]}/>
        });

        return (
            <tbody>
                <tr>
                    <th>{server.state}</th>
                    <th colSpan="4">{ server.spec }</th>
                </tr>
                {items}
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
