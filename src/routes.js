const express = require('express'),
routes  = express.Router();
const core  = require('./controller/core');
const passport  = require('passport');
const userController    = require('./controller/User');
const HomeController = require('./controller/home');
    var multer  = require('multer')
    let UPLOAD_PATH = 'src/uploads/';
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, UPLOAD_PATH)
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, file.fieldname + '-' + uniqueSuffix)
        }
      })
      
    var upload = multer({ 
        storage: storage })

    routes.post('/register', userController.registerUser);
    routes.post('/login', userController.loginUser);
    routes.post('/uploadDoc',upload.single('file'),HomeController.uploadDoc);
    routes.get('/getDocs',HomeController.getDocs);
    routes.get('/file/:id/:type',HomeController.viewFile);
    routes.get('/download/:id',HomeController.download);
    routes.get('/checkToken',async  (req, res) => {
        let headers = JSON.parse(JSON.stringify(req.headers));
        const result = await core.users(headers.access_token);
        if(result.status){
            return res.status(200).json({
                data: result.data.email,
                status : true
            });
        }else{
            return res.status(400).json({ 
                status  : false,
            });
        }
    });
module.exports = routes;
