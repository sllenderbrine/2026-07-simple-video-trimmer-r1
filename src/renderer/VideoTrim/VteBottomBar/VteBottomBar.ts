import { Connection } from "../../../shared/EventSignals/Connection.js";
import { ConnectionOwner } from "../../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../../shared/EventSignals/HtmlConnection.js";
import { renderEvent } from "../../Ui/WindowGlobal/WindowEvents.js";
import type { VideoTrimEditor } from "../VideoTrimEditor.js";
import { VtebbDuration } from "./VtebbDuration.js";
import { VtebbToolsCenter } from "./VtebbToolsCenter.js";
import { VtebbToolsLeft } from "./VtebbToolsLeft.js";
import { VtebbToolsRight } from "./VtebbToolsRight.js";

export class VteBottomBar {
    containerEl: HTMLDivElement;
    duration: VtebbDuration;
    toolsContainerEl: HTMLDivElement;
    toolsLeft: VtebbToolsLeft;
    toolsCenter: VtebbToolsCenter;
    toolsRight: VtebbToolsRight;
    hovering: boolean = false;
    _pinned: boolean = false;
    animConnection: Connection<any> | null = null;
    hoverTimeout: number = 0;
    hiddenOffScreen: boolean = true;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public editor: VideoTrimEditor,
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("vte-bottom-bar-container");

        this.duration = new VtebbDuration(this);

        this.toolsContainerEl = document.createElement("div");
        this.containerEl.appendChild(this.toolsContainerEl);
        this.toolsContainerEl.classList.add("vtebb-tools-container");

        this.toolsLeft = new VtebbToolsLeft(this);
        this.toolsRight = new VtebbToolsRight(this);
        this.toolsCenter = new VtebbToolsCenter(this);

        new HtmlConnection(window, "mousemove", (e: MouseEvent) => {
            if(!this.editor.visible)
                return;
            this.hoverTimeout = 2;
            this.setVisibleAnimate(true);
            if(e.clientY >= window.innerHeight - 100) {
                this.hovering = true;
                if(this.animConnection != null) {
                    this.animConnection.disconnect();
                    this.animConnection = null;
                }
                return;
            }
            this.hovering = false;
            if(this.animConnection == null) {
                this.animConnection = renderEvent.connect(dt => {
                    this.hoverTimeout -= dt;
                    if(this.hoverTimeout < 0) {
                        if(!this._pinned)
                            this.setVisibleAnimate(false);
                        this.animConnection!.disconnect();
                        this.animConnection = null;
                    }
                }, { owners: [ this.connectionOwner ] });
            }
        }, { owners: [ this.connectionOwner ] });
    }

    isPinned() {
        return this._pinned;
    }

    setPinned(v: boolean) {
        this._pinned = v;
        if(v)
            this.setVisibleAnimate(true);
        else
            if(this.hoverTimeout < 0)
                this.setVisibleAnimate(false);
            else
                this.setVisibleAnimate(true);
    }

    setVisibleAnimate(v: boolean) {
        if(v == !this.hiddenOffScreen)
            return;
        this.hiddenOffScreen = !v; 
        const rect = this.containerEl.getBoundingClientRect();
        let currY = window.innerHeight - (rect.top + rect.height);
        this.containerEl.style.bottom = v ? "0px" : "-100px";
        this.containerEl.animate([
            { bottom: `${currY}px`, },
            { bottom: this.containerEl.style.bottom, },
        ], { duration: 200, easing: "ease", });
    }
}