

//import helper utils
const { dbMethods, dbModels, helperUtils } = require("../utils")

exports.createAdmin = async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase();
        let alreadyEmail = await dbMethods.findOne({
            collection: dbModels.User,
            query: { email: req.body.email }
        })
        if (alreadyEmail) {
            return res.status(400).send(
                helperUtils.errorRes("Email Already Exists", {}, 400)
            )
        }
        req.body.password = await helperUtils.bcryptHash(req.body.password)
        await dbMethods.insertOne({
            collection: dbModels.User,
            document: req.body
        })
        return res.status(200).send(
            helperUtils.successRes("Successfully created",
                {}, 200)
        )
    } catch (error) {
        console.log(error)
        return res.status(400).send(helperUtils.errorRes(
            "Bad Request",
            error.message,
            400
        ))
    }
}