
const USER_ROLE = {
    OWNER:"owner" as const,
    ADMIN:"admin" as const,

}

const COOKIE_OPTIONS = {
    path: '/',
    httpOnly: true,
    secure: true, // Change this to false for local development
    sameSite:'none', // Change to 'None' in production with HTTPS
};

export {
    USER_ROLE,
    COOKIE_OPTIONS
}