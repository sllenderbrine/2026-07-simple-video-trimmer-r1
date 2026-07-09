import type { ConnectionOwner } from "./ConnectionOwner.js";
import type { Signal } from "./Signal.js";

export type ConnectionOptions<T extends any> = {
    owners?: ConnectionOwner[] | null;
    initArgs?: T
}

export class _Connection<T extends any[]> {
    owners: ConnectionOwner[] = [];
    constructor(public signal: Signal<T>, public callback: (...args: T) => void, options: ConnectionOptions<T>) {
        signal.connections.push(this);
        if(options.owners != null) {
            for(const owner of options.owners) {
                owner.addConnection(this);
            }
        } else if(options.owners === undefined) {
            const err = new Error();
            const stackLines = err.stack ? err.stack.split("\n") : [];
            const callerFrame = (stackLines[3] || "").trim();
            console.warn("Warning: Connection created without any connection owners. Set parameter to null or [] to silence.\n" + callerFrame);
        }
        if(options.initArgs != null) {
            this.callback(...options.initArgs);
        }
    }
    disconnect() {
        this.signal.disconnect(this);
        for(const owner of [...this.owners]) {
            owner._removeConnectionLocally(this);
        }
        this.owners = [];
    }
}