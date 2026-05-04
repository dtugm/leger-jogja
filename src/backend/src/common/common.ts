import { Logger } from "@nestjs/common";

const logger = new Logger('CommonFunction');

export const getPrefix = (fileUrl: string, isFolder: boolean = true): string => {
    if (!fileUrl) return '';

    try {
        const url = new URL(fileUrl);
        const paths = url.pathname.split('/').filter(Boolean);
        
        if (isFolder) paths.pop();

        return paths.join('/');
    } catch (error) {
        logger.error(error);
        return '';
    }
}