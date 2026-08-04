import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { Signal } from "../../shared/EventSignals/Signal.js";
import { BusyProcess, waitForHtmlEvent } from "../../shared/Utility/UiUtility.js";

export class VideoWithScriptControls {
    videoEl: HTMLVideoElement;
    _userPaused: boolean = false;
    _inputtingSeek: boolean = false;
    _videoLoaded: boolean = false;

    _seeking: BusyProcess<number> = new BusyProcess();
    _loading: BusyProcess<string> = new BusyProcess();

    _minSeek: number | null = null;
    _maxSeek: number | null = null;
    _looped: boolean = false;

    videoLoadEvent: Signal<[]> = new Signal();
    
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        videoEl?: HTMLVideoElement
    ) {
        this.videoEl = videoEl ?? document.createElement("video");

        const onVideoFrame = () => {
            const cTime = this.videoEl.currentTime;
            if(this._minSeek != null && cTime < this._minSeek) {
                this.seekTo(this._minSeek);
            }
            if(cTime >= (this._maxSeek ?? this.videoEl.duration)) {
                if(this._looped)
                    this.seekTo(this._minSeek ?? 0);
                else {
                    this.seekTo(this._maxSeek ?? this.videoEl.duration);
                    if(!this._inputtingSeek)
                        this.pause();
                }
            }
            this.videoEl.requestVideoFrameCallback(onVideoFrame);
        }
        this.videoEl.requestVideoFrameCallback(onVideoFrame);
        
        new HtmlConnection(this.videoEl, "load", () => {
            console.log("loaded video " + this.videoEl.src);
        }, { owners: [ this.connectionOwner, ], });
        
        new HtmlConnection(this.videoEl, "ended", () => {
            if(!this.getShouldPause()) {
                if(this._looped) {
                    this.seekTo(this._minSeek ?? 0);
                } else {
                    this._userPaused = true;
                }
            }
        }, { owners: [ this.connectionOwner ] });
    }
    
    unloadVideo() {
        this.videoEl.removeAttribute("src");
        this.videoEl.load();
        this._seeking.setActive(false);
        this._videoLoaded = false;
    }

    async setUrl(url: string) {
        if(!(await this._loading.waitForTurn(url)))
            return;
        let value = this._loading.getValue()!;
        if(value == null)
            return;
        this._videoLoaded = false;
        this._loading.setActive(true);
        await waitForHtmlEvent(this.videoEl, "canplay", null, () => {
            this.videoEl.src = value;
        });
        this._loading.setActive(false);
        this._videoLoaded = true;
        this.updatePause();
        this.videoLoadEvent.fire();
    }

    async seekTo(t: number) {
        if(!(await this._seeking.waitForTurn(t)))
            return;
        let value = this._seeking.getValue();
        if(value == null)
            return;
        this._seeking.setActive(true);
        await waitForHtmlEvent(this.videoEl, "seeked", null, () => {
            this.videoEl.currentTime = value;
        });
        this._seeking.setActive(false);
        this.updatePause();
    }

    getShouldPause() {
        if(
            this._seeking.isActive()
            || this._inputtingSeek
            || this._userPaused
            || !this._videoLoaded
        ) {
            return true;
        }
        return false;
    }

    getShouldPauseIgnoreInputs() {
        if(
            this._seeking.isActive()
            || this._userPaused
            || !this._videoLoaded
        ) {
            return true;
        }
        return false;
    }

    updatePause() {
        if(this.getShouldPause())
            this.videoEl.pause();
        else
            this.videoEl.play();
    }

    getMinSeek() {
        return this._minSeek;
    }

    setMinSeek(t: number) {
        t = Math.max(t, 0);
        this._minSeek = t;
        if(this.videoEl.currentTime < t)
            this.seekTo(t);
    }

    getMaxSeek() {
        return this._maxSeek;
    }

    setMaxSeek(t: number) {
        this._maxSeek = t;
        if(this.videoEl.currentTime > t)
            this.seekTo(t);
    }

    isLooped() {
        return this._looped;
    }

    setLooped(v: boolean) {
        this._looped = v;
    }

    isInputtingSeek() {
        return this._inputtingSeek;
    }

    setInputtingSeek(v: boolean) {
        this._inputtingSeek = v;
        this.updatePause();
    }
    
    isLoaded() {
        return this._videoLoaded;
    }

    play() {
        this._userPaused = false;
        if(this.videoEl.currentTime >= (this._maxSeek ?? this.videoEl.duration))
            this.seekTo(this._minSeek ?? 0);
        this.updatePause();
    }

    pause() {
        this._userPaused = true;
        this.updatePause();
    }

    remove() {
        this.connectionOwner.disconnectAll();
        this.videoEl.remove();
    }
}