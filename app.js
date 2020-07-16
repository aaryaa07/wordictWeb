const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
// ?retryWrites=true&w=majority
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-arya:arya@cluster0.ob7wg.mongodb.net/wordictDB",{ useUnifiedTopology: true ,useNewUrlParser:true}).catch(err => console.log(err));
const usersSchema = new mongoose.Schema({
    email: String,
    password: String,
    userwords: [String]
});
const wordsSchema = new mongoose.Schema({
    word: String,
    definitions: String
});
const User = mongoose.model("User", usersSchema);
const Word = mongoose.model("Word", wordsSchema);
var words = [];
var uflag;
var meanings = [];
var word;
var suser;

var wordData;

var foundmeanings = [];


app.get("/", function (req, res) {
    var name = "WORDict"
    suser={};
    console.log(suser);
    res.render("home", { varname: name });
})
app.get("/main", function (req, res) {
   
    if(suser.email==="")
    res.redirect("/");

    if (suser) {
      
        res.render("main", { wl: words, ml: foundmeanings });
        console.log("in /main "+words);
        console.log(foundmeanings);

        // console.log(words.length + "\n");
    
        // for (var i = 0; i < suser.userwords.length; i++) {
           
            
        //    Word.findOne({word:suser.userwords[i]},function(err,foundWord){
        //        if(!err){
        //            foundmeanings.push(foundWord.definitions);
        //        }
        //        else{
        //            console.log(err);
        //        }

        //    })


        // }
     
        

        
        


        
        // res.redirect("/main");






    }
    else {
        if(suser.email==="")
        res.redirect("/");
    }

})
app.patch("/main", function (req, res) {


})
app.post("/main", function (req, res) {


    word = req.body.word;
    var flag = 0;

    words.forEach(function (it) {
        if (it === word) {
            flag = -1;
            return;

        }
    })
    if (flag === -1) {
        res.send("word is already present");

    }
    else {
        meanings=[];
        // var varname;
      


        var uuid = require("uuid");
        var id = uuid.v4();



        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
        https.get(url,function (response) {

            console.log(response.statusCode);
            if(response.statusCode===404){
                res.redirect("/api-err")
            }
             if(response.statusCode===429){
                
                res.redirect("/api-err");
            }
             
        
            if(response.statusCode===200)
           {  words.push(word);
               User.updateOne({ email: suser.email }, { $set: { userwords: words } }, function (err) {
            if (!err) {
                console.log("updated");

            }
            else {
                res.send(err);
            }

        });
               response.on("data", function (data) {
                wordData = JSON.parse(data);
                console.log(wordData);
                wordData = wordData[0]["meanings"];
                // const worda=wordData.word;
                // let i = 1;
                // wordData.forEach( (meaning)=>{
                meanings.push(wordData[0]["definitions"][0]["definition"]);
                // });
                console.log(meanings);
                const newWord = new Word({
                    word: word,
                    definitions: wordData[0]["definitions"][0]["definition"],
                });
                newWord.save(function (err) {
                    if (!err) {
                        console.log("word Data added to database");
                        console.log(words);
                        

                        // words.forEach(function (shabd) {

                        // });

                        
                        Word.findOne({ word: word }, function (err, foundWord) {
                            if (!err) {
                                console.log(foundWord.word);
                                // foundwords.push(foundWord.word);
                                // console.log(foundwords);
                                
                                foundmeanings.push(foundWord.definitions);
                                console.log(foundmeanings);
                                console.log(foundWord.definitions);
                                if(foundmeanings.length===words.length){
                                    res.render("main",{wl:words,ml:foundmeanings});
                                }
                            }
                            else {
                                console.log(err);
                            }
                        }).catch(err => console.log(err));


                        // console.log("before render(words): "+words+" and meanings"+foundmeanings);
                        // console.log("render time");
                        // res.render("main", { wl: words, ml: foundmeanings });
                        // // res.redirect("/main");
                        // console.log("rendered");



                    }
                    else {
                        console.log(err);
                        // res.send(err);
                    }
                }).catch(err => console.log(err));
            





                // words.forEach(function(shabd){
                //     console.log(shabd);
                //     Word.findOne({word:shabd},function(err,foundWord){
                //         if(!err){
                //             console.log(foundWord);
                //             foundwords.push(foundWord.word);
                //             foundmeanings.push(foundWord.definitions[0]);
                //             console.log(foundmeanings);
                //         }
                //         else{
                //             console.log(err);
                //         }
                //     });
                //     console.log("found Meanings Array \n"+foundmeanings);
                // });

                // if (words.length > 0) {
                //     foundwords = [];
                //     foundmeanings = [];
                //     console.log(foundmeanings);
                //     // words.forEach(function (shabd) {
                //     //     console.log(shabd);


                //     //     Word.findOne({ word: shabd }, function (err, foundWord) {
                //     //         if (!err)
                //     //         {console.log("Word: "+ foundWord.word+"\n"+"Meaning "+foundWord.definitions[0] );

                //     //             foundwords.push(foundWord.word);
                //     //             foundmeanings.push(foundWord.definitions[0]);
                //     //             console.log(foundmeanings);
                //     //         }
                //     //         else {
                //     //             res.send(err);
                //     //         }
                //     //     });
                //     // });


                // }
                // res.render("main", { wl: foundwords, ml: foundmeanings });





            });}
            // response.on('end', function () {

            //     Word.findOne({word:})

            // });



















        });
    




        // console.log(word);




    }


});
app.get("/check", function (req, res) {
    res.render("check", { meaningList: meanings });
})
app.get("/api-err",function(req,res){
    res.render("api_err");
})

