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
    Client: "Client",
    Designer: "Designer",
    User: "User",
    SuperAdmin: "Super Admin",
    SalesPerson: "SalesPerson",
})

const FileDirectoryType = Object.freeze({
    99: '/default',
    100: '/csvfiles',
    1: '/design',
    2: '/watermark',
    3: '/pdf_img',
    4: "/server_pdf",
    5: "/design_pdf",
    6: "/tif_img",
    7: "/server_tiff",
    8: "/drivepdf"
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