import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { ObservedValue } from "../../shared/EventSignals/ObservedValue.js";
import { clamp, lerpClamped } from "../../shared/Utility/MathUtility.js";
import { addRecentFolder } from "../../shared/VideoTrim/UserSettingsUtility.js";
import { NotificationIconType, NotificationSystem } from "../Ui/NotificationSystem.js";
import { StartupMenu } from "./StartupMenu.js";
import { VdvSortMethod, VideoDirectoryViewer } from "./VideoDirectoryViewer.js";
import { VideoTrimEditor } from "./VideoTrimEditor.js";
import { VideoTrimSettings } from "./VideoTrimSettings.js";
import { VideoTrimWindowBar } from "./VideoTrimWindowBar.js";

export class VideoTrimApp {
    contentEl: HTMLDivElement;
    excludedFileNames: Set<string> = new Set()
    vdirViewer: VideoDirectoryViewer;
    trimEditor: VideoTrimEditor;
    startupMenu: StartupMenu;
    windowBar: VideoTrimWindowBar;
    notificationSystem: NotificationSystem;
    editorOpened: boolean = false;
    loaded = new ObservedValue(false);
    settings: VideoTrimSettings;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor() {
        this.contentEl = document.createElement("div");
        this.contentEl.classList.add("video-trim-app-content");

        this.windowBar = new VideoTrimWindowBar(this);
        
        this.notificationSystem = new NotificationSystem(this.windowBar);
        document.body.appendChild(this.notificationSystem.activeContainerEl);

        const vdv = new VideoDirectoryViewer(this);
        this.vdirViewer = vdv;
        this.contentEl.appendChild(vdv.containerEl);

        const vte = new VideoTrimEditor(this);
        this.trimEditor = vte;
        this.contentEl.appendChild(vte.containerEl);
        vte.setVisible(false);

        this.startupMenu = new StartupMenu(this);
        this.contentEl.appendChild(this.startupMenu.containerEl);

        const loadingNotif = this.notificationSystem.sendActiveNotification({
            title: "Loading",
            description: "Loading your settings...",
            iconType: NotificationIconType.LOADING,
            canClose: true,
            descriptionWordBreak: true,
        });

        this.settings = new VideoTrimSettings(this);
        this.settings.loaded.handle(v => {
            this.updateLoadedState();
            loadingNotif.setIconType(NotificationIconType.CHECK);
            loadingNotif.setTitle("Settings Loaded");
            loadingNotif.setDescription("");
            loadingNotif.setTimeout(3);
        }, { owners: [ this.connectionOwner, ], });

        vdv.videoOpenEvent.connect(vdvv => {
            this.editorOpened = true;
            vdv.setVisible(false);
            vte.setVisible(true);
            vte.loadVideo(vdvv);
        }, { owners: [ this.connectionOwner, ], });

        this.updateLoadedState();
    }

    updateLoadedState() {
        if(this.loaded.get())
            return;
        if(this.settings.loaded.get()) {
            document.body.appendChild(this.contentEl);
            this.loaded.set(true);
        }
    }

    async promptOpenDirectory() {
        const dir = await window.fileApi.promptChooseDirectory();
        if(dir != null) {
            return this.openVideoDirectory(dir);
        }
        return null;
    }

    async openVideoDirectory(path: string) {
        let res = await window.fileApi.getDirectoryFileList(path);
        if(res.success) {
            this.vdirViewer.loadVideos(path, res.value);
            this.startupMenu.containerEl.style.display = "none";
            return path;
        } else {
            const notif = this.notificationSystem.sendActiveNotification({
                title: "Error",
                iconType: NotificationIconType.ERROR,
                description: "Failed to get directory",
            });
            notif.addViewDetailsLink();
        }
        return null;
    }

