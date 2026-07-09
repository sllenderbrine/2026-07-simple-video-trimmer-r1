import { ConnectionOwner, HtmlConnection, Signal, StringUtility } from "../VecLib/index.js";

export type ContextMenuLayout = {
    name: string,
    keybind?: string,
    children?: ContextMenuLayout[],
    separator?: boolean,
    disabled?: boolean,
    icon?: string,
    data?: any,
    tooltip?: string,
};

export class ContextMenuButton {
    buttonEl: HTMLButtonElement;
    titleEl?: HTMLDivElement;
    keybindEl?: HTMLDivElement;
    separatorEl?: HTMLDivElement;
    prefixIconEl?: HTMLDivElement;
    suffixIconEl?: HTMLDivElement;
    buttonWidth: number = 0;
    childrenLayout?: ContextMenuLayout[];
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    data?: any;
    isDisabled: boolean = false;
    constructor(public menu: ContextMenu, layout: ContextMenuLayout) {
        this.buttonEl = document.createElement("button");
        menu.containerEl.appendChild(this.buttonEl);
        this.buttonEl.classList.add("ctxm-button");

        this.setDisabled(layout.disabled ?? false);
        this.setTooltip(layout.tooltip);
        this.setTitle(layout.name);
        this.setKeybind(layout.keybind);
        this.setSeparator(layout.separator ?? false);
        this.setIcon(layout.icon);
        this.setChildrenLayout(layout.children);
        this.updateButtonWidth();

        this.data = layout.data;
    }
    setTitle(title?: string) {
        if(title === undefined && this.titleEl !== undefined) {
            this.titleEl.remove();
            delete this.titleEl;
        } else if(title !== undefined && this.titleEl === undefined) {
            this.titleEl = document.createElement("div");
            this.menu.containerEl.appendChild(this.titleEl);
            this.titleEl.classList.add("ctxm-title");
            let nameClip = StringUtility.clipEllipses(title, 32);
            this.titleEl.textContent = nameClip;
            this.titleEl.style.opacity = this.isDisabled ? "0.5" : "1";
        } else if(title !== undefined && this.titleEl !== undefined) {
            let nameClip = StringUtility.clipEllipses(title, 32);
            this.titleEl.textContent = nameClip;
        }

    }
    setTooltip(tooltip?: string) {
        this.buttonEl.title = tooltip ?? "";
    }
    setKeybind(keybind?: string) {
        if(keybind === undefined && this.keybindEl !== undefined) {
            this.keybindEl.remove();
            delete this.keybindEl;
        } else if(keybind !== undefined && this.keybindEl === undefined) {
            this.keybindEl = document.createElement("div");
            this.menu.containerEl.appendChild(this.keybindEl);
            let keybindClip = StringUtility.clipStartEllipses(keybind, 32);
            this.keybindEl.textContent = keybindClip;
            this.keybindEl.classList.add("ctxm-keybind");
        } else if(keybind !== undefined && this.keybindEl !== undefined) {
            let keybindClip = StringUtility.clipStartEllipses(keybind, 32);
            this.keybindEl.textContent = keybindClip;
        }
    }
    setIcon(icon?: string) {
        if(this.prefixIconEl) {
            this.prefixIconEl.remove();
            delete this.prefixIconEl;
        }
        if(icon === undefined)
            return;
        this.prefixIconEl = document.createElement("div");
        this.menu.containerEl.appendChild(this.prefixIconEl);
        this.prefixIconEl.classList.add("ctxm-prefix-icon");
        this.prefixIconEl.style.opacity = this.isDisabled ? "0.5" : "1";
        fetch(`resources/icons/${icon}.svg`).then(res => res.text()).then(inner => {
            this.prefixIconEl!.innerHTML = inner;
            this.prefixIconEl!.querySelectorAll("svg").forEach(svg => {
                svg.setAttribute("width", "16px");
                svg.setAttribute("height", "16px");
                svg.style.position = "absolute";
                svg.style.left = "50%";
                svg.style.top = "50%";
                svg.style.transform = "translate(-50%, -50%)";
            });
        });
    }
    setChildrenLayout(childrenLayout?: ContextMenuLayout[]) {
        if(this.suffixIconEl) {
            this.suffixIconEl.remove();
            delete this.suffixIconEl;
        }
        delete this.childrenLayout;
        if(childrenLayout === undefined)
            return;
        this.childrenLayout = childrenLayout;
        this.suffixIconEl = document.createElement("div");
        this.menu.containerEl.appendChild(this.suffixIconEl);
        this.suffixIconEl.classList.add("ctxm-suffix-icon");
        this.suffixIconEl.style.rotate = "90deg";
        this.suffixIconEl.style.opacity = this.isDisabled ? "0.5" : "1";
        fetch("resources/icons/triangle.svg").then(res => res.text()).then(inner => {
            this.suffixIconEl!.innerHTML = inner;
            this.suffixIconEl!.querySelectorAll("svg").forEach(svg => {
                svg.setAttribute("width", "10px");
                svg.setAttribute("height", "10px");
                svg.style.position = "absolute";
                svg.style.left = "50%";
                svg.style.top = "50%";
                svg.style.transform = "translate(-50%, -50%)";
            });
        });
    }
    setSeparator(v: boolean) {
        if(v && this.separatorEl === undefined) {
            this.separatorEl = document.createElement("div");
            this.menu.containerEl.appendChild(this.separatorEl);
            this.separatorEl.classList.add("ctxm-separator");
            this.separatorEl.style.left = "0px";
        } else if(!v && this.separatorEl !== undefined) {
            this.separatorEl.remove();
            delete this.separatorEl;
        }
    }
    setDisabled(v: boolean) {
        this.isDisabled = v;
        
        this.buttonEl.style.display = this.isDisabled ? "none" : "block";
        if(this.titleEl !== undefined) {
            this.titleEl.style.opacity = this.isDisabled ? "0.5" : "1";
        }
        if(this.suffixIconEl !== undefined) {
            this.suffixIconEl.style.opacity = this.isDisabled ? "0.5" : "1";
        }
        if(this.prefixIconEl !== undefined) {
            this.prefixIconEl.style.opacity = this.isDisabled ? "0.5" : "1";
        }
    }
    updateButtonWidth() {
        this.buttonWidth = 16 * 3;
        if(this.childrenLayout !== undefined) {
            this.buttonWidth += 26;
        }
        if(this.titleEl !== undefined) {
            this.titleEl.style.width = "fit-content";
            this.buttonWidth += this.titleEl.getBoundingClientRect().width;
        }
        if(this.keybindEl !== undefined) {
            this.keybindEl.style.width = "fit-content";
            this.buttonWidth += this.keybindEl.getBoundingClientRect().width;
        }
    }
}

