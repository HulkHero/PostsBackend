
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const profileSchema = Schema({
     Status: { type: String },
     // date:{type:Object},
     imagename: { type: String },
     avatar: {
          data: Buffer,
          contentType: String,
     },
     createrId: { type: Schema.Types.ObjectId, ref: 'Person' },
});

const Profile = mongoose.model('Profile', profileSchema, "profiles");

module.exports = Profile;