app.get("/mismatch", function (req, res) {
    res.render("mismatch");
})

app.get("/login", function (req, res) {
    suser={};
    console.log(suser);
    res.render("login");
})

app.post("/", function (req, res) {
    console.log(req.body);
    if(req.body.pass1.length===0||req.body.pass2.length===0){
        console.log("Password error");
        res.redirect("/mismatch");
    
    }
    else{
    var email = req.body.username;
    var password = md5(req.body.pass1);
    var confirm = md5(req.body.pass2);
    console.log(password.length);

    if (password != confirm) {
        console.log("passwords error")
        res.redirect("/mismatch");
        return;
    }

    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password == password) {
                    console.log("user already exists, login instead");
                    res.send("You already have an account");
                }
            }
            else {
                const newUser = new User({
                    email: email,
                    password: password
                });
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // res.send("created account Successfully");
                        res.redirect("/login");
                    }
                }).catch(err => console.log(err));

            }
        }
    }).catch(err => console.log(err));

    }



})

app.post("/login", function (req, res) {
    console.log(req.body)
    var email = req.body.username;
    var password = md5(req.body.pass1);
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password == password) {
                    suser = foundUser;
                    console.log(suser);
                    console.log(typeof(suser));
                    words = [];
                    cords=[];
                    foundmeanings=[];
                    meanings=[];
                  uflag=1;
                  console.log(suser.userwords.length);
                  if(suser.userwords.length==0){
                      res.redirect("/main");
                  }
                  else{
                  if(uflag===1){
                      for(var i=0;i<suser.userwords.length;i++){
                        cords.push(suser.userwords[i]);
                      }
                      console.log(cords);
                    for(var j=0;j<cords.length;j++)
                    {
                        console.log(cords[j]);
                        console.log(j);
                        
                        
                        Word.findOne({word:cords[j]},function(err,usr){
                            // console.log(words[j]);
                            
                            console.log("in login "+usr.definitions);
                            words.push(usr.word);
                            foundmeanings.push(usr.definitions);
                            console.log(foundmeanings);
                            if(foundmeanings.length===cords.length){
                                console.log(foundmeanings);
                                uflag=0;
                                console.log(i);
                                 res.redirect("/main");
                                //  console.log("sent");
                               
                            
                            }

                        
                           if(err){
                               console.log(err);
                           }
                        }).catch(err => console.log(err));
                    }
                }
                    

                }
                  
                    
                }
                else {

                    res.redirect("/mismatch");

                }
            }
            else {
                res.send("Please signup first");
            }

        }
    })
}).catch(err => console.log(err));

let port=process.env.PORT;
if(!port)
   { port=3000;}


app.listen(port, function () {
    console.log("Server ready ");
})