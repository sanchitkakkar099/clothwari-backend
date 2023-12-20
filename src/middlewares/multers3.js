const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const multer = require("multer")
const path = require("path")
const { FileDirectoryType, AllowedFileType } = require('../utils/constant')

const AWS_ACCESSKEY = 'AKIAUIYCDOLIPKTDDUAK'
const AWS_SECRETKEY = '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'
const AWS_BUCKET = 'clothwaris3'

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESSKEY,
    secretAccessKey: process.env.AWS_SECRETKEY,
})

const bucketPolicy = {
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: `arn:aws:s3:::${process.env.AWS_BUCKET}/*`
        }
    ]
};

const params = {
    Bucket: process.env.AWS_BUCKET,
    Policy: JSON.stringify(bucketPolicy),
};

s3.putBucketPolicy(params, (err, data) => {
    if (err) {
        console.error('Error setting bucket policy:', err);
    } else {
        console.log('Bucket policy updated:', data);
    }
});

const s3Storge = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    //acl: 'public-read',
    contentType: (req, file, cb) => {
        cb(null, file.mimetype);
    },
    metadata: (req, file, cb) => {
        cb(null, { type: req.query.type })
    },
    key: (req, file, cb) => {
        cb(null, FileDirectoryType[req.query.type].replace("/", "") + "/" + file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    },
})


const uploads3 = multer({ storage: s3Storge });
module.exports = uploads3