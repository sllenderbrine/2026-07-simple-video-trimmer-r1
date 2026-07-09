import { ConnectionOwner, HtmlConnection } from "../VecLib/index.js";
import type { ListItem } from "./FileListView.js";

export class TrimView {
    containerEl: HTMLDivElement;
    videoEl: HTMLVideoElement;
    trimContainerEl: HTMLDivElement;
    timelineHandleEl: HTMLDivElement;
    trimContainerLeftEl: HTMLDivElement;
    trimContainerRightEl: HTMLDivElement;
    nameLabelEl: HTMLDivElement;
    isUserPaused: boolean = false;
    isDragPaused: boolean = false;
    isSeeking: boolean = false;
    looped: boolean = false;
    lastPauseValue: boolean | null = null;
    targetSeekTime: number = 0;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(public item: ListItem) {
        const container = document.createElement("div");
        this.containerEl = container;
        document.body.appendChild(container);
        container.classList.add("trim-view-container");

        const video = document.createElement("video");
        this.videoEl = video;
        document.body.appendChild(video);
        video.classList.add("tv-video");

        const trimContainer = document.createElement("div");
        this.trimContainerEl = trimContainer;
        document.body.appendChild(trimContainer);
        trimContainer.classList.add("tv-trim-container");

        const timelineHandle = document.createElement("div");
        this.timelineHandleEl = timelineHandle;
        trimContainer.appendChild(timelineHandle);
        timelineHandle.classList.add("tv-timeline-handle");

        const trimLeftContainer = document.createElement("div");
        this.trimContainerLeftEl = trimLeftContainer;
        trimContainer.appendChild(trimLeftContainer);
        trimLeftContainer.classList.add("tv-trim-left");

        const trimLeftArrow = document.createElement("div");
        trimLeftContainer.appendChild(trimLeftArrow);
        trimLeftArrow.classList.add("tv-trim-left-arrow");

        const trimRightContainer = document.createElement("div");
        this.trimContainerRightEl = trimRightContainer;
        trimContainer.appendChild(trimRightContainer);
        trimRightContainer.classList.add("tv-trim-right");

        const trimRightArrow = document.createElement("div");
        trimRightContainer.appendChild(trimRightArrow);
        trimRightArrow.classList.add("tv-trim-right-arrow");

        const seekMouse = (e: MouseEvent) => {
            const t = e.clientX / trimContainer.clientWidth * video.duration;
            this.seekTo(t);
        }

        trimContainer.onmousedown = e => {
            this.isDragPaused = true;
            seekMouse(e);
        };
        new HtmlConnection(window, "mouseup", (e: MouseEvent) => {
            this.isDragPaused = false;
        }, { owners: [ this.connectionOwner ] });
        trimContainer.onmousemove = e => {
            if(this.isDragPaused) {
                seekMouse(e);
            }
        }

        new HtmlConnection(window, "keydown", (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if(key == " ") {
                if(this.videoEl.ended && this.isUserPaused) {
                    this.seekTo(0);
                    this.isUserPaused = false;
                } else {
                    this.isUserPaused = !this.isUserPaused;
                    this.updateVideoPause();
                }
            }
        }, { owners: [ this.connectionOwner ] });

        const nameLabel = document.createElement("div");
        this.nameLabelEl = nameLabel;
        trimContainer.appendChild(nameLabel);
        nameLabel.classList.add("tv-name-label");
        nameLabel.textContent = item.file.name;

        video.onloadedmetadata = () => {
            this.updateVideoPause();
        }

        video.onended = () => {
            if(this.looped) {
                this.seekTo(0);
            } else {
                this.isUserPaused = true;
                this.updateVideoPause();
            }
        }

        this.videoEl.src = item.file.path;
    }
    seekTo(t: number) {
        this.targetSeekTime = t;
        if(this.isSeeking)
            return;
        this.isSeeking = true;
        this.updateVideoPause();
        this.videoEl.onseeked = () => {
            this.isSeeking = false;
            this.updateVideoPause();
            if(this.targetSeekTime != t) {
                return requestAnimationFrame(() => {
                    this.seekTo(this.targetSeekTime);
                });
            }
        }
        this.videoEl.currentTime = t;
    }
    updateVideoPause() {
        const pause = this.isUserPaused || this.isSeeking || this.isDragPaused;
        if(pause == this.lastPauseValue)
            return;
        if(pause)
            this.videoEl.pause();
        else
            this.videoEl.play();
    }
    remove() {
        this.videoEl.remove();
        this.trimContainerEl.remove();
        this.connectionOwner.disconnectAll();
    }
}