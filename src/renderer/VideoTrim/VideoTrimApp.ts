import { FileListView } from "./FileListView.js";
import { NotificationSystem } from "./NotificationSystem.js";
import { TrimView } from "./TrimView.js";
import { WindowBar, WindowBarSide } from "./WindowBar.js";

export class VideoTrimApp {
    excludedFileNames: Set<string> = new Set()
    fileListView: FileListView;
    trimView?: TrimView;
    windowBar: WindowBar;
    notificationSystem: NotificationSystem;
    constructor() {
        this.fileListView = new FileListView(this.getExcludedFileNames.bind(this));
        this.windowBar = new WindowBar();
        this.windowBar.addTextButton("File", () => {
            return [
                {
                    title: "Open Directory...",
                    icon: "open-folder",
                    data: { action: "open-directory", },
                },
            ];
        }, null, WindowBarSide.LEFT);
        this.notificationSystem = new NotificationSystem(this.windowBar);
    }

    getExcludedFileNames() {
        return this.excludedFileNames;
    }

    async promptOpenDirectory() {
        const res = await window.fileApi.promptChooseDirectory();
        if(res.success) {
            if(res.directory != null) {
                this.fileListView.setDirectory(res.directory);
            }
        } else {
            this.notificationSystem.sendActiveNotification({
                title: "Error",
                iconType: NotificationIconType.ERROR,
                description: "Error opening directory",
                timeout: 5,
            });
            this.notificationSystem.sendPassiveNotification({
                title: "Error opening directory",
                description: res.message,
                important: false,
            });
        }
    }

    runAppAction(action: string) {
        switch(action) {
            case "open-directory":
                this.promptOpenDirectory();
                break;
        }
    }
}