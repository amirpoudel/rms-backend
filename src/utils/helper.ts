export function convertSlug(slug:string):string {
    return slug.replace(/-/g, ' ');
}

export function convertToSlug(text:string):string {
    return text
        .toLowerCase()
        .replace(/ /g, "-")
}


export function convertToPlainObject<T>(data:T):T{
    return JSON.parse(JSON.stringify(data));
}