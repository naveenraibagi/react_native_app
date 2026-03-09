/**
 * Strips HTML tags from a string.
 * Helpful for cleaning up WordPress error messages that contain <strong> or <a> tags.
 * 
 * @param html - The string containing HTML tags.
 * @returns A plain text string.
 */
export const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Extracts a user-friendly error message from an error object,
 * stripping any HTML tags if present.
 * 
 * @param error - The error object (from axios or elsewhere).
 * @param defaultMsg - Fallback message if no message is found.
 * @returns A clean error string.
 */
export const getErrorMessage = (error: any, defaultMsg: string = 'Something went wrong'): string => {
    let message = defaultMsg;

    if (error?.response?.data?.message) {
        message = error.response.data.message;
    } else if (error?.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    return stripHtml(message);
};
