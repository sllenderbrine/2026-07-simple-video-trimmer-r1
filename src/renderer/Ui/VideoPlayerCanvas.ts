import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { get2dContext } from "../../shared/Utility/Canvas2dUtility.js";
import { createAttributeBuffer, createProgram, createShader, getUniformLocation, getWebGl2Context } from "../../shared/Utility/WebGl2Utility.js";
import { Vec3 } from "../../shared/Vectors/Vec3.js";

export class VideoPlayerCanvas {
    containerEl: HTMLDivElement;
    videoEl: HTMLVideoElement;
    textureCanvasEl: HTMLCanvasElement;
    texCtx: CanvasRenderingContext2D;
    renderCanvasEl: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    quadVao: WebGLVertexArrayObject;
    quadPositionBuffer: WebGLBuffer;
    quadTexcoordBuffer: WebGLBuffer;
    videoSizeUniformLocation: WebGLUniformLocation;
    cameraUniformLocation: WebGLUniformLocation;
    resolutionUniformLocation: WebGLUniformLocation;
    textureUniformLocation: WebGLUniformLocation;
    texture: WebGLTexture;
    visible: boolean = true;
    fitToContainerLock: boolean = true;
    userPaused: boolean = false;
    seeking: boolean = false;
    targetSeekTime: number | null = null;
    loading: boolean = false;
    targetUrl: string | null = null;
    videoLoaded: boolean = false;
    camera: Vec3 = new Vec3(0, 0, 1);
    videoWidth: number = 1920;
    videoHeight: number = 1080;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor() {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("video-player-canvas-container");

        this.videoEl = document.createElement("video");
        
        this.textureCanvasEl = document.createElement("canvas");
        this.texCtx = get2dContext(this.textureCanvasEl);

        this.renderCanvasEl = document.createElement("canvas");
        this.containerEl.appendChild(this.renderCanvasEl);
        this.renderCanvasEl.classList.add("vpc-canvas");

        this.gl = getWebGl2Context(this.renderCanvasEl);
        const gl = this.gl;

        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, `#version 300 es
            in vec2 a_position;
            in vec2 a_texcoord;

            uniform vec2 u_resolution;
            uniform vec2 u_video_size;
            uniform vec3 u_camera;

            out vec2 v_texcoord;

            void main() {
                vec2 pos = (a_position * u_video_size / 2.0 * u_camera.z - u_camera.xy) / (u_resolution / 2.0);
                gl_Position = vec4(pos, 0, 1);
                v_texcoord = a_texcoord;
            }
        `);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
            precision highp float;
            
            in vec2 v_texcoord;

            uniform sampler2D u_texture;

            out vec4 outColor;

