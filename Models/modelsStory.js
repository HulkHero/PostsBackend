
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const storySchema = Schema({


     heading: {
          type: String,
     },
     caption: { type: String },

     likes: {
          type: [String],
          default: []
     },
     date: { type: Object },
     creatername: { type: String },
     allowComments: { type: Boolean, default: true },
     imagename: { type: String },
     image: {
          data: Buffer,
          contentType: String,
     },
     creater: { type: Schema.Types.ObjectId, ref: 'Person' },

});

const Story = mongoose.model('Story', storySchema, "storys");

module.exports = Story;