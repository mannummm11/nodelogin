import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, require: true, unique: true},
    password: { type: String, require: true},
    dateTime: {type: Date, default: Date.now}
}, {collection: 'users'})

export const UserModel = mongoose.model('UserSchema', UserSchema)
