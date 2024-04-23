const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const aws = require('aws-sdk');
const fs = require("fs");
const { dbMethods, dbModels } = require('./index');

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
    if (payload.email === "hpt123@gmail.com") {
        console.log("Token experies in 1m for hpt123@gmail.com")
        return await jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "1m" })

    } else {
        console.log(process.env.jwt_secret, process.env.JWT_EXPIRY)
        return await jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY })
    }
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

exports.generateRandomCN = () => {
    var cn = "CN";
    for (var i = 0; i < 6; i++) {
        cn += Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
    }
    return cn;
}

exports.generateUniqueCustomerCode = async () => {
    try {
        let customerCode = this.generateRandomCN();
        let checkAlreadyAvail = await dbMethods.findOne({
            collection: dbModels.User,
            query: { customerCode: customerCode }
        });
        if (checkAlreadyAvail) {
            // If the customer code already exists, generate a new one recursively
            return generateUniqueCustomerCode();
        } else {
            // If the customer code is unique, return it
            return customerCode;
        }
    } catch (error) {
        console.log(error);
        return false
    }
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
exports.htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Page Title</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        .pdf-title {
            text-align: center;
        }

        .pdf-images-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            justify-items: center;
            padding-top: 10px;
        }
        .pdf-title+.pdf-images-container {
            border-top: 25px solid rgb(206, 86, 42);
            padding-top: 10px;
        }

        .pdf-image-wrapper {
            position: relative;
            border: 1.5px black solid;
            margin:5px;
        }

        .pdf-image-wrapper img {
            width: 300px;
            height: auto;
        }

        .pdf-image-caption {
            position: absolute;
            bottom: 5px;
            right: 5px;
            font-size: 12px;
            background-color: white;
            padding: 2px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="my-pdf">
        <div class="pdf-title">
            <h1>Textile Design</h1>
        </div>
        <div class="pdf-images-container">
        {{content}}
       </div>
    </div>
</body>
</html>
`;