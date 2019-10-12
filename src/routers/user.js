const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const multer =require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancellationEmail} = require("../emails/account")
const router = new express.Router()

const upload = multer({

   limits : {
     fileSize : 1000000
   },
   fileFilter(req,file,cb) {

      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
         return  cb(new Error('Please Upload image'))
      }

      cb(undefined,true)
      //  cb(undefined,false)
   }
  })


router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save()
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({user,token})
  } catch (e) {
    res.status(400).send(e)
  }
})


router.post("/users/login", async (req,res) => {

    try{

      const user = await User.findByCredentials(req.body.email,req.body.password)
      const token = await user.generateAuthToken()
      const userProfile = await user.getPublicProfile()

      return res.send(200,{userProfile,token})

    }
    catch(e) {
         return res.status(400).send(e)
    }

})

router.post('/users/logout',auth, async (req,res) => {


   try {

       req.user.tokens = req.user.tokens.filter((token)=> {
           return token.token !== req.token
       })

       await req.user.save()
        res.send()

       } catch(e) {
        res.status(500).send(e);

   }

})


router.post('/users/logoutAll',auth, async (req,res) => {

    try {
        req.user.tokens = []
 
        await req.user.save()
         res.send()
 
        } catch(e) {
         res.status(500).send(e);
 
    }
 
 })


router.get("/users/me", auth, (req, res) => {
    const userProfile =  req.user.getPublicProfile()
    res.status(200).send(userProfile)
})

router.get("/users",async (req, res) => {

  try{
    const users =await User.find({})
    res.status(200).send(users)

  }catch(e){
    res.status(500).send(e);

  }
    
    })

router.get("/users/:id",auth, async (req, res) => {
  const _id = req.params.id;

  try{
    const user =await User.findById(_id)
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  }catch(e){
    res.status(500).send(e);

  }

});

router.patch("/users/:id",auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowUpdates = ["name", "email","age","password"];

  const isValidOperation = updates.every(update =>
    allowUpdates.includes(update)
  );


  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = await User.findById(_id);
    updates.forEach(update => (user[update] = req.body[update]));

    await user.save();

    if (!user) {
      return res.status(404).send();
    }

    return res.status(200).send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete("/users/:id",auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    sendCancellationEmail(user.email,user.name)


    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post("/users/me/avatar",auth,upload.single('avatar'),async (req,res)=> {

  const buffer = await sharp(req.file.buffer).resize({width:250,height : 250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
   res.send(200);
},(error,req,res,next)=>{
     res.status(400).send({error : error.message });
})

router.delete("/users/me/avatar",auth,async(req,res) => {

  req.user.avatar = undefined
  await req.user.save()
  res.send(200)
})

router.get("/users/:id/avatar",async (req,res)=>{
 try{
     const user = await User.findById(req.params.id)
     if(!user || !user.avatar){
       throw new Error("Image not found")
     }

     res.set('Content-Type','image/png')
     res.send(user.avatar)
 }catch(e){
  res.status(404).send()
 }
})

module.exports = router;
