import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { VideoPlayerCanvas } from "../Ui/VideoPlayerCanvas.js";
import { renderEvent } from "../Ui/WindowGlobal/WindowEvents.js";
import { WindowKeypresses } from "../Ui/WindowGlobal/WindowKeypresses.js";
import { VdvVideo } from "./VideoDirectoryViewer.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";
import { VteBottomBar } from "./VteBottomBar/VteBottomBar.js";

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
        this.containerEl.appendChild(this.canvas.renderedCanvas.containerEl);
        this.canvas.renderedCanvas.containerEl.classList.add("video-player-canvas-container");
        this.canvas.renderedCanvas.canvasEl.classList.add("vpc-canvas");
        
        WindowKeypresses.keyDownEvent.connect(e => {
            if(!this.visible)
                return;
            const key = e.key.toLowerCase();
            if(key == " ") {
                if(this.canvas.isPaused()) {
                    this.canvas.play();
                } else {
                    this.canvas.pause();
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
                let mx = (WindowKeypresses.isKeyDown("a") ? -1 : 0) + (WindowKeypresses.isKeyDown("d") ? 1 : 0);
                let my = (WindowKeypresses.isKeyDown("s") ? 1 : 0) + (WindowKeypresses.isKeyDown("w") ? -1 : 0);
                if(mx !== 0 || my !== 0) {
                    this.canvas.shift(mx * dt * PRECISE_SHIFT_SPEED, my * dt * PRECISE_SHIFT_SPEED);
                }
                let dz = (WindowKeypresses.isKeyDown("=") ? PRECISE_ZOOM_SPEED : 1) * (WindowKeypresses.isKeyDown("-") ? 1 / PRECISE_ZOOM_SPEED : 1);
                if(dz !== 1) {
                    this.canvas.zoomInToContainerCenter(dz);
                }
            }
        }, { owners: [ this.connectionOwner ] });

        this.bottomBar = new VteBottomBar(this);
        this.containerEl.appendChild(this.bottomBar.containerEl);

        let seekInputT = 0;
        this.bottomBar.duration.seekInputEvent.connect(t => {
            seekInputT = t;
            this.canvas.seekTo(t);
        }, { owners: [ this.connectionOwner, ], });
        this.bottomBar.duration.seekStartEvent.connect(() => {
            this.canvas.video.setInputtingSeek(true);
        }, { owners: [ this.connectionOwner, ], });
        this.bottomBar.duration.seekEndEvent.connect(() => {
            if(!this.canvas.isPausedIgnoreInput()) {
                const maxSeek = this.canvas.video.getMaxSeek();
                if(maxSeek != null && seekInputT >= maxSeek) {
                    if(this.canvas.video.isLooped()) {
                        this.canvas.seekTo(this.canvas.video.getMinSeek() ?? 0);
                    } else {
                        this.canvas.video._userPaused = true;
                    }
                } else if(seekInputT >= this.canvas.video.videoEl.duration) {
                    if(this.canvas.video.isLooped()) {
                        this.canvas.seekTo(this.canvas.video.getMinSeek() ?? 0);
                    } else {
                        this.canvas.video._userPaused = true;
                    }
                }
            }
            this.canvas.video.setInputtingSeek(false);
        }, { owners: [ this.connectionOwner, ], });
    }
    
    getHasUnsavedChanges() {
        if(!this.canvas.video.isLoaded())
            return false;
        const minSeek = this.canvas.video.getMinSeek();
        if(minSeek != null && minSeek != 0)
            return true;
        const maxSeek = this.canvas.video.getMaxSeek();
        if(maxSeek != null && maxSeek != this.canvas.video.videoEl.duration)
            return true;
        return false;
    }

    loadVideo(vdvv: VdvVideo) {
        this.canvas.video._userPaused = false;
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