import { VteBottomBar } from "./VteBottomBar.js";

export class VtebbToolsLeft {
    containerEl: HTMLDivElement;
    constructor(public bottombar: VteBottomBar) {
        this.containerEl = document.createElement("div");
        bottombar.toolsContainerEl.appendChild(this.containerEl);
        this.containerEl.classList.add("vtebb-tools-left");
    }
}