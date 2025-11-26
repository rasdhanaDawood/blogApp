import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import bcrypt from "bcrypt"
import {nanoid} from "nanoid"
import jwt from "jsonwebtoken"

import User from "./Schema/User.js"

const server = express()
let port = 3000

let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
let passwordRegex = /^(?=.*\d)(?=.*\W)(?=.*[a-zA-Z])(?!.*\s).{8,}$/

server.use(express.json())
server.use(cors())

mongoose
  .connect(process.env.DB_LOCATION, {
    autoIndex: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.error(err))

const formatDatatoSend = (user) => {
  const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY)
console.log("access token:",access_token);

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  }
}

const generateUsername = async (email) => {
  let username = email.split("@")[0]

  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result)
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : ""
  return username
}

server.post("/signup", (req, res) => {
  let {fullname, email, password} = req.body

  if (fullname.length < 3)
    return res
      .status(403)
      .json({error: "Fullname must have atleast 3 letters long!"})

  if (!email.length) return res.status(403).json({error: "Enter Email!"})

  if (!emailRegex.test(email))
    return res.status(403).json({error: "Invalid Email Id"})

  if (password.length < 6) {
    return res
      .status(403)
      .json({error: "Password must have atleast 6 characters!"})
  }

  if (!passwordRegex.test(password))
    return res.status(403).json({
      error:
        "Password should have minimum 8 characters. A number, 1 special character, a letter. No spaces allowed.",
    })

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email)

    let user = new User({
      personal_info: {fullname, email, password: hashed_password, username},
    })

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u))
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({error: "Email already exists!"})
        }
        return res.status(500).json({error: err.message})
      })
  })
})

server.post("/signin", async (req, res) => {
  let {email, password} = req.body
  await User.findOne({"personal_info.email": email})
    .then((user) => {
      if (!user) return res.status(403).json({error: "Email not found"})

      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({error: "Error occur while login, Please try again!"})
        }

        if (!result) {
          return res.status(403).json({error: "Incorrect password!"})
        } else {
          return res.status(200).json(formatDatatoSend(user))
        }
      })
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).json({error: err.message})
    })
})

server.listen(port, () => {
  console.log("Listening on port " + port)
})
