
const USER_ROLE = {
    OWNER: "owner" as const,
    ADMIN: "admin" as const,
};

const COOKIE_OPTIONS = {
    domain: 'localhost', // Change this to your domain
    path: '/',
    httpOnly: true,
    secure: true, // Change this to false for local development
    sameSite: 'none',
};

export {
    USER_ROLE,
    COOKIE_OPTIONS
}