    runAppAction(action: string, options?: any) {
        switch(action) {
            case "open-folder":
                this.promptOpenDirectory().then(dir => {
                    if(dir) {
                        addRecentFolder(this.settings.settings, dir);
                        this.settings.save();
                    }
                });
                break;
            case "open-recent":
                if(options != null && typeof options.path === "string") {
                    this.openVideoDirectory(options.path);
                    addRecentFolder(this.settings.settings, options.path);
                    this.settings.save();
                }
                break;
            case "close-folder":
                this.vdirViewer.unloadVideos();
                this.startupMenu.containerEl.style.display = "flex";
                break;
            case "refresh":
                this.vdirViewer.refresh();
                break;
            case "sort-date-recent":
                this.vdirViewer.sortMethod = VdvSortMethod.DATE_RECENT;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-date-old":
                this.vdirViewer.sortMethod = VdvSortMethod.DATE_OLD;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-name-a-z":
                this.vdirViewer.sortMethod = VdvSortMethod.NAME_A_Z;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-name-z-a":
                this.vdirViewer.sortMethod = VdvSortMethod.NAME_Z_A;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-duration-long":
                this.vdirViewer.sortMethod = VdvSortMethod.DURATION_LONG;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-duration-short":
                this.vdirViewer.sortMethod = VdvSortMethod.DURATION_SHORT;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-size-big":
                this.vdirViewer.sortMethod = VdvSortMethod.SIZE_BIG;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-size-small":
                this.vdirViewer.sortMethod = VdvSortMethod.SIZE_SMALL;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-random":
                this.vdirViewer.sortMethod = VdvSortMethod.OTHER_RANDOM;
                this.vdirViewer.updateVideoSort();
                break;
            case "toggle-free-move":
                if(this.editorOpened) {
                    let locked = !this.trimEditor.canvas.fitToContainerLock;
                    this.trimEditor.canvas.fitToContainerLock = locked;
                    if(locked) {
                        this.trimEditor.canvas.zoomToCenterFitContainer();
                        this.trimEditor.canvas.render();
                    }
                }
                break;
            case "close-editor":
                if(this.editorOpened) {
                    this.editorOpened = false;
                    this.vdirViewer.setVisible(true);
                    this.trimEditor.setVisible(false);
                    this.trimEditor.canvas.video.unloadVideo();
                }
                break;
            case "toggle-loop":
                if(this.editorOpened) {
                    this.trimEditor.canvas.video.setLooped(!this.trimEditor.canvas.video.isLooped());
                }
                break;
            case "toggle-pin-timeline":
                if(this.editorOpened) {
                    this.trimEditor.bottomBar.setPinned(!this.trimEditor.bottomBar.isPinned());
                }
                break;
            case "editor-snapshot":
                if(!this.editorOpened)
                    break;
                this.trimEditor.canvas.saveScreenshot().then(result => {
                    if(result.success) {
                        this.notificationSystem.sendActiveNotification({
                            title: "Screenshot Saved",
                            description: "Screenshot saved to:" + result.value.path,
                            iconType: NotificationIconType.CHECK,
                            timeout: 5,
                            viewDetails: true,
                            canClose: true,
                        });
                    } else {
                        console.error("Failed to save screenshot: " + result.error.message);
                        const notif = this.notificationSystem.sendActiveNotification({
                            title: "Error",
                            description: "",
                            iconType: NotificationIconType.ERROR,
                            timeout: 5,
                            viewDetails: true,
                            canClose: true,
                        });
                        notif.descriptionEl.innerHTML = "<span>Failed to save screenshot</span>" + notif.descriptionEl.innerHTML;
                        notif.descriptionEl.querySelector("span")!.style.wordBreak = "break-word";
                    }
                });
                break;
            case "exit":
                window.windowApi.close();
                break;
            case "open-github-repo":
                window.redirectApi.openGithubRepo();
                break;
            case "coming-soon":
                this.notificationSystem.sendActiveNotification({
                    title: "Coming Soon",
                    iconType: NotificationIconType.INFO,
                    description: "This feature is coming soon",
                    descriptionWordBreak: true,
                    timeout: 3,
                })
                break;
        }
    }
}