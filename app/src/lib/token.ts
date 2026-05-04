export const isTokenExpired = (time: number) => {
    const now = Date.now();
    const expiration = time * 1000;
    return now > expiration;
};