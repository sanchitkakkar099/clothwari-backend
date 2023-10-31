const multer = require('multer')
const path = require('path')
const { FileDirectoryType } = require('../utils').constant

const storageData = multer.diskStorage({
    destination: function (req, file, cb) {
        if (
            req.query.type &&
            FileDirectoryType[req.query.type]
        ) {
            cb(null, './uploads' + FileDirectoryType[req.query.type])
        } else {
            cb('Invalid file type', null)
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})

const uploadad = multer({ storage: storageData })

module.exports = uploadad
