import express from "express"
import path from "path"
import bodyParser from "body-parser"
import mongoose from "mongoose";
import {UserModel} from "./model/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = "hgusdg@#$$^%^fuhildh938684679028)(*%&^$^%&^*(&(UYGJSBHJV#$#&R^R&*IY&TWYIGDKU"

mongoose.connect('mongodb://localhost:27017/login-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const app = express();
app.use('/', express.static(path.join('./', 'static')))
app.use(bodyParser.json())

app.post('/api/test', (req, res) => {
    console.log(req.body)
    res.json({
        "payload": {
          "google": {
            "expectUserResponse": true,
            "richResponse": {
              "items": [
                {
                  "simpleResponse": {
                    "textToSpeech": "First webhook: this is a Google Assistant response"
                  }
                }
              ]
            }
          }
        }
      })
})

app.post('/api/register', async (req, res) => {
    const { username, password: plainTextPassword } = req.body
    const password = await bcrypt.hash(plainTextPassword, 10)
    if(!username || typeof username != 'string') {
            res.statusCode = 400
            return res.json({status: 'error', error: 'Invalid username'})
    }
    else if(!plainTextPassword || typeof plainTextPassword != 'string') {
            res.statusCode = 400
            return res.json({status: 'error', error: 'Invalid password'})
    } else if(plainTextPassword.length < 3) {
            res.statusCode = 400
            return res.json({status: 'error', error: 'Password length should be more then 6 character.'})
    }
    try {
        const dbCreateRes = await UserModel.create({
            username, 
            password
        })
        res.status = 200
        res.json({status: 'Ok', data: dbCreateRes});
    } catch(err) {
        if(err.code === 11000) {
            res.statusCode = 400
            return res.json({status: 'error', error: 'Username already is in use.'})
        }else throw err;
    }
});

app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await UserModel.findOne({ username }).lean()
    if(!user) {
        res.statusCode = 400
        return res.json({status: 'error', error: 'Credential is invalid'})
    }
    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({id: user._id, username: user.username}, JWT_SECRET)
        res.statusCode = 200
        return res.json({status: 'Ok', data: token})
    } else return res.json({status: 'error', error: "Wrong credentials"})
})

app.post('/api/change-password', async (req, res) => {
    const { newPassword, token } = req.body
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    const hashedPass = await bcrypt.hash(newPassword, 10)
    await UserModel.updateOne({_id}, {
        $set: { password: hashedPass }
    }).then((resp) => {
        if(resp) res.json({status: 'Ok',data: 'Password Updated Successfully.'});
        else res.json({status: 'error',data: 'Password Not Updated.'});
    })
})

app.listen(9999, (err) => {if(err) console.log(err); else console.log("Server up at 9999");});