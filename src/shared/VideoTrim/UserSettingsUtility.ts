export interface Settings {
    recentFolders: string[];
}

export function createSettings(input?: any): Settings {
    if(typeof input !== "object" || input == null || Array.isArray(input))
        input = {};

    const result: Settings = {
        recentFolders: [],
    };
    
    if(Array.isArray(input.recentFolders)) {
        input.recentFolders.forEach((v: any) => {
            if(typeof v === "string")
                result.recentFolders!.push(v);
        });
    }

    return result;
}

export function addRecentFolder(settings: Settings, dir: string) {
    let duplicateIndex = settings.recentFolders.indexOf(dir);
    if(duplicateIndex != -1) {
        settings.recentFolders.splice(duplicateIndex, 1);
        settings.recentFolders.unshift(dir);
        return;
    }
    settings.recentFolders.unshift(dir);
    while(settings.recentFolders.length > 6)
        settings.recentFolders.pop();
}