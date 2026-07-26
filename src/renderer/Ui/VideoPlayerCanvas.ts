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
    visible: boolean = true;
    fitToContainerLock: boolean = true;
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
                vec2 pos = a_position / u_resolution * u_video_size * u_camera.z + u_camera.xy;
                gl_Position = vec4(pos, 0, 1);
                v_texcoord = a_texcoord;
            }
        `);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
            precision highp float;
            
            in vec2 v_texcoord;

            out vec4 outColor;

            void main() {
                outColor = vec4(v_texcoord, 0, 1);
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
            0, 0,
            1, 0,
            1, 1,
            0, 0,
            1, 1,
            0, 1,
        ]), gl.STATIC_DRAW);
        gl.bindVertexArray(this.quadVao);

        this.resolutionUniformLocation = getUniformLocation(gl, this.program, "u_resolution");
        this.videoSizeUniformLocation = getUniformLocation(gl, this.program, "u_video_size");
        this.cameraUniformLocation = getUniformLocation(gl, this.program, "u_camera");

        this.updateVideoSizeUniform();
        this.updateCameraUniform();
        
        new HtmlConnection(window, "resize", () => {
            if(!this.visible)
                return;
            this.updateContainerSize();
        }, { owners: [ this.connectionOwner ], initArgs: [] });
    }

    updateCameraUniform() {
        const gl = this.gl
        gl.uniform3f(this.cameraUniformLocation, this.camera.x, this.camera.y, this.camera.z);
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

    zoomToCenterFitContainer() {
        const width = this.containerEl.clientWidth;
        const height = this.containerEl.clientHeight;
        if(this.videoWidth / this.videoHeight > width / height) {
            this.camera.z = width / this.videoWidth;
        } else {
            this.camera.z = height / this.videoHeight;
        }
        this.updateCameraUniform();
    }

    zoomToCenterActualSize() {

    }

    zoomToCenter() {

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