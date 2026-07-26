import { VideoPlayerCanvas } from "../Ui/VideoPlayerCanvas.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";

export class VideoTrimEditor {
    containerEl: HTMLDivElement;
    canvas: VideoPlayerCanvas;
    visible: boolean = true;
    constructor(
        public app: VideoTrimApp
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("video-trim-editor-container");

        this.canvas = new VideoPlayerCanvas();
        this.containerEl.appendChild(this.canvas.containerEl);
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