            void main() {
                outColor = texture(u_texture, v_texcoord);
            }
        `);

        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
        gl.useProgram(this.program);

        this.quadVao = gl.createVertexArray();
        this.quadPositionBuffer = createAttributeBuffer(gl, this.program, "a_position", this.quadVao, "vec2");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
             1,  1,
            -1, -1,
             1,  1,
             -1, 1,
        ]), gl.STATIC_DRAW);
        this.quadTexcoordBuffer = createAttributeBuffer(gl, this.program, "a_texcoord", this.quadVao, "vec2");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 1,
            1, 1,
            1, 0,
            0, 1,
            1, 0,
            0, 0,
        ]), gl.STATIC_DRAW);
        gl.bindVertexArray(this.quadVao);

        this.resolutionUniformLocation = getUniformLocation(gl, this.program, "u_resolution");
        this.videoSizeUniformLocation = getUniformLocation(gl, this.program, "u_video_size");
        this.cameraUniformLocation = getUniformLocation(gl, this.program, "u_camera");
        this.textureUniformLocation = getUniformLocation(gl, this.program, "u_texture");

        this.texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.textureUniformLocation, 0);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this.updateVideoSizeUniform();
        this.updateCameraUniform();
        
        new HtmlConnection(window, "resize", () => {
            if(!this.visible)
                return;
            this.updateContainerSize();
        }, { owners: [ this.connectionOwner ], initArgs: [] });

        const renderFrame = () => {
            if(!this.videoLoaded) {
                return requestAnimationFrame(renderFrame);
            }

            this.updateVideoFrameTexture();
            this.render();

            return this.videoEl.requestVideoFrameCallback(renderFrame);
        }
        renderFrame();
    }

    updateCameraUniform() {
        const gl = this.gl
        gl.uniform3f(this.cameraUniformLocation, this.camera.x, -this.camera.y, this.camera.z);
    }

    updateVideoSizeUniform() {
        const gl = this.gl
        gl.uniform2f(this.videoSizeUniformLocation, this.videoWidth, this.videoHeight);
    }

    updateRenderCanvasSize() {
        const gl = this.gl
        const width = this.containerEl.clientWidth;
        const height = this.containerEl.clientHeight;
        this.renderCanvasEl.width = width;
        this.renderCanvasEl.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(this.resolutionUniformLocation, width, height);
    }

    updateContainerSize() {
        this.updateRenderCanvasSize();
        if(this.fitToContainerLock)
            this.zoomToCenterFitContainer();
        this.render();
    }

    render() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    updateVideoFrameTexture() {
        const gl = this.gl;
        this.texCtx.drawImage(this.videoEl, 0, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvasEl);
    }

    zoomToCenterFitContainer() {
        const width = this.containerEl.clientWidth;
        const height = this.containerEl.clientHeight;
        this.camera.x = 0;
        this.camera.y = 0;
        if(this.videoWidth / this.videoHeight > width / height) {
            this.camera.z = width / this.videoWidth;
        } else {
            this.camera.z = height / this.videoHeight;
        }
        this.updateCameraUniform();
    }

    zoomToCenterActualSize() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = 1;
        this.updateCameraUniform();
    }

    zoomToCenter() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.updateCameraUniform();
    }

    zoomInTo(sx: number, sy: number, by: number) {
        const rect = this.renderCanvasEl.getBoundingClientRect();
        let videoClientWidth = this.videoWidth * this.camera.z;
        let videoClientHeight = this.videoHeight * this.camera.z;
        const videoClientCenterX = rect.left + rect.width / 2 - this.camera.x;
        const videoClientCenterY = rect.top + rect.height / 2 - this.camera.y;
        const mxT = (sx - videoClientCenterX) / videoClientWidth;
        const myT = (sy - videoClientCenterY) / videoClientHeight;
        this.camera.x -= sx - videoClientCenterX;
        this.camera.y -= sy - videoClientCenterY;
        this.camera.z *= by;
        videoClientWidth = this.videoWidth * this.camera.z;
        videoClientHeight = this.videoHeight * this.camera.z;
        this.camera.x += mxT * videoClientWidth;
        this.camera.y += myT * videoClientHeight;
        this.updateCameraUniform();
        this.render();
    }

    zoomInToContainerCenter(by: number) {
        const rect = this.renderCanvasEl.getBoundingClientRect();
        this.zoomInTo(rect.left + rect.width / 2, rect.top + rect.height / 2, by);
    }

    shift(x: number, y: number) {
        this.camera.x += x;
        this.camera.y += y;
        this.updateCameraUniform();
        this.render();
    }

    unloadVideo() {
        this.videoEl.removeAttribute("src");
        this.videoEl.load();
        this.videoLoaded = false;
    }

    async setUrl(url: string) {
        if(this.loading) {
            this.targetUrl = url;
            return;
        }
        this.videoLoaded = false;
        this.loading = true;
        await new Promise<void>(res => {
            let connections = new ConnectionOwner();
            new HtmlConnection(this.videoEl, "canplay", () => {
                connections.disconnectAll();
                res();
            }, { owners: [this.connectionOwner, connections] });
            this.videoEl.src = url;
        });
        this.loading = false;
        this.videoLoaded = true;
        this.videoWidth = this.videoEl.videoWidth;
        this.videoHeight = this.videoEl.videoHeight;
        this.updateVideoSizeUniform();
        this.textureCanvasEl.width = this.videoWidth;
        this.textureCanvasEl.height = this.videoHeight;
        this.handleTargetUrl();
        this.updateVideoPause();
    }

    handleTargetUrl() {
        if(this.targetUrl == null)
            return;
        return requestAnimationFrame(() => {
            let url2 = this.targetUrl;
            if(url2 == null)
                return;
            this.targetUrl = null;
            this.setUrl(url2);
        });
    }

    async seekTo(t: number) {
        if(!this.videoLoaded)
            return;
        if(this.seeking) {
            this.targetSeekTime = t;
            return;
        }
        this.seeking = true;
        await new Promise<void>(res => {
            let connections = new ConnectionOwner();
            new HtmlConnection(this.videoEl, "seeked", () => {
                connections.disconnectAll();
                res();
            }, { owners: [ this.connectionOwner, connections ] });
            this.videoEl.currentTime = t;
        });
        this.seeking = false;
        this.handleTargetSeek();
        this.updateVideoPause();
    }

    handleTargetSeek() {
        if(this.targetSeekTime == null)
            return;
        return requestAnimationFrame(() => {
            let t2 = this.targetSeekTime;
            if(t2 == null)
                return;
            this.targetSeekTime = null;
            this.seekTo(t2);
        });
    }

    updateVideoPause() {
        let pause = false;
        if(this.seeking || this.userPaused || !this.videoLoaded) {
            pause = true;
        }
        if(pause == this.videoEl.paused)
            return
        if(pause)
            this.videoEl.pause();
        else
            this.videoEl.play();
    }

    setVisible(v: boolean) {
        if(v) {
            this.visible = true;
            this.containerEl.style.display = "block";
            this.updateContainerSize();
        } else {
            this.visible = false;
            this.containerEl.style.display = "none";
        }
    }

    remove() {
        this.connectionOwner.disconnectAll();
        this.containerEl.remove();
    }
}