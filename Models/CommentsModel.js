const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentsSchema = Schema({
    _id: Schema.Types.ObjectId,
    comment: {
        type: String,
    },
    storyId: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
});

const Comments = mongoose.model('Comments', CommentsSchema, "comments");


module.exports = Comments;

