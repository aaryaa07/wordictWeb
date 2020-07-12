const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
 mongoose.connect("mongodb://localhost:27017/wordictDB")
 const usersSchema=new mongoose.Schema({
     email:String,
     password:String
 });
 const User=mongoose.model("User",usersSchema);
app.get("/",function(req,res){
    res.render("home");
})
app.get("/mismatch",function(req,res){
    res.render("mismatch");
})

app.get("/login",function(req,res){
    res.render("login");
})
app.post("/",function(req,res){
    console.log(req.body);
    var email=req.body.username;
    var password=req.body.pass1;
    var confirm=req.body.pass2;
    if(password!=confirm){
        console.log("passwords mismatch")
        res.redirect("/mismatch");
        return;
    }
    
    User.findOne({email:email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.password==password){
                    console.log("user already exists, login instead");
                    res.send("You already have an account");
                }
            }
            else{
                const newUser=new User({
                    email:email,
                    password:password
                });
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.send("created account Successfully");
                    }
                })

            }
        }
    })

  

    

})
app.post("/login",function(req,res){
    console.log(req.body)
    var email=req.body.username;
    var password=req.body.pass1;
    User.findOne({email:email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.password==password){
                    console.log("user exists and hence can log in");
                    res.send("successfully logged in")
                }
            }
        }
    })
})


app.listen(3000,function(){
    console.log("Server ready at localhost:3000")
})