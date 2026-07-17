import { Color } from "../Color/Color.js";
import { Signal } from "../EventSignals/Signal.js";
import { joinPaths } from "../Utility/FilePathUtility.js";

const PATH_RESOURCES = "..";
const PATH_ICONS = joinPaths(PATH_RESOURCES, "icons");

export class ActiveNotification {
    containerEl: HTMLDivElement;
    textContentEl: HTMLDivElement;
    titleEl: HTMLDivElement;
    iconEl: HTMLDivElement;
    descriptionEl: HTMLDivElement;
    icon: string = "";
    iconType: NotificationIconType = NotificationIconType.NONE;
    timeout: number = -1;
    timeoutStart: number = -1;
    removed: boolean = false;
    removeEvent: Signal<[]> = new Signal();
    constructor() {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("ntf-container");

        this.iconEl = document.createElement("div");
        this.containerEl.appendChild(this.iconEl);
        this.iconEl.classList.add("ntf-icon-container");

        this.textContentEl = document.createElement("div");
        this.containerEl.appendChild(this.textContentEl);
        this.textContentEl.classList.add("ntf-text-content");

        this.titleEl = document.createElement("div");
        this.containerEl.appendChild(this.titleEl);
        this.titleEl.classList.add("ntf-title");

        this.descriptionEl = document.createElement("div");
        this.containerEl.appendChild(this.descriptionEl);
        this.descriptionEl.classList.add("ntf-description");

        this.containerEl.animate([
            { transform: "translateX(-50px)", opacity: "0", },
            { transform: "translateX(0px)", opacity: "1", },
        ], { duration: 500, easing: "ease-in-out" });
    }

    setTitle(v: string) {
        this.titleEl.textContent = v;
    }

    setDescription(v: string) {
        this.descriptionEl.textContent = v;
    }

    createIconContainer() {
        this.iconEl.innerHTML = "";
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("ntf-icon");
        return iconContainer;
    }

    createCustomIconContainer(v: string, color: Color) {
        const iconContainer = this.createIconContainer();
        iconContainer.style.color = color.toCss();
        fetch(joinPaths(PATH_ICONS, v + ".svg")).then(res => res.text()).then(text => {
            iconContainer.innerHTML = text;
        });
    }

    setIconType(v: NotificationIconType, color: Color) {
        this.iconType = v;
        switch(v) {
            case NotificationIconType.CUSTOM:
                this.createCustomIconContainer(this.icon, color);
                break;
            case NotificationIconType.CHECK:
                break;
            case NotificationIconType.ERROR:
                this.createCustomIconContainer("small-cross", Color.RED);
                break;
            case NotificationIconType.INFO:
                break;
            case NotificationIconType.LOADING:
                break;
            case NotificationIconType.NONE:
                this.iconEl.innerHTML = "";
                break;
        }
    }

    setIcon(v: string) {
        this.icon = v;
        if(this.iconType == NotificationIconType.CUSTOM) {
            const iconContainer = this.createIconContainer();
            fetch(joinPaths(PATH_ICONS, this.icon + ".svg")).then(res => res.text()).then(text => {
                iconContainer.innerHTML = text;
            });
        }
    }

    setTimeout(v: number) {
        this.timeout = v;
        let start = performance.now();
        this.timeoutStart = start;
        let iid = setInterval(() => {
            if(start != this.timeoutStart){
                clearInterval(iid);
                return
            }
            if((performance.now() - start) / 1000 > this.timeout) {
                this.remove();
                clearInterval(iid);
                return
            }
        });
    }

    remove() {
        if(this.removed)
            return;
        this.removed = true;
        this.removeEvent.fire();
        this.containerEl.animate([
            { transform: "translateX(0px)", opacity: "1", },
            { transform: "translateX(-50px)", opacity: "0", },
        ], { duration: 500, easing: "ease-in-out" });
        setTimeout(() => {
            this.containerEl.remove();
        }, 500);
    }
}

export enum NotificationIconType {
    CUSTOM = 0,
    ERROR = 1,
    LOADING = 2,
    CHECK = 3,
    INFO = 4,
    NONE = 5,
}

export type ActiveNotificationOptions = {
    title: string,
    iconType: NotificationIconType,
    icon: string,
    description: string,
    timeout: number,
};

export class NotificationSystem {
    activeContainerEl: HTMLDivElement;
    activeNotifications: ActiveNotification[] = [];
    constructor() {
        this.activeContainerEl = document.createElement("div");
        this.activeContainerEl.classList.add("ntf-active-container");
    }
    sendActiveNotification({
        title = "",
        iconType = NotificationIconType.INFO,
        iconColor = Color.BLACK,
        icon = "",
        description = "",
        timeout = -1,
    }) {
        const notif = new ActiveNotification();
        this.activeNotifications.push(notif);
        notif.setTitle(title);
        notif.setIconType(iconType, iconColor);
        notif.setIcon(icon);
        notif.setDescription(description);
        notif.setTimeout(timeout);
        this.activeContainerEl.appendChild(notif.containerEl);
        return notif;
    }
}