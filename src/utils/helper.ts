export function convertSlug(slug:string):string {
    return slug.replace(/-/g, ' ');
}