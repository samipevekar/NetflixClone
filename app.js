const express=require("express")
const app=express()
const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1/Netflix-signup").then(()=>{
    console.log("connected successfully")
}).catch(()=>{
    console.log("error to connect")
})

const LoginSchema = new mongoose.Schema({
    email:String,
    password:String
})

const collection = new mongoose.model("signups",LoginSchema);

app.set("view engine","ejs")  //set all files to ejs view engine

app.use(express.static("public"))
app.use(express.urlencoded())
app.use(express.json())

// all get methods
app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/signin",(req,res)=>{
    res.render("signin")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.get("/home",(req,res)=>{
    res.render("home")
})

// collecting signup users

app.post("/signup",async (req,res)=>{
    var myData=new collection(req.body)

    const password = req.body.password;
    if (password.length < 8) {
        return res.render("signup", { errorMessage: "Password must contain 8 characters" });
    }
    if (!password.includes("@")) {
        return res.render("signup", { errorMessage: "Password must contain '@'" });
    }

    //checking if user is already exist in the db
    const existingUser=await collection.findOne({email:myData.email})
    if(existingUser){
        res.render("signup",{ errorMessage: "User already exists" })
    }else{
        
        myData.save()
        res.redirect("/signin")
    }
})


//login users
app.post("/signin",async (req,res)=>{
    try{
        const check=await collection.findOne({email:req.body.email})
        if(!check){
            res.render("signin",{errorMessage:"User not found"})
        } 

        //conparing password if match then login
        const isPasswordMatch=await req.body.password===check.password
        if(isPasswordMatch){
            res.render("home")
        }else{
            res.render("signin",{ errorMessage: "Wrong password" })
        }
    }
    catch{
        res.render("signin",{ errorMessage: "An error occured" })
    }

})


const port=80
app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})