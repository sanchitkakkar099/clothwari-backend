const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const aws = require('aws-sdk');
const fs = require("fs");

exports.successRes = (msg, data, code = 200) => {
    return {
        flag: true,
        message: msg,
        data: data,
        code: code
    }
}

exports.errorRes = (msg, error, code = 400) => {
    return {
        flag: false,
        message: msg,
        error: error,
        code: code
    }
}


exports.jwtSign = async (payload) => {
    console.log(process.env.jwt_secret, process.env.JWT_EXPIRY)
    return await jwt.sign(payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY })
}

exports.jwtVerify = async (token) => {
    return await jwt.verify(token, process.env.JWT_SECRET)
}


exports.bcryptHash = (password) => {
    return bcrypt.hashSync(password, 10)
}

exports.bcryptCompare = (password, hash) => {
    return bcrypt.compareSync(password, hash)
}




exports.uploadfileToS3 = async (filepath, filename, mimetype, key = 28) => {
    try {
        const s3 = new aws.S3({
            accessKeyId: process.env.AWS_ACCESSKEY,
            secretAccessKey: process.env.AWS_SECRETKEY,
        })
        let stored = await s3.upload({
            ContentDisposition: 'inline',
            ContentType: mimetype,
            Bucket: process.env.AWS_BUCKET,
            Body: fs.readFileSync(filepath),
            Key: key + '/' + filename
        }).promise()
        return stored.Location
    } catch (error) {
        console.log(error);
        return false
    }
}