import { WindowBar, WindowBarSide } from "../Ui/WindowBar.js";
import { VdvSortMethod } from "./VideoDirectoryViewer.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";

export class VideoTrimWindowBar extends WindowBar {
    constructor(
        public app: VideoTrimApp
    ) {
        super();

        
        this.addTextButton("File", () => {
            if(this.app.editorOpened) {
                return [

                ];
            } else {
                return [
                    {
                        title: "Open Folder...",
                        icon: "folder",
                        keybind: "Ctrl + O",
                        data: { action: "open-folder", },
                    },
                    {
                        title: "Refresh",
                        icon: "refresh",
                        keybind: "Ctrl + R",
                        disabled: !this.app.vdirViewer.isLoaded,
                        data: { action: "refresh", },
                    },
                    {
                        title: "Recents",
                        icon: "library",
                        children: [

                        ],
                        separator: true,
                        data: { action: "coming-soon", },
                    },
                    {
                        title: "Preferences...",
                        icon: "settings",
                        separator: true,
                        data: { action: "coming-soon", },
                    },
                    {
                        title: "Close Folder",
                        icon: "close-folder",
                        data: { action: "close-folder", },
                        disabled: !this.app.vdirViewer.isLoaded,
                        dangerSeparator: true,
                    },
                    {
                        title: "Exit",
                        icon: "small-cross",
                        data: { action: "exit", },
                        danger: true,
                    },
                ];
            }
        }, null, WindowBarSide.LEFT);
        this.addTextButton("Edit", () => {
            if(this.app.editorOpened) {
                return [
                    {
                        title: "Undo",
                        keybind: "Ctrl + Z",
                        icon: "undo",
                        data: { action: "undo-editor", },
                    },
                    {
                        title: "Redo",
                        keybind: "Ctrl + Shift + Z",
                        icon: "redo",
                        data: { action: "redo-editor", },
                    },
                ];
            } else {
                return [
                    
                ];
            }
        }, null, WindowBarSide.LEFT);
        this.addTextButton("View", () => {
            if(this.app.editorOpened) {
                return [

                ];
            } else {
                return [
                    {
                        title: "Sort By",
                        icon: "sort-down",
                        children: [
                            {
                                title: "Date",
                                icon: (
                                    this.app.vdirViewer.sortMethod == VdvSortMethod.DATE_RECENT
                                    || this.app.vdirViewer.sortMethod == VdvSortMethod.DATE_OLD
                                ) ? "small-check" : undefined,
                                children: [
                                    {
                                        title: "Recent",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.DATE_RECENT ? "small-check" : undefined,
                                        data: { action: "sort-date-recent", },
                                    },
                                    {
                                        title: "Old",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.DATE_OLD ? "small-check" : undefined,
                                        data: { action: "sort-date-old", },
                                    },
                                ],
                            },
                            {
                                title: "Name",
                                icon: (
                                    this.app.vdirViewer.sortMethod == VdvSortMethod.NAME_A_Z
                                    || this.app.vdirViewer.sortMethod == VdvSortMethod.NAME_Z_A
                                ) ? "small-check" : undefined,
                                children: [
                                    {
                                        title: "A-Z",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.NAME_A_Z ? "small-check" : undefined,
                                        data: { action: "sort-name-a-z", },
                                    },
                                    {
                                        title: "Z-A",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.NAME_Z_A ? "small-check" : undefined,
                                        data: { action: "sort-name-z-a", },
                                    },
                                ],
                            },
                            {
                                title: "Duration",
                                icon: (
                                    this.app.vdirViewer.sortMethod == VdvSortMethod.DURATION_LONG
                                    || this.app.vdirViewer.sortMethod == VdvSortMethod.DURATION_SHORT
                                ) ? "small-check" : undefined,
                                children: [
                                    {
                                        title: "Long",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.DURATION_LONG ? "small-check" : undefined,
                                        data: { action: "sort-duration-long", },
                                    },
                                    {
                                        title: "Short",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.DURATION_SHORT ? "small-check" : undefined,
                                        data: { action: "sort-duration-short", },
                                    },
                                ],
                            },
                            {
                                title: "Size",
                                icon: (
                                    this.app.vdirViewer.sortMethod == VdvSortMethod.SIZE_BIG
                                    || this.app.vdirViewer.sortMethod == VdvSortMethod.SIZE_SMALL
                                ) ? "small-check" : undefined,
                                children: [
                                    {
                                        title: "Big",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.SIZE_BIG ? "small-check" : undefined,
                                        data: { action: "sort-size-big", },
                                    },
                                    {
                                        title: "Small",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.SIZE_SMALL ? "small-check" : undefined,
                                        data: { action: "sort-size-small", },
                                    },
                                ],
                            },
                            {
                                title: "Other",
                                icon: (
                                    this.app.vdirViewer.sortMethod == VdvSortMethod.OTHER_RANDOM
                                ) ? "small-check" : undefined,
                                children: [
                                    {
                                        title: "Random",
                                        icon: this.app.vdirViewer.sortMethod == VdvSortMethod.OTHER_RANDOM ? "small-check" : undefined,
                                        data: { action: "sort-random", },
                                    },
                                ],
                            },
                        ],
                    },
                ];
            }
        }, null, WindowBarSide.LEFT);
        this.addTextButton("Help", () => {
            return [
                {
                    title: "↪ Github",
                    icon: "github",
                    data: { action: "open-github-repo" },
                },
            ];
        }, null, WindowBarSide.LEFT);

        this.menuButtonClickEvent.connect((e) => {
            if(e.contextMenuButton != null && e.contextMenuButton.data != null && e.contextMenuButton.data.action != null) {
                this.app.runAppAction(e.contextMenuButton.data.action);
                let parent = e.contextMenu!;
                while(parent.parent && parent.parent != parent)
                    parent = parent.parent;
                parent.remove();
            }
        }, { owners: [ this.connectionOwner ] });

        this.closeFunc = () => {
            this.app.runAppAction("exit");
        }
    }
}