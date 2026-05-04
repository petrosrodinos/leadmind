export const bufferToBase64 = (buffer: Buffer, contentType: string): string => {
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
};

