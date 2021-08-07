const DocModel = require('../models/doc');
const core = require('./core');

const path = require('path');
const fs = require('fs');
exports.uploadDoc =async (req,res)=>{
    let headers = JSON.parse(JSON.stringify(req.headers));
    const result = await core.users(headers.access_token);
    if(result.status){
        const userId =result.data.id;
        let id = 1; 
        await DocModel.find({}).sort({ userId: -1 }).limit(1).then(function(response) {
            if (response[0]) {
                id = parseInt(response[0].userId) + 1;
            }
        });
        let NewDoc = new DocModel();
        NewDoc.id = id;
        NewDoc.userId = userId;
        NewDoc.docName=req.file.filename;
        NewDoc.discription = req.body.discription;
        NewDoc.type = req.file.mimetype;
        NewDoc.path = req.file.path;
        NewDoc.save((err, user) => {
            if (err) {
                return res.status(400).json({ 
                    status : false,
                    'msg': err 
                });
            }
            return res.status(201).json({status : true});
        });
    }else{
        return res.status(400).json({ 
            status  : false,
            code : 1002
        });
    }
}
//get the docs
exports.getDocs =async (req,res)=>{
    let headers = JSON.parse(JSON.stringify(req.headers));
    const result = await core.users(headers.access_token);
    if(result.status){
        const userId =result.data.id;
        const userType =result.data.type;
        let pipeline = []
        if(userType === 'admin'){
            // query = {userId : userId}
            pipeline = [ 
                {
                  '$lookup': {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'user_id',
                    as: 'username'
                  }
                },
                {
                    $unwind : "$username" 
                }
              ];
        }else{
            pipeline = [
                {
                    $match : {
                        userId  : userId
                    }
                  }
            ]
        }
        await DocModel.aggregate(pipeline).then((items,err)=>{
            if(err){
                return res.status(400).json({ 
                    status : false,
                    msg: err });
            }
            if(items){
                let newData = [];
                items.forEach(element => {
                    const temp ={
                        id : element._id,
                        userId : element.userId,
                        docName  :element.docName,
                        discription : element.discription,
                        type : element.type,
                        url : req.protocol + '://' + req.get('host') + '/api/file/' + element._id,
                        path : element.path,
                        username : element.username&&element.username.Name
                    }
                    newData.push(temp);
                });
                return res.status(200).json({ 
                    status  : true,
                    data : newData
                });
            }
        })
    }else{
        return res.status(400).json({ 
            status  : false,
            code : 1002
        });
    }
}
exports.viewFile = (req,res)=>{
    let imgId = req.params.id;
    let type = req.params.type;
    let UPLOAD_PATH = 'src/uploads/';
    let contentType = '';
    switch (type) {
        case 'image':
            contentType  = 'image/jpeg';
            break;
        case 'pdf' : 
            contentType = 'application/pdf'
        default:
            break;
    }
    DocModel.findById(imgId, (err, image) => {
        res.setHeader('Content-Type', type);
        if (err) {
            res.sendStatus(400);
        }
        if(image){
            // stream the image back by loading the file
            fs.createReadStream(path.join(UPLOAD_PATH, image.docName)).pipe(res);
        }
    })
}
exports.download = async (req, res, next) => {
    // try {
    //     const file = await DocModel.findById(req.params.id);
    //     res.set({
    //         'Content-Type': file.type
    //     });
    //     res.sendFile(path.join(`${__dirname}`, '../../src/uploads',file.docName));
    //   } catch (error) {
    //     res.status(400).send('Error while downloading file. Try again later.');
    //   }
    const file = await DocModel.findById(req.params.id);
    let UPLOAD_PATH = 'src/uploads/';
    let fpath = UPLOAD_PATH+'/'+file.docName;   
    let mimetype = file.type; 

    fs.readFile(fpath, function (err, data) {        
        if (err) res.status(500).send('File could not be downloaded');

        var base64 = Buffer.from(data).toString('base64');
        base64='data:' + mimetype + ';base64,'+base64;
        res.send(base64);
    });  
  }