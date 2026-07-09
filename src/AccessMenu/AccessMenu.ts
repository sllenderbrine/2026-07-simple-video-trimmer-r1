import ContextMenu from "../ContextMenu/ContextMenu.js";
import { ContextMenuLayout } from "../ContextMenu/ContextMenu.js";
import { ContextMenuButton } from "../ContextMenu/ContextMenu.js";
import { Signal } from "../VecLib/index.js";

export type AccessMenuLayout = {
    name: string,
    getLayout: () => ContextMenuLayout[]
};

export type AccessMenuClickEvent = {
    mouse: MouseEvent,
    ctx: ContextMenu,
    ctxButton: ContextMenuButton,
    button: AccessMenuButton,
    index: number,
};

export class AccessMenuButton {
    buttonEl: HTMLButtonElement;
    titleEl: HTMLDivElement;
    buttonWidth: number = 0;
    constructor(public menu: AccessMenu, layout: AccessMenuLayout) {
        this.buttonEl = document.createElement("button");
        this.buttonEl.classList.add("access-menu-button");
        menu.containerEl.appendChild(this.buttonEl);
        this.titleEl = document.createElement("div");
        this.titleEl.classList.add("access-menu-title");
        menu.containerEl.appendChild(this.titleEl);
        this.titleEl.textContent = layout.name;
        this.titleEl.style.width = "fit-content";
        this.buttonWidth = this.titleEl.getBoundingClientRect().width + 24;
        this.buttonEl.style.width = this.buttonWidth + "px";
        this.titleEl.style.width = this.buttonWidth + "px";
    }
}

export default class AccessMenu {
    containerEl: HTMLDivElement;
    buttons: AccessMenuButton[] = [];
    buttonByEl: Map<EventTarget, AccessMenuButton> = new Map();
    contextMenu?: ContextMenu;
    activeButton?: AccessMenuButton;
    menuButtonClickEvent: Signal<[e: AccessMenuClickEvent]> = new Signal();
    constructor(layout: { name: string, getLayout: () => ContextMenuLayout[] }[]) {
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("access-menu-container");
        document.body.appendChild(this.containerEl);
        let leftAccessWidth = 0;
        for(const itemLayout of layout) {
            const item = new AccessMenuButton(this, itemLayout);
            item.buttonEl.style.left = leftAccessWidth + "px";
            item.titleEl.style.left = leftAccessWidth + "px";
            leftAccessWidth += item.buttonWidth;
            item.buttonEl.addEventListener("click", e => {
                if(this.contextMenu != null) {
                    this.contextMenu.remove();
                    delete this.contextMenu;
                    if(this.activeButton === item) {
                        delete this.activeButton;
                        return;
                    } else {
                        delete this.activeButton;
                    }
                }
                const rect = item.buttonEl.getBoundingClientRect();
                const menu = ContextMenu.fromLayout(itemLayout.getLayout(), rect.left, rect.top + rect.height + 1);
                this.contextMenu = menu;
                this.activeButton = item;
                menu.buttonClickEvent.connect((e, btn, index) => {
                    const e2: AccessMenuClickEvent = {
                        mouse: e,
                        ctx: menu,
                        ctxButton: btn,
                        button: item,
                        index: index,
                    }
                    this.menuButtonClickEvent.fire(e2);
                }, { owners: null });
                menu.clickOffEvent.connect(e => {
                    if(e.target != null) {
                        const btn = this.buttonByEl.get(e.target);
                        if(btn != null) {
                            return;
                        }
                    }
                    menu.remove();
                    if(this.contextMenu == menu) {
                        delete this.contextMenu;
                        delete this.activeButton;
                    }
                }, { owners: null });
            });
            this.buttons.push(item);
            this.buttonByEl.set(item.buttonEl, item);
        }
        let rightAccessWidth = 0;
        let createRightAccessButton = (iconStr: string, size: number, onClick: (e: MouseEvent) => void, danger = false) => {
            const btn = document.createElement("button");
            btn.classList.add("access-menu-button");
            if(danger)
                btn.classList.add("access-menu-button-danger");
            this.containerEl.appendChild(btn);
            const icon = document.createElement("div");
            icon.classList.add("access-menu-icon");
            btn.appendChild(icon);
            fetch(`resources/icons/${iconStr}.svg`).then(res => res.text()).then(inner => {
                icon.innerHTML = inner;
                icon.querySelectorAll("svg").forEach(svg => {
                    svg.setAttribute("width", size + "px");
                    svg.setAttribute("height", size + "px");
                    svg.style.position = "absolute";
                    svg.style.left = "50%";
                    svg.style.top = "50%";
                    svg.style.transform = "translate(-50%, -50%)";
                });
            });
            btn.style.width = 50 + "px";
            btn.style.right = rightAccessWidth + "px";
            rightAccessWidth += 50;
            btn.addEventListener("click", e => {
                onClick(e);
            });
        }
        createRightAccessButton("small-cross", 26, e => {
            window.windowApi.close();
        }, true);
        createRightAccessButton("maximize", 14, e => {
            window.windowApi.maximize();
        });
        createRightAccessButton("dash", 14, e => {
            window.windowApi.minimize();
        });
    }
}