const { contextBridge, ipcRenderer } = (require("electron") as typeof Electron);

contextBridge.exposeInMainWorld("windowApi", {
    close: () => ipcRenderer.send("window-close"),
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    move: (x: number, y: number) => ipcRenderer.send("window-move", x, y),
});

contextBridge.exposeInMainWorld("fileApi", {
    getDirectoryFileList: (dirPath: string) => ipcRenderer.invoke("get-directory-file-list", dirPath),
    promptChooseDirectory: () => ipcRenderer.invoke("prompt-choose-directory")
});
