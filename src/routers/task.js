const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router()


router.post('/tasks',auth, async (req, res) => {
  
    const task = new Task({
      ...req.body,
      owner : req.user._id
    })
   
    try{
      const taskCreated= await task.save()
      res.status(201).send(taskCreated)
    }catch(e){
      res.status(400).send(e)
    }
  
  });

  ///  GET /task?completed=false
 /// Get /task?limit=20&skip=0
 // GET /task?sortBy=createdAt:desc
  
  router.get('/tasks',auth,async (req, res) => {

    const match ={}
    const sort = {}
    if(req.query.completed){
     match.completed = req.query.completed === 'true' 
    }

    if(req.query.sortBy){
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
      //  const tasks = await Task.find({owner : req.user._id})
    
       await req.user.populate({
         path:'tasks',
         match,
         options :{
           limit : parseInt(req.query.limit),
           skip : parseInt(req.query.skip),
           sort 
         }
       }).execPopulate()
        res.status(200).send(req.user.tasks)

    }catch(e){
      res.status(500).send(e)
    }

  
  });
  
  router.get('/tasks/:id',auth, async (req, res) => {
      const _id = req.params.id

      try{
      //   const task =await Task.findById(_id)

         const task = await Task.findOne({_id,owner:req.user._id})
         if(!task){
          return res.status(404).send()
      }
         return res.status(200).send(task)
      }catch(e){
        res.status(500).send(e)


      }
     
    });

 module.exports = router
