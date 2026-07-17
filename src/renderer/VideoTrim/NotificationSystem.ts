export class ActiveNotification {
    containerEl: HTMLDivElement;
    textContentEl: HTMLDivElement;
    titleEl: HTMLDivElement;
    iconEl: HTMLDivElement;
    descriptionEl: HTMLDivElement;
    constructor() {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("notif-container");

        this.iconEl = document.createElement("div");
        this.containerEl.appendChild(this.iconEl);
        this.iconEl.classList.add("ntf-title");

        this.textContentEl = document.createElement("div");
        this.containerEl.appendChild(this.textContentEl);
        this.textContentEl.classList.add("ntf-text-content");

        this.titleEl = document.createElement("div");
        this.containerEl.appendChild(this.titleEl);
        this.titleEl.classList.add("ntf-title");

        this.descriptionEl = document.createElement("div");
        this.containerEl.appendChild(this.descriptionEl);
        this.descriptionEl.classList.add("ntf-description");
    }
}