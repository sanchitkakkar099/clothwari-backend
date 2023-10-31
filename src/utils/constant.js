const HttpStatus = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,

    INTERNAL_SERVER_ERROR: 500,

})

const UserRoleConstant = Object.freeze({
    Admin: "Admin",
    Designer: "Designer",
    User: "User",
    SuperAdmin: "Super Admin"
})

const FileDirectoryType = Object.freeze({
    99: '/default',
    100: '/csvfiles',
    1: '/design'
})

const DefaultConstantType = Object.freeze({
    MasterPassword: "Clothwari@12345",
})

module.exports = {
    HttpStatus,
    UserRoleConstant,
    FileDirectoryType,
    DefaultConstantType,
}