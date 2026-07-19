import { ConnectionOwner } from "../EventSignals/ConnectionOwner.js";
import { NotificationIconType, NotificationSystem } from "./NotificationSystem.js";
import { StartupMenu } from "./StartupMenu.js";
import { VdvSortMethod, VideoDirectoryViewer } from "./VideoDirectoryViewer.js";
import { WindowBar, WindowBarSide } from "./WindowBar.js";

export class VideoTrimApp {
    contentEl: HTMLDivElement;
    excludedFileNames: Set<string> = new Set()
    vdirViewer: VideoDirectoryViewer;
    startupMenu: StartupMenu;
    windowBar: WindowBar;
    notificationSystem: NotificationSystem;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor() {
        this.contentEl = document.createElement("div");
        document.body.appendChild(this.contentEl);
        this.contentEl.classList.add("video-trim-app-content");

        this.windowBar = new WindowBar();
        this.windowBar.addTextButton("File", () => {
            return [
                {
                    title: "Open Folder...",
                    icon: "folder",
                    keybind: "Ctrl + O",
                    data: { action: "open-folder", },
                },
                {
                    title: "Close Folder",
                    icon: "close-folder",
                    data: { action: "close-folder", },
                    disabled: !this.vdirViewer.isLoaded,
                },
            ];
        }, null, WindowBarSide.LEFT);
        this.windowBar.addTextButton("Edit", () => {
            return [
                
            ];
        }, null, WindowBarSide.LEFT);
        this.windowBar.addTextButton("View", () => {
            return [
                {
                    title: "Sort By",
                    icon: "sort-down",
                    children: [
                        {
                            title: "Recent",
                            icon: this.vdirViewer.sortMethod == VdvSortMethod.RECENT ? "small-check" : undefined,
                            data: { action: "sort-recent", },
                        },
                        {
                            title: "Old",
                            icon: this.vdirViewer.sortMethod == VdvSortMethod.OLD ? "small-check" : undefined,
                            data: { action: "sort-old", },
                        },
                        {
                            title: "A-Z",
                            icon: this.vdirViewer.sortMethod == VdvSortMethod.A_Z ? "small-check" : undefined,
                            data: { action: "sort-az", },
                        },
                        {
                            title: "Z-A",
                            icon: this.vdirViewer.sortMethod == VdvSortMethod.Z_A ? "small-check" : undefined,
                            data: { action: "sort-za", },
                        },
                        {
                            title: "Random",
                            icon: this.vdirViewer.sortMethod == VdvSortMethod.RANDOM ? "small-check" : undefined,
                            data: { action: "sort-random", },
                        },
                    ],
                },
            ];
        }, null, WindowBarSide.LEFT);
        this.windowBar.addTextButton("Help", () => {
            return [
                {
                    title: "Github ↪",
                    icon: "github",
                    data: { action: "open-github-repo" },
                },
            ];
        }, null, WindowBarSide.LEFT);

        this.windowBar.menuButtonClickEvent.connect((e) => {
            if(e.contextMenuButton != null && e.contextMenuButton.data != null && e.contextMenuButton.data.action != null) {
                this.runAppAction(e.contextMenuButton.data.action);
                let parent = e.contextMenu!;
                while(parent.parent && parent.parent != parent)
                    parent = parent.parent;
                parent.remove();
            }
        }, { owners: [ this.connectionOwner ] });
        
        this.notificationSystem = new NotificationSystem(this.windowBar);
        document.body.appendChild(this.notificationSystem.activeContainerEl);

        const vdv = new VideoDirectoryViewer(this.notificationSystem);
        this.vdirViewer = vdv;
        this.contentEl.appendChild(vdv.containerEl);
        
        this.startupMenu = new StartupMenu();
        this.contentEl.appendChild(this.startupMenu.containerEl);
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
            case "sort-recent":
                this.vdirViewer.sortMethod = VdvSortMethod.RECENT;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-old":
                this.vdirViewer.sortMethod = VdvSortMethod.OLD;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-az":
                this.vdirViewer.sortMethod = VdvSortMethod.A_Z;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-za":
                this.vdirViewer.sortMethod = VdvSortMethod.Z_A;
                this.vdirViewer.updateVideoSort();
                break;
            case "sort-random":
                this.vdirViewer.sortMethod = VdvSortMethod.RANDOM;
                this.vdirViewer.updateVideoSort();
                break;
            case "open-github-repo":
                window.redirectApi.openGithubRepo();
                break;
        }
    }
}