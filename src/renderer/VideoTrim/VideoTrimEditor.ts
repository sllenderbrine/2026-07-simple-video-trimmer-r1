import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { renderEvent } from "../../shared/EventSignals/events/RenderEvent.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { VideoPlayerCanvas } from "../Ui/VideoPlayerCanvas.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";

const SHIFT_SPEED = 50;
const PRECISE_SHIFT_SPEED = 250;
const ZOOM_SPEED = 1.1;
const PRECISE_ZOOM_SPEED = 1.01;

export class VideoTrimEditor {
    containerEl: HTMLDivElement;
    canvas: VideoPlayerCanvas;
    visible: boolean = true;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public app: VideoTrimApp
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("video-trim-editor-container");

        this.canvas = new VideoPlayerCanvas();
        this.containerEl.appendChild(this.canvas.containerEl);
        
        const keypresses: { [key:string]: boolean } = {};
        new HtmlConnection(window, "keydown", (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            keypresses[key] = true;
        }, { owners: [ this.connectionOwner ] });
        new HtmlConnection(window, "keyup", (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            delete keypresses[key];
        }, { owners: [ this.connectionOwner ] });
        new HtmlConnection(window, "wheel", (e: WheelEvent) => {
            if(!this.canvas.fitToContainerLock) {
                if(e.ctrlKey) {
                    this.canvas.zoomInTo(e.clientX, e.clientY, e.deltaY < 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED);
                } else if(e.shiftKey) {
                    this.canvas.shift(e.deltaY > 0 ? SHIFT_SPEED : -SHIFT_SPEED, 0);
                } else {
                    this.canvas.shift(0, e.deltaY > 0 ? SHIFT_SPEED : -SHIFT_SPEED);
                }
            }
        }, { owners: [ this.connectionOwner ] });
        renderEvent.connect(dt => {
            if(!this.canvas.fitToContainerLock) {
                let mx = (keypresses["a"] ? -1 : 0) + (keypresses["d"] ? 1 : 0);
                let my = (keypresses["s"] ? 1 : 0) + (keypresses["w"] ? -1 : 0);
                if(mx !== 0 || my !== 0) {
                    this.canvas.shift(mx * dt * PRECISE_SHIFT_SPEED, my * dt * PRECISE_SHIFT_SPEED);
                }
                let dz = (keypresses["="] ? PRECISE_ZOOM_SPEED : 1) * (keypresses["-"] ? 1 / PRECISE_ZOOM_SPEED : 1)
                if(dz !== 1) {
                    this.canvas.zoomInToContainerCenter(dz);
                }
            }
        }, { owners: [ this.connectionOwner ] });
    }

    setVisible(v: boolean) {
        if(v) {
            this.containerEl.style.display = "block";
            this.visible = true;
            this.canvas.setVisible(true);
        } else {
            this.containerEl.style.display = "none";
            this.visible = false;
            this.canvas.setVisible(false);
        }
    }
}