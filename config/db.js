var mysql = require('mysql');

var con = mysql.createConnection({
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
  });

  module.exports = con;