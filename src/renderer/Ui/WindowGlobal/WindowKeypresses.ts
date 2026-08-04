import { HtmlConnection } from "../../../shared/EventSignals/HtmlConnection.js";

export abstract class WindowKeypresses {
    static keys: { [key: string]: boolean } = {};
    constructor() {

    }

    static isKeyDown(name: string): boolean {
        return this.keys[name] ?? false;
    }
}

new HtmlConnection(window, "keydown", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    WindowKeypresses.keys[key] = true;
}, { owners: null, });
new HtmlConnection(window, "keyup", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    delete WindowKeypresses.keys[key];
}, { owners: null, });