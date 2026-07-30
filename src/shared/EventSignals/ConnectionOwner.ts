import { Connection } from "./Connection.js";
import { HtmlConnection } from "./HtmlConnection.js";

export class ConnectionOwner {
    connections: Connection<any>[] = [];
    htmlConnections: HtmlConnection[] = [];
    constructor() {

    }

    disconnectAll() {
        for(const conn of [ ...this.connections, ...this.htmlConnections ]) {
            conn.disconnect();
        }
    }
}