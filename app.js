const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/wordictDB")
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
var meanings = [];
var word;
var suser;
var dictionary = [];
var wordData;
var foundwords = [];
var foundmeanings = [];


app.get("/", function (req, res) {
    var name = "WORDict"
    res.render("home", { varname: name });
})
app.get("/main", function (req, res) {


    if (suser) {

        console.log(words.length + "\n");
        if (words.length == 0) {
            // foundwords = [];
            // foundmeanings = [];
            for (var i = 0; i < suser.userwords.length; i++) {
                words.push(suser.userwords[i]);
                foundmeanings.push(Word.find({ word: suser.userwords[i] }).select('definitions'));


            }
            console.log(words);
            console.log(meanings);
            // res.render("main", { wl: foundwords, ml: foundmeanings });

        }
        console.log(words.length + "\n");


        res.render("main", { wl: words, ml: foundmeanings });
        // res.redirect("/main");






    }
    else {
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
        // var varname;
        words.push(word);
        User.updateOne({ email: suser.email }, { $set: { userwords: words } }, function (err) {
            if (!err) {
                console.log("updated");

            }
            else {
                res.send(err);
            }

        });


        var uuid = require("uuid");
        var id = uuid.v4();



        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
        https.get(url, function (response) {

            console.log(response.statusCode);
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
                        foundwords = [];

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
                            }
                            else {
                                console.log(err);
                            }
                        });



                        // res.render("main", { wl: words, ml: foundmeanings });
                        res.redirect("/main");



                    }
                    else {
                        console.log(err);
                        // res.send(err);
                    }
                });





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





            });
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

app.get("/mismatch", function (req, res) {
    res.render("mismatch");
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/", function (req, res) {
    console.log(req.body);
    var email = req.body.username;
    var password = md5(req.body.pass1);
    var confirm = md5(req.body.pass2);
    if (password != confirm) {
        console.log("passwords mismatch")
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
                })

            }
        }
    })





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
                    words = [];
                    res.redirect("/main");
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
})




app.listen(3000, function () {
    console.log("Server ready at localhost:3000")
})