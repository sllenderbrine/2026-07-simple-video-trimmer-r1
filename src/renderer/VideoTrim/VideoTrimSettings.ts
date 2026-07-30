import { Signal } from "../../shared/EventSignals/Signal.js";
import { delay } from "../../shared/Utility/PromiseUtility.js";
import { createSettings, Settings } from "../../shared/VideoTrim/UserSettingsUtility.js";
import { NotificationIconType } from "../Ui/NotificationSystem.js";
import { VideoTrimApp } from "./VideoTrimApp.js";

export class VideoTrimSettings {
    settings: Settings = createSettings();
    loaded: boolean = false;
    saving: boolean = false;
    awaitingSave: boolean = false;
    loadEvent: Signal<[]> = new Signal();
    constructor(
        public app: VideoTrimApp,
    ) {
        window.settingsApi.load().then(res => {
            if(res.success) {
                this.settings = res.value;
                this.app.startupMenu.updateRecents();
                this.loaded = true;
                this.loadEvent.fire();
            } else {
                this.app.notificationSystem.sendActiveNotification({
                    title: "Error",
                    iconType: NotificationIconType.ERROR,
                    description: "Error loading settings.json",
                });
            }
        });
    }

    async save() {
        if(!this.loaded)
            return;
        if(this.saving) {
            if(this.awaitingSave)
                return;
            this.awaitingSave = true;
            while(this.saving)
                await delay(50);
            this.awaitingSave = false;
        }
        this.saving = true;
        await window.settingsApi.save(this.settings);
        this.saving = false;
    }

    addRecentFolder(dir: string) {
        this.settings.recentFolders.unshift(dir);
        while(this.settings.recentFolders.length > 6)
            this.settings.recentFolders.pop();
    }
}