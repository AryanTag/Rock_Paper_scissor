const express=require("express");
const bodyParser = require("body-parser");

const app=express();
app.use(bodyParser.urlencoded({extended: true}));

var name;
app.use(express.static("public"));
app.get("/",function(req,res)
{
  res.sendFile(__dirname + "/start.html");
})
app.get("/index",function(req,res){
  res.sendFile(__dirname+"/index.html");
})
app.post("/",function(req,res)
{
  name=req.body.pname;
  console.log(name);
  res.sendFile(__dirname+"/index.html");
})
app.get("/getName",function(req,res){
  res.send(name);
})


app.listen(process.env.PORT || 3000,function()
{
  console.log("Server is running at port 3000");
})
