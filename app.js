const express=require("express")
const app=express()

app.set("view engine","ejs")
app.use(express.static("public"))

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

const port=80

app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})