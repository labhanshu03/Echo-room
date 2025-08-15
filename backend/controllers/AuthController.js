import User from "../models/UserModel.js";
import validator from "validator"
import { genToken } from "../config/token.js";


export const signUp = async (req,resizeBy,next)=>{
    try{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Email and Password is required"})
    }
    const existUser=User.findOne({email})
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

    const user=await User.create({email,hashpassword})

    let token=await genToken(user._id,email)

    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"None",
        maxAge:3*34*60*60*1000

    })
    return res.status(201).json(user)


    }catch(error){
        return res.status(500).json({message:"Internal server error signup failed"})
    }
}