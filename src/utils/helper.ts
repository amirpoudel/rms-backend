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

export function isPhoneValid(phone: string): boolean {
    const nepaliMobileNumberRegex = /^(?:\+?977)?(?:98|97|96|95|94|92)\d{7}$/;
    return nepaliMobileNumberRegex.test(phone);
}

export function isValidString(input: string): boolean {
    // Regular expression to match only plain strings (no numbers, special characters, or hyphens)
    const regex = /^[a-zA-Z\s]+$/; // This regex matches only alphabetic characters and whitespace

    // Test the input against the regex
    return regex.test(input);
}


export function getLimitAndOffset(query:any,maxLimit:number=20):{limit:number,offset:number} {
    
    let page, limit, offset;
    if(!query.limit){
        return {limit:maxLimit,offset:0};
    }
    limit = Number(query.limit);
    if(!query.page){
        return {limit:limit,offset:0};
    }
    page = Number(query.page);
    page = Number(page || 1);
    limit = Number(limit < maxLimit ? limit :maxLimit)
    offset = Number((page - 1)) * Number(limit);
    return {limit,offset};
  }








