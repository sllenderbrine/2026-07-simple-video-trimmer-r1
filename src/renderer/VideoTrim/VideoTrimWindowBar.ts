import { ConnectionOwner } from "../../shared/EventSignals/ConnectionOwner.js";
import { WindowBar, WindowBarSide } from "../Ui/WindowBar.js";
import { WindowKeypresses } from "../Ui/WindowGlobal/WindowKeypresses.js";
import { VdvSortMethod } from "./VideoDirectoryViewer.js";
import type { VideoTrimApp } from "./VideoTrimApp.js";

export class VideoTrimWindowBar extends WindowBar {
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    constructor(
        public app: VideoTrimApp
    ) {
        super();

        WindowKeypresses.keyDownEvent.connect((e) => {
            const key = e.key.toLowerCase();
            if(key == "0" && e.ctrlKey) {
                this.app.runAppAction("toggle-free-move");
            }
        }, { owners: [ this.connectionOwner ] });
        
        this.addTextButton("File", () => {
            if(this.app.editorOpened) {
                return [
                    {
                        title: "Close Video",
                        icon: "back",
                        data: { action: "close-editor", },
                        separator: true,
                    },
                    {
                        title: "Apply Edits",
                        icon: "save",
                        iconScale: 0.95,
                        keybind: "Ctrl + S",
                        disabled: !this.app.trimEditor.getHasUnsavedChanges(),
                        data: { action: "save-editor", },
                    },
                    {
                        title: "Save As...",
                        icon: "save-as",
                        iconScale: 1.15,
                        keybind: "Ctrl + Shift + S",
                        disabled: !this.app.trimEditor.getHasUnsavedChanges(),
                        data: { action: "save-as-editor", },
                    },
                    {
                        title: "Save As New",
                        icon: "save-new",
                        iconScale: 1.15,
                        keybind: "Ctrl + Shift + N",
                        disabled: !this.app.trimEditor.getHasUnsavedChanges(),
                        separator: true,
                        data: { action: "save-as-editor", },
                    },
                    {
                        title: "Settings...",
                        icon: "settings",
                        dangerSeparator: true,
                        data: { action: "coming-soon", },
                    },
                    {
                        title: "Exit",
                        icon: "small-cross",
                        data: { action: "exit", },
                        danger: true,
                    },
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
                        disabled: !this.app.vdirViewer.loaded,
                        data: { action: "refresh", },
                    },
                    {
                        title: "Recents",
                        icon: "library",
                        children: this.app.settings.loaded.get() ? this.app.settings.settings.recentFolders.map(v => {
                            return {
                                title: v,
                                data: { action: "open-recent", path: v, },
                                rightAligned: true,
                            };
                        }) : [ ],
                        data: { action: "coming-soon", },
                    },
                    {
                        title: "Close Folder",
                        icon: "close-folder",
                        data: { action: "close-folder", },
                        disabled: !this.app.vdirViewer.loaded,
                    },
                    {
                        title: "Settings...",
                        icon: "settings",
                        dangerSeparator: true,
                        data: { action: "coming-soon", },
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
                        disabled: this.app.trimEditor.undoActions.length == 0,
                        data: { action: "undo-editor", },
                    },
                    {
                        title: "Redo",
                        keybind: "Ctrl + Shift + Z",
                        icon: "redo",
                        disabled: this.app.trimEditor.redoActions.length == 0,
                        data: { action: "redo-editor", },
                        separator: true,
                    },
                    {
                        title: "Crop Preset",
                        icon: "crop",
                        children: [
                            {
                                title: "None",
                                icon: "small-check",
                                data: { action: "editor-crop-none" },
                            },
                            {
                                title: "Left Half",
                                icon: undefined,
                                data: { action: "editor-crop-left-half" },
                            },
                            {
                                title: "Right Half",
                                icon: undefined,
                                data: { action: "editor-crop-right-half" },
                            },
                            {
                                title: "Top Half",
                                icon: undefined,
                                data: { action: "editor-crop-top-half" },
                            },
                            {
                                title: "Bottom Half",
                                icon: undefined,
                                data: { action: "editor-crop-bottom-half" },
                            },
                            {
                                title: "Custom...",
                                icon: undefined,
                                data: { action: "editor-crop-prompt-custom" },
                            },
                        ],
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
                    {
                        title: "Take Screenshot",
                        icon: "screenshot",
                        data: { action: "editor-snapshot", },
                    },
                    {
                        title: "Loop Video",
                        icon: this.app.trimEditor.canvas.video.isLooped() ? "small-check" : undefined,
                        data: { action: "toggle-loop", },
                    },
                    {
                        title: "Free Move",
                        keybind: "Ctrl + 0",
                        icon: this.app.trimEditor.canvas.fitToContainerLock ? undefined : "small-check",
                        data: { action: "toggle-free-move", },
                    },
                    {
                        title: "Pin Video Timeline",
                        icon: this.app.trimEditor.bottomBar.isPinned() ? "small-check" : undefined,
                        data: { action: "toggle-pin-timeline", },
                    },
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
                this.app.runAppAction(e.contextMenuButton.data.action, e.contextMenuButton.data);
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