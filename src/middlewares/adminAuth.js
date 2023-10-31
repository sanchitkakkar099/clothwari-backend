
//helper utils 
const { HttpStatus, UserRoleConstant } = require("../utils").constant;
const helperUtils = require("../utils/helper");

exports.adminAuth = async (req, res, next) => {
    try {

        let token = req.headers['authorization']
        if (!token) {
            return res.status(HttpStatus.UNAUTHORIZED)
                .send(helperUtils.errorRes("Auth Token required to Access Request", {}, HttpStatus.UNAUTHORIZED));
        }
        let verify = await helperUtils.jwtVerify(token);

        if (!verify) {
            return res.status(HttpStatus.UNAUTHORIZED)
                .send(helperUtils.errorRes("unAuthorized Token", {}, HttpStatus.UNAUTHORIZED));
        }
        //check use role
        if (verify.role != UserRoleConstant.Admin && verify.role != UserRoleConstant.SuperAdmin) {
            return res.status(HttpStatus.UNAUTHORIZED)
                .send(helperUtils.errorRes("unAuthorized Token", {}, HttpStatus.UNAUTHORIZED));
        }
        req.user = verify
        next()
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED)
            .send(helperUtils.errorRes("UnAuthorized", {}, HttpStatus.UNAUTHORIZED));
    }
}