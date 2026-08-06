import { ConnectionOwner } from "../../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../../shared/EventSignals/HtmlConnection.js";
import { Signal } from "../../../shared/EventSignals/Signal.js";
import { clamp } from "../../../shared/Utility/MathUtility.js";
import { formatVideoDuration } from "../../../shared/Utility/StringUtility.js";
import { VteBottomBar } from "./VteBottomBar.js";

export class VtebbDuration {
    durationSliderContainerEl: HTMLDivElement;
    durationSliderEl: HTMLDivElement;
    durationSliderContentEl: HTMLDivElement;
    durationSliderValueContentEl: HTMLDivElement;
    durationSliderHandleEl: HTMLDivElement;
    currentTimeEl: HTMLDivElement;
    totalTimeEl: HTMLDivElement;
    seekInputEvent: Signal<[t: number]> = new Signal();
    seekStartEvent: Signal<[]> = new Signal();
    seekEndEvent: Signal<[]> = new Signal();
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public bottomBar: VteBottomBar,
    ) {
        this.durationSliderContainerEl = document.createElement("div");
        bottomBar.containerEl.appendChild(this.durationSliderContainerEl);
        this.durationSliderContainerEl.classList.add("vtebb-duration-container");

        this.durationSliderEl = document.createElement("div");
        this.durationSliderContainerEl.appendChild(this.durationSliderEl);
        this.durationSliderEl.classList.add("vtebb-duration-slider");

        this.durationSliderContentEl = document.createElement("div");
        this.durationSliderEl.appendChild(this.durationSliderContentEl);
        this.durationSliderContentEl.classList.add("vtebb-duration-slider-content");

        this.durationSliderValueContentEl = document.createElement("div");
        this.durationSliderContentEl.appendChild(this.durationSliderValueContentEl);
        this.durationSliderValueContentEl.classList.add("vtebb-duration-slider-value");
        
        this.durationSliderHandleEl = document.createElement("div");
        this.durationSliderValueContentEl.appendChild(this.durationSliderHandleEl);
        this.durationSliderHandleEl.classList.add("vtebb-duration-slider-handle");

        this.currentTimeEl = document.createElement("div");
        this.durationSliderContainerEl.appendChild(this.currentTimeEl);
        this.currentTimeEl.classList.add("vtebb-current-time");
        this.currentTimeEl.textContent = formatVideoDuration(0);

        this.totalTimeEl = document.createElement("div");
        this.durationSliderContainerEl.appendChild(this.totalTimeEl);
        this.totalTimeEl.classList.add("vtebb-total-time");
        this.totalTimeEl.textContent = formatVideoDuration(10_000);

        const editor = bottomBar.editor;
        let seekStartMx = 0;
        let seekStartT = 0;
        let mouseDownConnections = new ConnectionOwner();
        const durationSliderMouseDown = (e: MouseEvent, offset: boolean = false) => {
            this.seekStartEvent.fire();
            seekStartMx = e.clientX;
            seekStartT = this.durationSliderValueContentEl.clientWidth / this.durationSliderEl.clientWidth;
            new HtmlConnection(window, "mousemove", (e: MouseEvent) => {
                let t = 0;
                if(offset) {
                    t = seekStartT + (e.clientX - seekStartMx) / this.durationSliderEl.clientWidth;
                } else {
                    const rect = this.durationSliderEl.getBoundingClientRect();
                    t = (e.clientX - rect.left) / this.durationSliderEl.clientWidth;
                }
                const minSeek = editor.canvas.video.getMinSeek();
                const maxSeek = editor.canvas.video.getMaxSeek()
                t = clamp(
                    t,
                    (minSeek ?? 0) / editor.canvas.video.videoEl.duration,
                    (maxSeek ?? editor.canvas.video.videoEl.duration) / editor.canvas.video.videoEl.duration,
                );
                this.durationSliderValueContentEl.style.width = `${t * 100}%`;
                this.seekInputEvent.fire(t * editor.canvas.video.videoEl.duration);
            }, { owners: [ this.connectionOwner, mouseDownConnections ], initArgs: offset ? undefined : [e], });
            new HtmlConnection(window, "mouseup", (e: MouseEvent) => {
                this.seekEndEvent.fire();
                mouseDownConnections.disconnectAll();
            }, { owners: [ this.connectionOwner, mouseDownConnections ] });
        }
        new HtmlConnection(this.durationSliderContentEl, "mousedown", (e: MouseEvent) => {
            durationSliderMouseDown(e, e.target == this.durationSliderHandleEl);
        }, { owners: [ this.connectionOwner, ], });

        editor.canvas.renderEvent.connect(() => {
            if(!editor.canvas.video.videoEl.paused) {
                let t = editor.canvas.video.videoEl.currentTime / editor.canvas.video.videoEl.duration;
                this.durationSliderValueContentEl.style.width = `${t * 100}%`;
            }
            this.currentTimeEl.textContent = formatVideoDuration(editor.canvas.video.videoEl.currentTime);
            this.totalTimeEl.textContent = formatVideoDuration(editor.canvas.video.videoEl.duration);
        }, { owners: [ this.connectionOwner, ], initArgs: [], });
    }
}