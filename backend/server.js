import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import bcrypt from "bcrypt"
import {nanoid} from "nanoid"
import jwt from "jsonwebtoken"
import admin from "firebase-admin"
// import { createRequire } from "module"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
// const require = createRequire(import.meta.url)
// const serviceAccountKey = require("./mern-blog-website-15a5d-firebase-adminsdk-fbsvc-a5be881341.json")
import User from "./Schema/User.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import Blog from "./Schema/Blog.js"

const server = express()
let port = 3000

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});


let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
let passwordRegex = /^(?=.*\d)(?=.*\W)(?=.*[a-zA-Z])(?!.*\s).{8,}$/

const hashPassword = (password) => {
  return bcrypt.hash(password, 10)
}

server.use(express.json())
server.use(cors())

mongoose
  .connect(process.env.DB_LOCATION, {
    autoIndex: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.error(err))

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
  }
})

const generateUploadURL = async (s3Client) => {

  const imageName = `${nanoid()}-${Date.now()}.jpeg`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: imageName,
  })

  return await getSignedUrl(s3Client,command, {
    expiresIn: 3600,
  })

}

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(405).json({ error: "Access token is invalid" });
    }

    req.user = user.id;
    next();
  })
  
}
const formatDatatoSend = (user) => {
  const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY)

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
  })
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : ""
  return username
}

server.get('/get-upload-url', async (req, res) => {
  try {
    const url = await generateUploadURL(s3Client)
  
    res.status(200).json({ uploadURL: url })
  }
  catch (err) {
    return res.status(500).json({ error: err.message })
  }
});

server.post("/signup", async(req, res) => {
  try {
    let { fullname, email, password } = req.body

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

    let hashed_password = await hashPassword(password)
    let username = await generateUsername(email)

    let user = new User({
      personal_info: {fullname, email, password: hashed_password, username},
    })
    const savedUser = await user.save()
    
        return res.status(200).json(formatDatatoSend(savedUser))
    
  }
  catch (err) {
     if (err.code == 11000) {
          return res.status(500).json({error: "Email already exists!"})
        }
        return res.status(500).json({error: err.message})
  }

})

server.post("/signin", async (req, res) => {
  try {
    let { email, password } = req.body
    let user = await User.findOne({ "personal_info.email": email })
    if (!user) return res.status(403).json({ error: "Email not found" })

    bcrypt.compare(password, user.personal_info.password, (err, result) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Error occur while login, Please try again!" })
      }

      if (!result) {
        return res.status(403).json({ error: "Incorrect password!" })
      } else {
        return res.status(200).json(formatDatatoSend(user))
      }
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

server.post("/google-auth", async (req, res) => {
  try {
  
    let { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Missing idToken" });
    }

    let decodedUser = await admin.auth()
      .verifyIdToken(idToken)
   
    let { email, name, picture } = decodedUser;

    picture = picture.replace("s96-c", "s384-c")
    let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
    
    if (user) {
        
      if (!user.google_auth) {
        return res.status(500).json({
          "error": "This email was signed up without google. Please log in with password to access account!"
            
        })

      }
    } else {
        
      let username = await generateUsername(email);
      user = new User({
        personal_info: { fullname: name, email, profile_img: picture, username },
        google_auth: true
      });
      user = await user.save()

    }
    return res.status(200).json(formatDatatoSend(user))

  }
  catch (err) {
    res.status(500).json({ error: "Failed to authenticate you with Google.Try with some other google account" })
  }
})

server.post('/latest-blogs', async (req, res) => {
  try {
    let { page } = req.body.page
    let maxLimit = 5
    let blogs = await Blog.find({ drafts: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title desc banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
      .limit(maxLimit)  
    
    return res.status(200).json({blogs})
  }
  catch (err) {
    return res.status(500).json({error:err.message})
  }
})

server.post("/all-latest-blogs-count", async (req, res) => {
  try {
    let count = await Blog.countDocuments({ drafts: false });
    return res.status(200).json({ totalDocs: count });
  }
  catch (err) {
    console.log(err.message);
    return res.status(500).json({error: err.message});
  }
})
server.get('/trending-blogs', async (req, res) => {
  try {
    let blogs = await Blog.find({ drafts: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
      .limit(5)
    
    if(blogs) {
        return res.status(200).json({blogs})
    }
    else {
              return res.status(500).json({error:"No blogs data"})

    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message })

    
  }

})

server.post('/search-blogs', async (req, res) => {
  try {
    let { tag } = req.body;
   
    let findQuery = { tags: tag, drafts: false };
    let maxLimit = 5;
    let blogs = await Blog.find(findQuery)
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .sort({ "publishedAt": -1 })
      .select("blog_id title desc banner activity tags publishedAt -_id")
      .limit(maxLimit)
   
    return res.status(200).json({blogs})

  }
  catch (err) {
    return res.status(500).json({error:err.message})
  }
})

server.post('/create-blog', verifyJWT, async (req, res) => {

  try {
    let authorId = req.user;

    let { title, banner, content, tags, desc, drafts } = req.body;
 
    if (!title.length) {
      return res.status(403).json({ error: "You must provide a title" });
    
    }

    if (!drafts) {

      if (!desc || !desc.length || desc.length > 200) {
        return res.status(403).json({ error: "You must provide blog description under 200 characters" });
    
      }

      if (!banner.length) {
        return res.status(403).json({ error: "You must provide a banner to publish it" });
    
      }

      if (!content.blocks.length) {
        return res.status(403).json({ error: "There must be some blog content to publish it" });
    
      }
      if (!tags.length || tags.length > 10) {
        return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10 tags" });
    
      }
    
    }

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();
  
    let blog = new Blog({ title, banner, desc, content, tags, author: authorId, blog_id, drafts: Boolean(drafts) });
  
    blog.save()
    let incrementVal = drafts ? 0 : 1;
    let user = await User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
    if (user) {
      return res.status(200).json({ id: blog.blog_id })
        
    } else {
      return res.status(500).json({ error: "Failed to update total posts number" })

    }
    
  }
  catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

server.listen(port, () => {
  console.log("Listening on port " + port)
  
})
