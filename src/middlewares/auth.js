const { helperUtils, dbMethods, dbModels } = require("../utils");
const { UserRoleConstant } = require("../utils/constant");
const { HttpStatus } = require("../utils").constant
exports.auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Access Denied No Token Found", {}, 401));
        let payload = await helperUtils.jwtVerify(token)
        if (!payload) return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Invalid Auth token", {}, 401));
        req.user = payload

        //check client loggin session time
        if (payload.role == UserRoleConstant.Client) {
            let currenttimestamp = Date.now();
            let client = await dbMethods.findOne({
                collection: dbModels.User,
                query: { _id: payload._id }
            })
            if (client) {
                let minimum_time = new Date(client.from_time).getTime()
                let maximum_time = new Date(client.to_time).getTime()
                let current_time = Date.now()
                if (current_time >= minimum_time && current_time <= maximum_time) next()
                else return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Access Denied No Token Found", {}, 401));
            }
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Invalid Token", {}, 401))
    }
}