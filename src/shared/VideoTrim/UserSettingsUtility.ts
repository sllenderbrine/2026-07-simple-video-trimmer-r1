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