const cors = require("cors");
const fs = require("fs");


//import helper utils
const { FileDirectoryType } = require("../utils").constant


module.exports = (express, app) => {
    app.use(express.json())
    app.use(cors({ origin: "*" }))
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    const fileAttachment = (req, res, next) => {
        next()
    }
    app.use('/uploads', fileAttachment, express.static('uploads'))


    app.get('/', (req, res) => {
        const ip =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null)
        const toSave = {
            ipAddress: ip,
            time: Date.now()
        }
        res.send(toSave)
    })

    app.use("/api", require("../routes"))


    // intializeUploadFolders
    fs.existsSync('./uploads') || fs.mkdirSync('./uploads')
    Object.values(FileDirectoryType).forEach((file) => {
        fs.existsSync('./uploads' + file) || fs.mkdirSync('./uploads' + file, { recursive: true })
    })
}