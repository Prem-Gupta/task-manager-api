const mongoose = require("mongoose")
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name : {
          type : String,
          trim:true,
          required : true
    },
    email : {
          type : String,
          required : true,
          unique:true,
          trim:true,
          lowercase : true,
          validate(value){
              if(!validator.isEmail(value)){
                  
                  throw new Error("This is not valid Email");
              }
          }
    },
    password : {
        type : String,
        trim : true,
        required  :true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password should not be password ")
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if (value < 0) {
                throw new Error("Age must be positive");
            }
        }
    },

    tokens: [{
          token : {
            type:String,
            required:true
          } 

        }],
        avatar : {
            type:Buffer
        }
},{
    timestamps :true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField :'_id',
    foreignField :'owner'
})


userSchema.methods.getPublicProfile = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


userSchema.methods.generateAuthToken = async function() {
    

    const user = this

   const token =  jwt.sign({ _id : user._id.toString()},process.env.JSON_WEB_TOKEN)
   user.tokens = user.tokens.concat({token})
   await user.save()
   return token
    

}


userSchema.statics.findByCredentials = async (email,password) => {

    const user = await User.findOne({email})
    if(!user) {
        throw new Error("Unable to login")
    }

    const isMatch =  bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user;
}


// password hash format before save 
userSchema.pre('save', async function(next) {

    const user = this

    if (user.isModified('password')) {
        user.password = await  bcrypt.hash(user.password,8)
    }  

    next()

})


const User = mongoose.model('User',userSchema)

module.exports = User;