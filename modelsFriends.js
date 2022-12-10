const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const friends = Schema({
    
            rekuestSents:[{ type: Schema.Types.ObjectId, ref: 'Person' },{unique: true}],
            rekuestRecieved:[{ type: Schema.Types.ObjectId, ref: 'Person' },{unique: true}],
            friends:[{ type: Schema.Types.ObjectId, ref: 'Person' },{unique: true}],
            createrId: { type: Schema.Types.ObjectId, ref: 'Person' },
   
  });
  
  const Friends = mongoose.model('Friends', friends,"friends");

  module.exports =Friends;