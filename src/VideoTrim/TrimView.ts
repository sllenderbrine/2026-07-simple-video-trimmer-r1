export class TrimView {
    videoEl: HTMLVideoElement;
    trimContainerEl: HTMLDivElement;
    constructor() {
        const video = document.createElement("video");
        this.videoEl = video;
        document.body.appendChild(video);
        video.style = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: calc(100% - 100px);
            background-color: black;
            object-fit: contain;
            user-select: none;
        `;

        const trimContainer = document.createElement("div");
        this.trimContainerEl = trimContainer;
        document.body.appendChild(trimContainer);
        trimContainer.style = `
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 100px;
            background-color: rgb(50, 50, 50);
            user-select: none;
        `;
    }
}