export default class ContextMenu {
    containerEl: HTMLDivElement;
    connectionOwner: ConnectionOwner = new ConnectionOwner();
    buttons: ContextMenuButton[] = [];
    buttonByEl: Map<EventTarget, ContextMenuButton> = new Map();
    buttonClickEvent: Signal<[e: MouseEvent, btn: ContextMenuButton, index: number]> = new Signal();
    clickOffEvent: Signal<[e: MouseEvent]> = new Signal();
    childMenu?: ContextMenu;
    constructor(x: number, y: number, public parent?: ContextMenu) {
        this.containerEl = document.createElement("div");
        document.body.appendChild(this.containerEl);
        this.containerEl.classList.add("ctxm-container");
        this.containerEl.style.left = x + "px";
        this.containerEl.style.top = y + "px";
        let childMenuBtn: ContextMenuButton | null = null;
        new HtmlConnection(window, "mousemove", (e: MouseEvent) => {
            if(e.target != null) {
                const btn = this.buttonByEl.get(e.target);
                if(btn != null) {
                    if(childMenuBtn == btn)
                        return;
                    if(this.childMenu != null) {
                        this.childMenu.remove();
                        childMenuBtn = null;
                    }
                    if(btn.childrenLayout) {
                        const rect = btn.buttonEl.getBoundingClientRect();
                        this.childMenu = ContextMenu.fromLayout(btn.childrenLayout, rect.left + rect.width, rect.top, this);
                        this.childMenu.containerEl.style.borderTopLeftRadius = "0px";
                        const rect2 = this.containerEl.getBoundingClientRect();
                        const rect3 = this.childMenu.containerEl.getBoundingClientRect();
                        if(rect3.top + rect3.height < rect2.top + rect2.height - 8) {
                        this.childMenu.containerEl.style.borderBottomLeftRadius = "0px";
                        }
                        childMenuBtn = btn;
                        this.childMenu.buttonClickEvent.connect((e, btn, index) => {
                            this.buttonClickEvent.fire(e, btn, index);
                        }, { owners: [ this.connectionOwner ] } );
                    }
                    return;
                }
            }
        }, { owners: [ this.connectionOwner ] });
        new HtmlConnection(window, "mousedown", (e: MouseEvent) => {
            if(e.target != null) {
                const btn = this.buttonByEl.get(e.target);
                if(btn != null) {
                    const index = this.buttons.indexOf(btn);
                    this.buttonClickEvent.fire(e, btn, index);
                    return;
                }
            }
            if(this.isMouseTarget(e))
                return;
            this.clickOffEvent.fire(e);
        }, { owners: [ this.connectionOwner ] });
    }
    static fromLayout(layout: ContextMenuLayout[], x: number, y: number, parent?: ContextMenu) {
        const menu = new ContextMenu(x, y, parent);
        for(const itemLayout of layout) {
            const item = new ContextMenuButton(menu, itemLayout);
            menu.buttons.push(item);
            menu.buttonByEl.set(item.buttonEl, item);
        }
        menu.updateStyle();
        return menu;
    }
    updateStyle() {
        let containerWidth = 0;
        let hasPrefixIcon = false;
        for(let i = 0; i < this.buttons.length; i++) {
            const item = this.buttons[i]!;
            containerWidth = Math.max(containerWidth, item.buttonWidth);
            if(item.prefixIconEl) {
                hasPrefixIcon = true;
            }
        }
        let containerHeight = 8;
        containerWidth = containerWidth + (hasPrefixIcon ? 26 : 0);
        for(let i = 0; i < this.buttons.length; i++) {
            const item = this.buttons[i]!;
            item.buttonEl.style.width = containerWidth + "px";
            item.buttonEl.style.top = containerHeight + "px";
            if(item.titleEl !== undefined) {
                item.titleEl.style.left = ((hasPrefixIcon ? 26 : 0) + 16) + "px";
                item.titleEl.style.width = containerWidth + "px";
                item.titleEl.style.top = containerHeight + "px";
            }
            if(item.keybindEl !== undefined) {
                item.keybindEl.style.right = ((item.suffixIconEl ? 26 : 0) + 16) + "px";
                item.keybindEl.style.width = containerWidth + "px";
                item.keybindEl.style.top = containerHeight + "px";
            }
            if(item.prefixIconEl !== undefined) {
                item.prefixIconEl.style.left = "8px";
                item.prefixIconEl.style.top = containerHeight + "px";
            }
            if(item.suffixIconEl !== undefined) {
                item.suffixIconEl.style.right = "0px";
                item.suffixIconEl.style.top = containerHeight + "px";
            }
            containerHeight += 26;
            if(item.separatorEl !== undefined) {
                item.separatorEl.style.top = (containerHeight + 8) + "px";
                item.separatorEl.style.width = containerWidth + "px";
                containerHeight += 16;
            }
        }
        containerHeight += 8;
        this.containerEl.style.width = containerWidth + "px";
        this.containerEl.style.height = containerHeight + "px";
    }
    isMouseTarget(e: MouseEvent): boolean {
        if(e.target == null)
            return false;
        if(e.target === this.containerEl)
            return true;
        const btn = this.buttonByEl.get(e.target);
        if(btn != null)
            return true;
        if(this.childMenu != null)
            return this.childMenu.isMouseTarget(e);
        return false;
    }
    remove() {
        this.connectionOwner.disconnectAll();
        this.containerEl.remove();
        if(this.childMenu != null)
            this.childMenu.remove();
    }
}