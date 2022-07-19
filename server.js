const express = require('express');
const bodyParser = require('body-parser');
/* var mysql = require('mysql'); */
var multer = require('multer')
var jwt = require('jsonwebtoken');
var path = require('path');

let referesh_token_data = [];
const app = express();


var con = require('./config/db');

/* var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "profile_store"
});

con.connect((err)=> {
if(!err)
    console.log('Connection Established Successfully');
else
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
}); */


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
// serving static files
app.use('/uploads', express.static('uploads'));




function auth(req,res, next){
  let token =req.headers["authorization"];
  token = token.split(' ')[1];
  jwt.verify(token, "Acccesss", (err, user)=>{
          if(!err){
                  req.user = user;
                  next();
          }
          else{
                  return  res.status(401).json({message: "user not authenticated  "})
          }
  });
}

app.post("/referesh_token", (req,res)=>{
  const refereshToken =  req.body.token;  
  
  if(!refereshToken || !referesh_token_data.includes(refereshToken)){
        return  res.status(401).json({message: "user not authenticated  "})      
  }
  jwt.verify(refereshToken, "Referesh", (err, user)=>{
          if(!err){
                const accessToken =  jwt.sign({ username:user.name }, 'Acccesss', {expiresIn: "5d"} );
                return  res.status(200).json(accessToken)
            }else {
                return  res.status(401).json({message: "user not authenticated  "})      
            }
  });  
});


app.post("/login", (req, res)=>{
  const { user } = req.body; 
/*   console.log( req.body)  */
  if(!req.body) {
      // console.log('Object missing');
      return res.status(404).json({message: "Object missing" }); 
   }else{
      // return res.status(404).json({message: user });  

      let accessToken =  jwt.sign({user}, 'Acccesss', {expiresIn: "5d"} );
      let refereshToken = jwt.sign({user},'Referesh', {expiresIn: "7d"});
      
      referesh_token_data.push(refereshToken);

      return  res.status(200). json({
      accessToken,
      refereshToken
      });
   } 
});

app.post("/protected", auth, (req,res)=>{

      res.send("protected route")
})




app.get('/', (req, res) => {
    res.json({'message': 'ok'});
  }) 

  app.get('/getdata',  auth, (req, res) => {
      con.query('SELECT * FROM user_profile', (err, rows, fields) => {
      if (!err)
          res.send(rows);
      else
          console.log(err);
      })
  });



  
  // handle storage using multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
     cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

var upload = multer({ storage: storage });

// handle single file upload
app.post('/upload_profile', upload.single('dataFile'), (req, res, next) => {
  const file = req.file;
  if (!file) {
     return res.status(400).send({ message: 'Please upload a file.' });
  }
  var name = req.body.name;
  var mobile = req.body.mobile;
  var file_name = "uploads/"+req.file.filename;
  
  // var sql = "INSERT INTO `file`(`name`,`mobile`,'profile') VALUES (name , req.mobile +"' , 'req.file','" + req.file.filename + "')";
  var sql = `INSERT INTO user_profile (name, mobile, profile, created_at) VALUES ("${name}", "${mobile}", "${file_name}", NOW())`;

  var query = con.query(sql, function(err, result, fields) {
      return res.send({ message: 'File is successfully.'/* + result.insertId, */   
       /* data: result */
    });
   });
});  









  const port = 3000;
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });
 