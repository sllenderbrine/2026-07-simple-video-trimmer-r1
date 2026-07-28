import { _Connection } from "../../shared/EventSignals/_Connection.js";
import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { renderEvent } from "../../shared/EventSignals/events/RenderEvent.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { Signal } from "../../shared/EventSignals/Signal.js";
import { clamp } from "../../shared/Utility/MathUtility.js";
import { formatVideoDuration } from "../../shared/Utility/StringUtility.js";
import type { VideoTrimEditor } from "./VideoTrimEditor.js";

export class VteBottomBar {
    containerEl: HTMLDivElement;
    durationSliderContainerEl: HTMLDivElement;
    durationSliderEl: HTMLDivElement;
    durationSliderContentEl: HTMLDivElement;
    durationSliderValueContentEl: HTMLDivElement;
    durationSliderHandleEl: HTMLDivElement;
    currentTimeEl: HTMLDivElement;
    totalTimeEl: HTMLDivElement;
    toolsContainerEl: HTMLDivElement;
    toolsLeftEl: HTMLDivElement;
    toolsRightEl: HTMLDivElement;
    toolsCenterEl: HTMLDivElement;
    hovering: boolean = false;
    seekInputEvent: Signal<[t: number]> = new Signal();
    seekStartEvent: Signal<[]> = new Signal();
    seekEndEvent: Signal<[]> = new Signal();
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public editor: VideoTrimEditor,
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("vte-bottom-bar-container");

        this.durationSliderContainerEl = document.createElement("div");
        this.containerEl.appendChild(this.durationSliderContainerEl);
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

        this.toolsContainerEl = document.createElement("div");
        this.containerEl.appendChild(this.toolsContainerEl);
        this.toolsContainerEl.classList.add("vtebb-tools-container");

        this.toolsLeftEl = document.createElement("div");
        this.containerEl.appendChild(this.toolsLeftEl);
        this.toolsLeftEl.classList.add("vtebb-tools-row");

        this.toolsRightEl = document.createElement("div");
        this.containerEl.appendChild(this.toolsRightEl);
        this.toolsRightEl.classList.add("vtebb-tools-row");

        this.toolsCenterEl = document.createElement("div");
        this.containerEl.appendChild(this.toolsCenterEl);
        this.toolsCenterEl.classList.add("vtebb-tools-center");

        let animConnection: _Connection<any> | null = null;
        let hoverTimeout = 0;
        new HtmlConnection(window, "mousemove", (e: MouseEvent) => {
            hoverTimeout = 2;
            if(e.clientY >= window.innerHeight - 100) {
                if(animConnection != null) {
                    animConnection.disconnect();
                    animConnection = null
                }
                return;
            }
            if(animConnection == null) {
                const rect = this.containerEl.getBoundingClientRect();
                let currY = window.innerHeight - (rect.top + rect.height);
                this.containerEl.style.bottom = "0px";
                this.containerEl.animate([
                    { bottom: `${currY}px`, },
                    { bottom: this.containerEl.style.bottom, },
                ], { duration: 200, easing: "ease", });
                animConnection = renderEvent.connect(dt => {
                    hoverTimeout -= dt;
                    if(hoverTimeout < 0) {
                        const rect = this.containerEl.getBoundingClientRect();
                        let currY = window.innerHeight - (rect.top + rect.height);
                        this.containerEl.style.bottom = "-100px";
                        this.containerEl.animate([
                            { bottom: `${currY}px`, },
                            { bottom: this.containerEl.style.bottom, },
                        ], { duration: 200, easing: "ease", });
                        animConnection!.disconnect();
                        animConnection = null;
                    }
                }, { owners: [ this.connectionOwner ] });
            }
        }, { owners: [ this.connectionOwner ] });

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
                t = clamp(
                    t,
                    this.editor.canvas.minSeek / this.editor.canvas.videoEl.duration,
                    (this.editor.canvas.maxSeek ?? this.editor.canvas.videoEl.duration) / this.editor.canvas.videoEl.duration,
                );
                this.durationSliderValueContentEl.style.width = `${t * 100}%`;
                this.seekInputEvent.fire(t * this.editor.canvas.videoEl.duration);
            }, { owners: [ this.connectionOwner, mouseDownConnections ], initArgs: offset ? undefined : [e], });
            new HtmlConnection(window, "mouseup", (e: MouseEvent) => {
                this.seekEndEvent.fire();
                mouseDownConnections.disconnectAll();
            }, { owners: [ this.connectionOwner, mouseDownConnections ] });
        }
        new HtmlConnection(this.durationSliderContentEl, "mousedown", (e: MouseEvent) => {
            durationSliderMouseDown(e, e.target == this.durationSliderHandleEl);
        }, { owners: [ this.connectionOwner, ], });

        this.editor.canvas.renderEvent.connect(() => {
            if(!this.editor.canvas.videoEl.paused) {
                let t = this.editor.canvas.videoEl.currentTime / this.editor.canvas.videoEl.duration;
                this.durationSliderValueContentEl.style.width = `${t * 100}%`;
            }
            this.currentTimeEl.textContent = formatVideoDuration(this.editor.canvas.videoEl.currentTime);
            this.totalTimeEl.textContent = formatVideoDuration(this.editor.canvas.videoEl.duration);
        }, { owners: [ this.connectionOwner, ], initArgs: [], });
    }
}