/**
 * Import History Service
 * 
 * Manages the history of imported files to prevent duplicates.
 * Uses SHA-256 hash of file content to identify unique files.
 */

const STORAGE_KEY = 'reynar_import_history';

interface ImportedFileRecord {
    hash: string;
    fileName: string;
    date: string; // ISO string
    size: number;
}

/**
 * Calculates SHA-256 hash of a file
 */
export const calculateFileHash = async (file: File): Promise<string> => {
    // Try using modern Crypto API
    if (window.crypto && window.crypto.subtle) {
        try {
            const buffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (e) {
            console.warn('Crypto API failed, falling back to basic hash', e);
        }
    }

    // Fallback: Name + Size + LastModified (Basic signature)
    return `${file.name}_${file.size}_${file.lastModified}`;
};

/**
 * Checks if a file with the given hash has already been imported
 */
export const hasFileBeenImported = (hash: string): boolean => {
    const history = getImportHistory();
    return history.some(record => record.hash === hash);
};

/**
 * Marks a file as imported by saving its hash to history
 */
export const markFileAsImported = (file: File, hash: string): void => {
    const history = getImportHistory();

    // Avoid duplicates in history just in case
    if (history.some(h => h.hash === hash)) return;

    const newRecord: ImportedFileRecord = {
        hash,
        fileName: file.name,
        date: new Date().toISOString(),
        size: file.size
    };

    const updatedHistory = [newRecord, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

/**
 * Retrieves the import history from localStorage
 */
export const getImportHistory = (): ImportedFileRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse import history', e);
        return [];
    }
};

/**
 * Clears the import history (useful for testing or full reset)
 */
export const clearImportHistory = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
