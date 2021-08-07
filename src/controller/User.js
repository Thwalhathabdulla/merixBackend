var User    = require('../models/user');
var jwt     = require('jsonwebtoken');
var config  = require('../config/config');
function createToken(user) {
    return jwt.sign({ 
            id: user.user_id, 
            email: user.email,
            type : user.type
        }, config.jwtSecret, {
        expiresIn: 86400 // 86400 expires in 24 hours
      });
}
exports.registerUser = async  (req, res) => {
    if (!req.body.email || !req.body.password || !req) {
        return res.status(400).json({ 
            status : false,
            'msg': 'You need to send email and password' });
    }
 
    User.findOne({ email: req.body.email },async (err, user) => {
        if (err) {
            return res.status(400).json({ 
                status  : false,
                'msg': err 
            });
        }
 
        if (user) {
            return res.status(400).json({ 
                status : false,
                'msg': 'The user already exists' 
            });
        }
 
        let id = 1; 
        await User.find({}).sort({ user_id: -1 }).limit(1).then(function(response) {
            if (response[0]) {
                id = parseInt(response[0].user_id) + 1;
            }
        });
        let newUser = new User();
        newUser.user_id = id;
        newUser.Name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        newUser.type = 'user';
        newUser.number = req.body.number;
        newUser.save((err, user) => {
            if (err) {
                return res.status(400).json({ 
                    status : false,
                    'msg': err 
                });
            }
            return res.status(201).json({status : true});
        });
    });
};

exports.loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ 
            status : false,
            'msg': 'You need to send email and password' 
        });
    }
 
    User.findOne({ email: req.body.email}, (err, user) => {
        if (err) {
            return res.status(400).send({ 
                'msg': err,
                'status' : false
            });
        }
        if (!user) {
            return res.status(400).json({ 
                'msg': 'The user does not exist',
                'status' :  false
            });
        }
 
        user.comparePassword(req.body.password, async (err, isMatch) => {
            if (isMatch && !err) {
                const tokenid = createToken(user);
                return res.status(200).json({
                    token: tokenid,
                    type : user.type,
                    status : true
                });
            } else {
                return res.status(400).json({ 
                    msg: 'The email and password don\'t match.',
                    status : false
                });
            }
        });
    });
};

// exports.checkToken = (req, res) => {
//     let headers = JSON.parse(JSON.stringify(req.headers))
//     const  accessToken = headers.access_token;
//     token.findOne({token:accessToken},(err, userToken) => {
//         if (err) {
//             return res.status(400).send({ 
//                 'msg': err,
//                 'status' : false
//             });
//         }
 
//         if (!userToken) {
//             return res.status(400).json({ 
//                 'msg': 'The user does not exist',
//                 'status' :  false
//             });
//         }
//         User.findOne({ user_id: userToken.user_id }, (err, user) => {
//             if (err) {
//                 return res.status(400).send({ 
//                     'msg': err,
//                     'status' : false
//                 });
//             }
//             return res.status(200).json({
//                 data: user,
//                 status : true
//             });
//         })
//     })
// }