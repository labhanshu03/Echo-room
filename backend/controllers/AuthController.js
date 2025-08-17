import User from "../models/UserModel.js";
import validator from "validator"
import { genToken } from "../config/token.js";
import bcrypt from "bcrypt"


export const signUp = async (req,res)=>{
    try{
    const {email,password}=req.body;
     console.log()
    if(!email || !password){
        return res.status(400).json({message:"Email and Password is required"})
    }
    const existUser=await User.findOne({email})
    
    if(existUser){
        return res.status(400).json({message:"user already exists"})
    }
   
    if(!validator.isEmail(email)){
          return res.status(400).json({message:"Enter valid Email"})
    }
 
    if(password.length < 8){
        return res.status(400).json({message:"Enter Strong Password"})
    }

    let hashpassword=await bcrypt.hash(password,10)
   
     
    const user=await User.create({email,password:hashpassword})
  

    let token=await genToken(user._id,email)
    

    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"None",
        maxAge:3*34*60*60*1000

    })
 
    return res.status(200).json(user)


    }catch(error){
        return res.status(500).json({message:"Internal server error signup failed"})
    }
}

export const login= async (req,res)=>{
    try{
    const {email,password}=req.body;
    
    if(!email || !password){
        return res.status(400).json({message:"Email and Password is required"})
    }
    const user=await User.findOne({email})
    
    if(!user){
        return res.status(400).json({message:"user with the given email doesn't exist"})
    }
   
    if(!validator.isEmail(email)){
          return res.status(400).json({message:"Enter valid Email"})
    }
 
    if(password.length < 8){
        return res.status(400).json({message:"Enter Strong Password"})
    }

    const auth=await bcrypt.compare(password,user.password)
    if(!auth){
        return res.status(400).send("password is incorrect")
    }

  

    let token=await genToken(user._id,email)
    

    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"None",
        maxAge:3*34*60*60*1000

    })
 
    return res.status(200).json(user)


    }catch(error){
        return res.status(500).json({message:"Internal server error signup failed"})
    }
}


export const getUserInfo=async(req,res,next)=>{
    try{
        
        const userData=await User.findById(req.userId)
        
        if(!userData){
            return res.status(400).json({message:"user with the given data not found"})
        }
        return res.status(200).json(userData)
    }catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfile=async(req,res)=>{
    try{
        const userId=req.userId
        const {firstName,lastName,color}=req.body
        console.log(lastName)
        if(!firstName || !lastName ){
            return res.status(400).json({message:"firstname,lastname and color are required"})
        }
        const userData=await User.findByIdAndUpdate(userId,{firstName,lastName,color,profileSetup:true},{new:true,runValidators:true})
            return res.status(200).json(userData)
    }catch(error){
          console.log(error)
          return res.status(500).json({message:"internal server error"})
    }
}