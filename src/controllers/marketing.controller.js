//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");
const aws = require('aws-sdk')

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESSKEY,
    secretAccessKey: process.env.AWS_SECRETKEY,
})
//puppeter
const { launch } = require('puppeteer');
const path = require("path");
const fs = require("fs");
const puppeteer = require('puppeteer');


exports.marketingAdding = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadAdded = await dbMethods.findOne({
                collection: dbModels.Marketing,
                query: { title: req.body.title }
            })
            if (checkAlreadAdded) {
                return res.send(helperUtils.errorRes("Already Exists", {}, HttpStatus.BAD_REQUEST));
            }
            await dbMethods.insertOne({
                collection: dbModels.Marketing,
                document: req.body
            })
            return res.send(helperUtils.successRes("Successfully uploaded to marketing"))
        } else {
            let { _id, ...data } = req.body
            let checkAlreadAdded = await dbMethods.findOne({
                collection: dbModels.Marketing,
                query: { title: req.body.title, _id: _id }
            })
            if (checkAlreadAdded) {
                return res.send(helperUtils.errorRes("Already Exists", {}, HttpStatus.BAD_REQUEST));
            }
            await dbMethods.updateOne({
                collection: dbModels.Marketing,
                query: { _id: _id },
                update: data
            })
        }
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.getMarketDataById = async (req, res) => {
    try {
        let market = await dbMethods.findOne({
            collection: dbModels.Marketing,
            query: { id: req.params.id },
            populate: [{ path: "image", select: "filepath pdf_extract_img" }]
        })
        return res.send(helperUtils.successRes("Successfully get the market data", market))
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}


exports.deleteMarketDataById = async (req, res) => {
    try {
        let market = await dbMethods.findOne({
            collection: dbModels.Marketing,
            query: { id: req.params.id }
        })
        if (market)
            await dbMethods.deleteOne({
                collection: dbModels.Marketing,
                query: { _id: req.params._id }
            })
        return res.send(helperUtils.successRes("Successfully delete market data", market))
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.marketingList = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query.title = new RegExp(req.body.search, 'i');
        let result = await dbMethods.paginate({
            collection: dbModels.Marketing,
            query,
            options: {
                populate: [
                    { path: "image", select: " filepath file_ pdf_extract_img" }
                ],
                page: req.body.page ? req.body.page : 1,
                limit: req.body.limit ? req.body.limit : 10,
                sort: { _id: -1 },
            }
        })
        return res.send(helperUtils.successRes("Successfully get the marketing list", result));
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}


exports.salespersonCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let chekAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.User,
                query: { email: req.body.email.toLowerCase() }
            })
            if (chekAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Email Already Exists", {}));
            }
            let createsalesperson = await dbMethods.insertOne({
                collection: dbModels.User,
                document: {
                    name: req.body.name,
                    email: req.body.email.toLowerCase(),
                    password: await helperUtils.bcryptHash(req.body.password),
                    role: UserRoleConstant.SalesPerson,
                    phone: req.body.phone,
                    createdBy: req.user._id,
                    permissions: req.body.permissions
                }
            })
        } else {
            let _id = req.body._id
            delete req.body._id

            //lets check email already  exists
            let emailcheck = await dbMethods.findOne({
                collection: dbModels.User,
                query: { email: req.body.email.toLowerCase(), _id: { $ne: _id } }
            })
            if (emailcheck) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Email Already Exists", {}));
            }
            await dbMethods.updateOne({
                collection: dbModels.User,
                query: { _id: _id },
                update: req.body
            })
        }
        return res.send(helperUtils.successRes("Successfully created"))
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.slaespersonById = async (req, res) => {
    try {
        let client = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            project: { name: 1, email: 1, phone: 1, }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client", client));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.slaespersondelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.User,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.salespersonList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.SalesPerson }
        if (req.body.search) {
            query['$or'] = [];
            query['$or'].push({ name: new RegExp(req.body.search, "i") });
            query['$or'].push({ email: new RegExp(req.body.search, "i") });
        }
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = {
            docs: [],
            hasNextPage: true,
            hasPrevPage: false,
            limit: 10,
            nextPage: 1,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 0,
            totalPages: 1,
        };

        result.docs = await dbMethods.find({
            collection: dbModels.User,
            query: query,
            project: { name: 1, email: 1, phone: 1, allowLoginTime: 1, allowLoginSec: 1, isDel: 1 },
            sort: { _id: -1 },
            populate: [{ path: "permissions" }]
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.createmergepdf = async (req, res) => {
    try {
        let data = req.body.data
        let div = ``;
        let drivecheck = await dbMethods.findOne({
            collection: dbModels.Drive,
            query: { "pdfName": { $regex: new RegExp("^" + req.body.pdfName + "$", "i") } }
        })
        if (drivecheck) {
            return res.status(400).send(helperUtils.errorRes("Already Exists", {}, 400))
        }
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            div += `
             <div class="pdf-image-wrapper">
             <img src="${element.imgUrl}"
                 alt="Image ${i + 1}" />
             <div class="pdf-image-caption">${element.designNo}</div>
             </div>
             `
        }
        let drive = await dbMethods.insertOne({
            collection: dbModels.Drive,
            document: {
                pdfName: req.body.pdfName,
                userId: req.user._id,
                isgen: false,
                data: data,


            }
        })
        let htmlContent = helperUtils.htmlContent;
        htmlContent = htmlContent.replace('{{content}}', div);
        let pdfdir = path.join(__dirname, "../../uploads/drivepdf/", drive._id + '.pdf')

        generatePDF(htmlContent, pdfdir, drive)
            .then(async (url) => {
                drive.pdfurl = url
                let filetos3 = await helperUtils.uploadfileToS3(
                    pdfdir,
                    req.body.pdfName,
                    "application/pdf",
                    "default"
                )
                await dbMethods.updateOne({
                    collection: dbModels.Drive,
                    query: {
                        _id: drive._id,
                    },
                    update: { pdfurl: filetos3 }
                })
                drive.pdfurl = filetos3
                if (fs.existsSync(pdfdir)) {
                    fs.unlinkSync(pdfdir)
                }
                return res.send(helperUtils.successRes("Successfully", drive))
            })
            .catch((error) => {
                return res.send(helperUtils.errorRes("Error", error.message))
            })
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}
function generatePDF(htmlContent, pdfdir, drive) {
    return new Promise(async (resolve, reject) => {
        try {
            // const browser = await launch();
            let browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
            const page = await browser.newPage();
            await page.setContent(htmlContent);
            const pdfBuffer = await page.pdf();
            await browser.close();

            let url = "http://43.204.194.160:3300/uploads/drivepdf/" + drive._id + '.pdf';

            // Write the PDF to the file system
            fs.writeFile(pdfdir, pdfBuffer, (error) => {
                if (error) {
                    reject(error); // Reject the promise if an error occurs during file writing
                } else {
                    // Update the database with the PDF URL after successful file writing
                    dbMethods.updateOne({
                        collection: dbModels.Drive,
                        query: { _id: drive._id },
                        update: { pdfurl: url, isgen: true }
                    }).then(() => {
                        resolve(url); // Resolve the promise with the PDF URL
                    }).catch((dbError) => {
                        reject(dbError); // Reject the promise if an error occurs during database update
                    });
                }
            });
        } catch (error) {
            reject(error); // Reject the promise if an error occurs during PDF generation
        }
    });
}

exports.drivelist = async (req, res) => {
    try {
        let { page, limit, pdfName, uploadedBy } = req.body
        let query = { $match: {} };
        if (pdfName) {
            query.$match['pdfName'] = new RegExp(pdfName, "i");
        }
        if (uploadedBy) {
            query.$match['userId.name'] = new RegExp(uploadedBy, "i")
        }
        let pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: "$userId" },
            { $sort: { _id: -1 } }

        ]
        if (query && query.$match) pipeline.push(query);
        let data = await dbMethods.aggregate({
            collection: dbModels.Drive,
            pipeline: pipeline,
        })
        let result = {
            docs: data.slice((page - 1) * limit, page * limit),
            page: page,
            limit: limit,
            pages: Math.ceil(data.length / limit),
            total: data.length
        }
        return res.send(helperUtils.successRes("Successfully get drive list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.salespersonpermissionlist = async (req, res) => {

    try {

        let pipeline = []
        pipeline.push({
            $match: {
                module: { $in: ["SalesPerson"] }
            }
        })
        pipeline.push({
            $project: {
                _id: 1,
                label: "$title",
                module: 1,
                value: "$code"
            }
        })

        let permissions = await dbMethods.aggregate({
            collection: dbModels.Permission,
            pipeline: pipeline,
            options: { lean: true }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get permissions", permissions));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.drivepdfcreate = async (req, res) => {
    try {
        console.log(req.body)
        if(req.body._id){
            let drive = await dbMethods.findOne({
                collection: dbModels.Drive,
                query: {_id: req.body._id}
            })
            if(!drive){
                return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Drive not find", {}));  
            }
            await dbMethods.updateOne({
                collection: dbModels.Drive,
                query: { _id: req.body._id },
                update: req.body
            })
            return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully updated", {})); 

        }else{
            let drive = await dbMethods.insertOne({
                collection: dbModels.Drive,
                document: {
                    data: req.body.data,
                    pdfName: req.body.pdfName,
                    userId: req.user._id,
                    pdfurl: req.body.pdfurl,
                    ImagesPreviewsData: req.body.ImagesPreviewsData,
                    rowBackgroundsData: req.body.rowBackgroundsData,
                    title: req.body.title,
                    typeOfPdf: req.body.typeOfPdf,
                    uploaded: true,
                    isgen: true
                }
            })
        return res.send(helperUtils.successRes("Successfully Created", drive))
        }
    } catch (error) {
        console.log("error",error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.drivepdfById = async (req, res) => {
    try {
        let drive = await dbMethods.findOne({
            collection: dbModels.Drive,
            query: { _id: req.params.id},
            populate: [
                { path: "userId", select: "_id name email phone"},
            ]
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get Mock Data", drive));
    } catch (error) {
        console.log("error",error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.drivedelete = async (req, res) => {
    try {
        let drive = await dbMethods.findOne({
            collection: dbModels.Drive,
            query: { _id: req.body.id }
        })
        if (drive?.pdfurl?.includes("https")) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET,
                Key: drive.pdfurl
            };
            // s3.deleteObject(deleteParams, (err, data) => {
            //     if (err) {
            //         console.error("Error:", err);
            //     } else {
            //         console.log("Original file deleted successfully");
            //     }
            // });
        } else if (drive.pdfurl) {
            let upload_index = drive?.pdfurl?.indexOf("/uploads");
            if (upload_index != -1) {
                const desiredString = drive?.pdfurl.substring(upload_index);
                let pdf_path = path.join(__dirname, "../../" + desiredString);
                if (fs.existsSync(pdf_path)) {
                    fs.unlink(pdf_path, (err) => {
                        if (err) throw err;
                        console.log(pdf, ' was deleted');
                    });
                }
            }
        }
        await dbMethods.deleteOne({
            collection: dbModels.Drive,
            query: { _id: drive._id }
        })
        return res.send(helperUtils.successRes("Successfully delete", {}))
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.driveedit = async (req, res) => {
    try {
        await dbMethods.updateOne({
            collection: dbModels.Drive,
            query: { _id: req.body._id },
            update: { pdfName: req.body.pdfName }
        })
        return res.send(helperUtils.successRes("successfully updated", {}));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.salespersondropdown = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.SalesPerson }
        let salesperson = await dbMethods.find({
            collection: dbModels.User,
            query,
            project: { _id: 1, name: 1 }
        })
        return res.send(helperUtils.successRes("get list", salesperson))
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST)); F
    }
}