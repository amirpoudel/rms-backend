export function convertSlug(slug: string): string {
    return slug.replace(/-/g, ' ');
}

export function convertToSlug(text: string): string {
    return text.toLowerCase().replace(/ /g, '-');
}

export function convertToPlainObject<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

export function isPasswordValid(password: string): boolean {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
}

export function isEmailValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
