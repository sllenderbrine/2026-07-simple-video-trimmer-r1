import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { HtmlConnection } from "../../shared/EventSignals/HtmlConnection.js";
import { Signal } from "../../shared/EventSignals/Signal.js";
import { Settings } from "../../shared/VideoTrim/UserSettingsUtility.js";
import { NotificationIconType, NotificationSystem } from "../Ui/NotificationSystem.js";
import { StartupMenu } from "./StartupMenu.js";
import { VdvSortMethod, VideoDirectoryViewer } from "./VideoDirectoryViewer.js";
import { VideoTrimEditor } from "./VideoTrimEditor.js";
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
    settings?: Settings;
    keypresses: { [key: string]: boolean } = {};
    keyDownEvent: Signal<[e: KeyboardEvent]> = new Signal();
    keyUpEvent: Signal<[e: KeyboardEvent]> = new Signal();
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor() {
        this.contentEl = document.createElement("div");
        document.body.appendChild(this.contentEl);
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

        vdv.videoOpenEvent.connect(vdvv => {
            this.editorOpened = true;
            vdv.setVisible(false);
            vte.setVisible(true);
            this.trimEditor.canvas.userPaused = false;
            this.trimEditor.canvas.setUrl(vdvv.path);
        }, { owners: [ this.connectionOwner ] });

        window.settingsApi.load().then(res => {
            if(res.success) {
                this.settings = res.value;
                this.startupMenu.updateRecents();
            } else {
                this.notificationSystem.sendActiveNotification({
                    title: "Error",
                    iconType: NotificationIconType.ERROR,
                    description: "Error loading settings.json",
                });
            }
        });

        new HtmlConnection(window, "keydown", (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            this.keypresses[key] = true;
            this.keyDownEvent.fire(e);
        }, { owners: [ this.connectionOwner ] });

        new HtmlConnection(window, "keyup", (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            delete this.keypresses[key];
            this.keyUpEvent.fire(e);
        }, { owners: [ this.connectionOwner ] });
    }

    async promptOpenDirectory() {
        const dir = await window.fileApi.promptChooseDirectory();
        if(dir != null) {
            let res = await window.fileApi.getDirectoryFileList(dir);
            if(res.success) {
                this.vdirViewer.loadVideos(dir, res.value);
                this.startupMenu.containerEl.style.display = "none";
            } else {
                const notif = this.notificationSystem.sendActiveNotification({
                    title: "Error",
                    iconType: NotificationIconType.ERROR,
                    description: "Failed to get directory",
                });
                notif.addViewDetailsLink();
            }
        } else {

        }
    }

    runAppAction(action: string) {
        switch(action) {
            case "open-folder":
                this.promptOpenDirectory();
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
                    this.trimEditor.canvas.unloadVideo();
                }
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