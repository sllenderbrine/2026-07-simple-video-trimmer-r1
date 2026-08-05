import { joinPaths } from "../../shared/Utility/FilePathUtility.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";

const PATH_RESOURCES = "..";

export class StartupMenu {
    containerEl: HTMLDivElement;
    columnEl0: HTMLDivElement;
    columnEl1: HTMLDivElement;
    startContainerEl: HTMLDivElement;
    constructor(
        public app: VideoTrimApp,
    ) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("startup-container");
        
        let testCanvas = document.createElement("img");
        this.containerEl.appendChild(testCanvas);
        testCanvas.style.position = "absolute";
        testCanvas.style.width = "100%";
        testCanvas.style.height = "100%";
        testCanvas.style.objectFit = "cover";
        testCanvas.style.left = "0px";
        testCanvas.style.top = "0px";
        testCanvas.style.zIndex = "-1";
        testCanvas.src = joinPaths(PATH_RESOURCES, "textures/startbg.png");
        
        testCanvas = document.createElement("img");
        this.containerEl.appendChild(testCanvas);
        testCanvas.style.position = "absolute";
        testCanvas.style.width = "100%";
        testCanvas.style.height = "100%";
        testCanvas.style.objectFit = "fill";
        testCanvas.style.imageRendering = "pixelated";
        testCanvas.style.left = "0px";
        testCanvas.style.top = "0px";
        testCanvas.style.zIndex = "1";
        testCanvas.src = joinPaths(PATH_RESOURCES, "textures/startoverlay.png");

        this.columnEl0 = document.createElement("div");
        this.containerEl.appendChild(this.columnEl0)
        this.columnEl0.classList.add("startup-content-column");

        this.columnEl0.innerHTML = `
            <div>
                <h1>Simple Video Trimmer</h1>
                <h3>Gameplay Clip Editor</h3>
            </div>
            <div>
                <h2>Recents</h2>
            </div>
        `;

        this.columnEl1 = document.createElement("div");
        this.containerEl.appendChild(this.columnEl1)
        this.columnEl1.classList.add("startup-content-column");

        this.columnEl1.innerHTML = `
            <div>
                <h2>Start</h2>
                <div class="spm-start">

                </div>
            </div>
        `;

        const startContainerEl = this.columnEl1.querySelector(".spm-start") as HTMLDivElement;
        this.startContainerEl = startContainerEl;

        this.addStartLink("Open Folder", "folder", () => {

        });

        this.updateRecents();
    }

    addStartLink(title: string, icon: string, onClick: () => void) {
        
    }

    updateRecents() {

    }
}