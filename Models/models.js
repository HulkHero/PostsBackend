const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const personSchema = Schema({
  _id: Schema.Types.ObjectId,
  name:{
    type:String,
  },
  email:{
    type:String,
  },
  password:{
    type:String,
  },
  Posts: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
  friends: { type: Schema.Types.ObjectId, ref: 'Friends' ,default:null },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
  profile: { type: Schema.Types.ObjectId, ref: 'Profile',default:null },
});




const Person = mongoose.model('Person', personSchema,"persons");


module.exports=Person;

