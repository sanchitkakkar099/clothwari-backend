const cors = require("cors");
const fs = require("fs");
const morganBody = require("morgan-body");
const helmet = require('helmet');

//import helper utils
const { FileDirectoryType } = require("../utils").constant


module.exports = (express, app) => {
    app.use(express.json())
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.options('*', cors())
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    // Use the helmet middleware
    app.use(helmet({
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));

    const fileAttachment = (req, res, next) => {
        next()
    }
    app.use('/uploads', fileAttachment, express.static('uploads'))

    // morganBody(app);

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

    //called the cron service
    require("../services").cronService()


    // intializeUploadFolders
    fs.existsSync('./uploads') || fs.mkdirSync('./uploads')
    Object.values(FileDirectoryType).forEach((file) => {
        fs.existsSync('./uploads' + file) || fs.mkdirSync('./uploads' + file, { recursive: true })
    })
}