import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { renderEvent } from "../../shared/EventSignals/events/RenderEvent.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { VideoPlayerCanvas } from "../Ui/VideoPlayerCanvas.js";
import { VdvVideo } from "./VideoDirectoryViewer.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";
import { VteBottomBar } from "./VteBottomBar.js";

const SHIFT_SPEED = 50;
const PRECISE_SHIFT_SPEED = 250;
const ZOOM_SPEED = 1.1;
const PRECISE_ZOOM_SPEED = 1.01;

export class VideoTrimEditor {
    containerEl: HTMLDivElement;
    canvas: VideoPlayerCanvas;
    bottomBar: VteBottomBar;
    visible: boolean = true;
    undoActions: { type: string, data: any, }[] = [];
    redoActions: { type: string, data: any, }[] = [];
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public app: VideoTrimApp
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("video-trim-editor-container");

        this.canvas = new VideoPlayerCanvas();
        this.containerEl.appendChild(this.canvas.containerEl);
        
        this.app.keyDownEvent.connect(e => {
            if(!this.visible)
                return;
            const key = e.key.toLowerCase();
            if(key == " ") {
                if(this.canvas.userPaused) {
                    this.canvas.play();
                } else {
                    this.canvas.userPaused = true;
                }
            }
        }, { owners: [ this.connectionOwner ] })
        new HtmlConnection(window, "wheel", (e: WheelEvent) => {
            if(!this.visible)
                return;
            if(!this.bottomBar.hovering) {
                if(e.ctrlKey)
                    this.canvas.fitToContainerLock = false
                if(!this.canvas.fitToContainerLock) {
                    if(e.ctrlKey) {
                        this.canvas.zoomInTo(e.clientX, e.clientY, e.deltaY < 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED);
                    } else if(e.shiftKey) {
                        this.canvas.shift(e.deltaY > 0 ? SHIFT_SPEED : -SHIFT_SPEED, 0);
                    } else {
                        this.canvas.shift(0, e.deltaY > 0 ? SHIFT_SPEED : -SHIFT_SPEED);
                    }
                }
            }
        }, { owners: [ this.connectionOwner ] });
        renderEvent.connect(dt => {
            if(!this.visible)
                return;
            if(!this.canvas.fitToContainerLock && !this.bottomBar.hovering) {
                let mx = (this.app.keypresses["a"] ? -1 : 0) + (this.app.keypresses["d"] ? 1 : 0);
                let my = (this.app.keypresses["s"] ? 1 : 0) + (this.app.keypresses["w"] ? -1 : 0);
                if(mx !== 0 || my !== 0) {
                    this.canvas.shift(mx * dt * PRECISE_SHIFT_SPEED, my * dt * PRECISE_SHIFT_SPEED);
                }
                let dz = (this.app.keypresses["="] ? PRECISE_ZOOM_SPEED : 1) * (this.app.keypresses["-"] ? 1 / PRECISE_ZOOM_SPEED : 1);
                if(dz !== 1) {
                    this.canvas.zoomInToContainerCenter(dz);
                }
            }
        }, { owners: [ this.connectionOwner ] });

        this.bottomBar = new VteBottomBar(this);
        this.containerEl.appendChild(this.bottomBar.containerEl);

        let seekInputT = 0;
        this.bottomBar.seekInputEvent.connect(t => {
            seekInputT = t;
            this.canvas.seekTo(t);
        }, { owners: [ this.connectionOwner, ], });
        this.bottomBar.seekStartEvent.connect(() => {
            this.canvas.inputtingSeek = true;
        }, { owners: [ this.connectionOwner, ], });
        this.bottomBar.seekEndEvent.connect(() => {
            if(!this.canvas.userPaused) {
                if(this.canvas.maxSeek && seekInputT >= this.canvas.maxSeek) {
                    if(this.canvas.looped) {
                        this.canvas.seekTo(this.canvas.minSeek);
                    } else {
                        this.canvas.userPaused = true;
                    }
                } else if(seekInputT >= this.canvas.videoEl.duration) {
                    if(this.canvas.looped) {
                        this.canvas.seekTo(this.canvas.minSeek);
                    } else {
                        this.canvas.userPaused = true;
                    }
                }
            }
            this.canvas.inputtingSeek = false;
        }, { owners: [ this.connectionOwner, ], });
    }
    
    getHasUnsavedChanges() {
        if(!this.canvas.videoLoaded)
            return false;
        if(this.canvas.minSeek != 0)
            return true;
        if(this.canvas.maxSeek != null && this.canvas.maxSeek != this.canvas.videoEl.duration)
            return true;
        return false;
    }

    loadVideo(vdvv: VdvVideo) {
        this.canvas.userPaused = false;
        this.undoActions = [];
        this.redoActions = [];
        this.canvas.setUrl(vdvv.path);
    }

    setVisible(v: boolean) {
        if(v) {
            this.containerEl.style.display = "block";
            this.visible = true;
            this.canvas.setVisible(true);
            this.canvas.zoomToCenterFitContainer();
        } else {
            this.containerEl.style.display = "none";
            this.visible = false;
            this.canvas.setVisible(false);
        }
    }
}