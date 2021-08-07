var jwt     = require('jsonwebtoken');
var config  = require('../config/config');
exports.users =async (token) =>{
    return await jwt.verify(token,config.jwtSecret,(err,user)=>{
        if (err) {
            return{
                    status  : false
                }
        }
        return {
            data: user,
            status : true
        };
    })
}