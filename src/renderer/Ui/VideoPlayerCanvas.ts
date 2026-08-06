import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { Signal } from "../../shared/EventSignals/Signal.js";
import { get2dContext } from "../../shared/Utility/Canvas2dUtility.js";
import { Vec3 } from "../../shared/Vectors/Vec3.js";
import { CanvasWithRenderedOffset } from "./CanvasWithRenderedOffset.js";
import { VideoWithScriptControls } from "./VideoWithScriptControls.js";

export class VideoPlayerCanvas {
    textureCanvasEl: HTMLCanvasElement;
    texCtx: CanvasRenderingContext2D;
    renderedCanvas: CanvasWithRenderedOffset;
    video: VideoWithScriptControls;
    visible: boolean = true;
    fitToContainerLock: boolean = true;
    camera: Vec3 = new Vec3(0, 0, 1);
    renderEvent: Signal<[]> = new Signal();
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor() {
        this.video = new VideoWithScriptControls();
        
        this.textureCanvasEl = document.createElement("canvas");
        this.texCtx = get2dContext(this.textureCanvasEl);

        this.renderedCanvas = new CanvasWithRenderedOffset();

        this.updateRenderCanvasSize();
        this.updateContainerSize();
        
        new HtmlConnection(window, "resize", () => {
            if(!this.visible)
                return;
            this.updateContainerSize();
        }, { owners: [ this.connectionOwner ], initArgs: [] });

        this.video.videoLoadEvent.connect(() => {
            this.updateTextureCanvasSize();
            this.updateContainerSize();
        }, { owners: [ this.connectionOwner ], initArgs: [] });

        const render = () => {
            if(this.video.videoEl.videoWidth > 0 && this.video.videoEl.videoHeight > 0) {
                this.texCtx.drawImage(this.video.videoEl, 0, 0);
                this.renderedCanvas.setTexture(this.textureCanvasEl);
            }
            this.render();

            this.renderEvent.fire();
        }

        const videoFrameUpdate = () => {
            render();
            return this.video.videoEl.requestVideoFrameCallback(videoFrameUpdate);
        }
        videoFrameUpdate();

        const pausedRender = () => {
            if(!this.video.videoEl.paused)
                return requestAnimationFrame(pausedRender);
            render();
            return requestAnimationFrame(pausedRender);
        }
        pausedRender();
    }

    updateTextureCanvasSize() {
        let width = this.video.videoEl.videoWidth;
        let height = this.video.videoEl.videoHeight;
        if(width == 0 || height == 0) {
            this.textureCanvasEl.width = 1;
            this.textureCanvasEl.height = 1;
            this.texCtx.fillStyle = "black";
            this.texCtx.fillRect(0, 0, 1, 1);
        } else {
            this.textureCanvasEl.width = this.video.videoEl.videoWidth;
            this.textureCanvasEl.height = this.video.videoEl.videoHeight;
        }
    }

    clear() {
        this.texCtx.clearRect(0, 0, this.textureCanvasEl.width, this.textureCanvasEl.height);
        this.renderedCanvas.setTexture(this.textureCanvasEl);
        this.render();
    }

    updateRenderedOffset() {
        let scaleX = this.video.videoEl.videoWidth / 2 * this.camera.z / (this.renderedCanvas.containerEl.clientWidth / 2);
        let scaleY = this.video.videoEl.videoHeight / 2 * this.camera.z / (this.renderedCanvas.containerEl.clientHeight / 2);

        let offsetX = -this.camera.x / (this.renderedCanvas.containerEl.clientWidth / 2);
        let offsetY = this.camera.y / (this.renderedCanvas.containerEl.clientHeight / 2);

        this.renderedCanvas.setScale(scaleX, scaleY);
        this.renderedCanvas.setOffset(offsetX, offsetY);
    }

    updateContainerSize() {
        this.updateRenderCanvasSize();
        this.updateRenderedOffset();
        if(this.fitToContainerLock)
            this.zoomToCenterFitContainer();
    }

    updateRenderCanvasSize() {
        const width = this.renderedCanvas.containerEl.clientWidth;
        const height = this.renderedCanvas.containerEl.clientHeight;
        this.renderedCanvas.setCanvasSize(width, height);
        this.render();
    }

    zoomToCenterFitContainer() {
        const cWidth = this.renderedCanvas.containerEl.clientWidth;
        const cHeight = this.renderedCanvas.containerEl.clientHeight;
        const width = this.video.videoEl.videoWidth;
        const height = this.video.videoEl.videoHeight;
        this.camera.x = 0;
        this.camera.y = 0;
        if(width / height > cWidth / cHeight) {
            this.camera.z = cWidth / width;
        } else {
            this.camera.z = cHeight / height;
        }
        this.updateRenderedOffset();
        this.render();
    }

    zoomToCenterActualSize() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = 1;
        this.updateRenderedOffset();
        this.render();
    }

    zoomToCenter() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.updateRenderedOffset();
        this.render();
    }

    zoomInTo(sx: number, sy: number, by: number) {
        const rect = this.renderedCanvas.containerEl.getBoundingClientRect();
        let videoClientWidth = this.video.videoEl.videoWidth * this.camera.z;
        let videoClientHeight = this.video.videoEl.videoHeight * this.camera.z;
        const videoClientCenterX = rect.left + rect.width / 2 - this.camera.x;
        const videoClientCenterY = rect.top + rect.height / 2 - this.camera.y;
        const mxT = (sx - videoClientCenterX) / videoClientWidth;
        const myT = (sy - videoClientCenterY) / videoClientHeight;
        this.camera.x -= sx - videoClientCenterX;
        this.camera.y -= sy - videoClientCenterY;
        this.camera.z *= by;
        videoClientWidth = this.video.videoEl.videoWidth * this.camera.z;
        videoClientHeight = this.video.videoEl.videoHeight * this.camera.z;
        this.camera.x += mxT * videoClientWidth;
        this.camera.y += myT * videoClientHeight;
        this.updateRenderedOffset();
        this.render();
    }

    zoomInToContainerCenter(by: number) {
        const rect = this.renderedCanvas.containerEl.getBoundingClientRect();
        this.zoomInTo(rect.left + rect.width / 2, rect.top + rect.height / 2, by);
    }

    shift(x: number, y: number) {
        this.camera.x += x;
        this.camera.y += y;
        this.updateRenderedOffset();
        this.render();
    }

    isPaused() {
        return this.video.getShouldPause();
    }

    isPausedIgnoreInput() {
        return this.video.getShouldPauseIgnoreInputs();
    }

    play() {
        return this.video.play();
    }

    pause() {
        return this.video.pause();
    }

    async seekTo(t: number) {
        return await this.video.seekTo(t);
    }

    async setUrl(url: string) {
        this.clear();
        return await this.video.setUrl(url);
    }

    setVisible(v: boolean) {
        if(v) {
            this.visible = true;
            this.renderedCanvas.containerEl.style.display = "block";
            this.updateContainerSize();
        } else {
            this.visible = false;
            this.renderedCanvas.containerEl.style.display = "none";
        }
    }

    render() {
        this.renderedCanvas.render();
    }

    remove() {
        this.connectionOwner.disconnectAll();
        this.renderedCanvas.containerEl.remove();
    }
}