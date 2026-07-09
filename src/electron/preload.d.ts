export {};

declare global {
    interface Window {
        windowApi: {
            close: () => void;
            minimize: () => void;
            maximize: () => void;
            move: (dx: number, dy: number) => void;
        };
        fileApi: {
            getDirectoryFileList: (dirPath: string) => Promise<{
                files: {
                    path: string,
                    name: string,
                    modified: number
                }[],
                success: boolean
            }>;
            promptChooseDirectory: () => Promise<string | null>;
        };
    }
}
