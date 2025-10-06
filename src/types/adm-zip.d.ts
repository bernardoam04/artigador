declare module 'adm-zip' {
    class AdmZip {
        constructor(filePath?: string | Buffer);
        getEntries(): Array<{
            entryName: string;
            isDirectory: boolean;
            getData(): Buffer;
        }>;
        extractAllTo(targetPath: string, overwrite?: boolean): void;
        addFile(entryName: string, data: Buffer): void;
    }
    export = AdmZip;
}
