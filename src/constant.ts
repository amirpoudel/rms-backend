
const USER_ROLE = {
    OWNER:"owner" as const,
    ADMIN:"admin" as const,

}


const RESTAURANT_TYPE = {

}


const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
}

export {
    USER_ROLE,
    COOKIE_OPTIONS
}