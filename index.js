const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
var ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt");
const sharp = require('sharp')
const { signup, login } = require("./users-controllers")
const multer = require("multer");
const Hello = require("./Models/module");
const Person = require("./Models/models");
const Story = require("./Models/modelsStory");
const Friends = require("./Models/modelsFriends");
const Profile = require("./Models/ProfileModel");
const Comments = require("./Models/CommentsModel");
const bodyParser = require("body-parser");
const fs = require('fs');
const cookieParser = require("cookie-parser");
const { auth } = require("./auth");

require('dotenv').config();
const app = express();
MongoClient = require('mongodb').MongoClient;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 100000
}));
app.use(bodyParser.json());

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE,OPTIONS');

  next();
});

// console.log("env", process.env.MONGODB_URL)
mongoose.connect("mongodb+srv://Hulk:Hulk%401322@cluster0.cmdv1.mongodb.net/hulk2?retryWrites=true&w=majority").then((err, res) => console.log(err));

app.use(cookieParser());


app.delete("/deletePost/:id/:userid", auth, async (rek, res) => {
  console.log("id ")
  id = rek.params.id;
  userid = rek.params.userid;
  if (id) {

    await Person.updateOne({ _id: userid }, { $pull: { Posts: id } })
    const story = await Story.findOne({ _id: id })
    console.log(story)
    fs.unlink("uploads/" + story.imagename, (err) => {
      if (err) { console.log(err) }
    })
    await Story.findByIdAndRemove({ _id: id }).exec()

    res.status(202).json("Post deleted")


  }
  else {
    res.status(300).send("id not found")
  }
})

app.post("/addComment/:postId/:userId", async (rek, res) => {
  const postId = rek.params.postId;
  const userId = rek.params.userId;
  const comment = rek.body.text;

  if (postId && userId && comment) {
    const newComment = new Comments({
      _id: new mongoose.Types.ObjectId(),
      comment: comment,
      storyId: postId,
      userId: userId,
    });
    await newComment.save();
    res.status(200).json("Comment added");
  }
  else {
    res.status(400).json("Error adding comment");
  }

})

app.get("/getComments/:postId", async (rek, res) => {
  const postId = rek.params.postId;
  if (postId) {
    const comments = await Comments.find({ storyId: postId }).populate({ path: 'userId', select: 'name', populate: { path: 'profile', select: 'avatar' } });
    console.log("comments: ", comments)
    res.status(200).json(comments);
  }
  else {
    res.status(400).json("Error getting comments");
  }
})


app.post("/signup", signup, (rek, res) => {

  res.json("login now")

})


app.post("/login", login, (rek, res) => {



  res.send(res.locals.user)
})


app.get("/data", auth, async (req, res) => {
  await Hello.find({}, (err, result) => {
    if (err) {
      // res.json("error")
      console.log("error")
      res.json(err);
    } else {

      res.json(result);

      console.log("afterdata")

    }
  }).clone().catch(function (err) { console.log(err) });
});

// stories an user 
app.get("/", async (req, res) => {
  // res.send("hello")
  const person = await Person.find({}, { email: 1 })
  //const user= await Person.find({},{name:1}).populate('Posts')

  // const posts = await Story.find().sort({ _id: -1 })
  //const user=await Story.find({}).populate('creater')
  //console.log(user.creater[0].name)
  res.send(person)
  // res.send(
  //   posts)
  // res.end()
  // await Story.find({}, (err, result) => {
  //   if (err) {
  // res.json("error")
  //    console.log("error")
  //    res.json(err);
  //  } else {

  //    res.json(result);

  //    console.log("afterdata")

  //   }
  //}).clone().catch(function(err){ console.log(err)});
});


// using at home page
// console.log(rek.userData, "userData")
//auth,
app.get("/batchData/:skip/:limit", async (rek, res) => {
  try {
    var skip = rek.params.skip;
    var limit = rek.params.limit;
    console.log(skip, limit)
    await Story.find().sort({ _id: -1 }).skip(skip).limit(limit).populate({ path: "creater", select: "profile", populate: { path: "profile", select: "avatar" } }).then((result) => {
      if (result.length > 0) {
        res.send(result)
      }
      else {
        res.status(300).send("not found")
      }
    })
  }
  catch (error) {
    console.log(error, "err")
    res.send(error)
  }
})
// app.get("/streamData",async(rek,res)=>{
//   // try{

//   //   console.log("steream")

//   //   await Story.find().sort({_id:-1}).cursor().pipe(JSONStream.stringify()).pipe(res)
//   //    console.log("stream2")
//   // // }
//   // catch(error){
//   //   res.send(error)
//   // }

//   // var stream = await Story.find().sort({_id:-1}).stream();

//   //  stream.on('data', function(data) {
//   //    res.write(JSON.stringify(data));
//   //     });

//   //    stream.on('end', function() {
//   //    res.end();
//   //      })


//   // const cursor = Story.find().stream();
//   // x = new JsonStreamStringify(cursor).pipe(res);
//   // x.on("data", (doc) => {
//   //   res.write(doc);
//   // });


// // const changeStream = Story.watch();

// // while (await changeStream.hasNext()) {
// //     let change = await changeStream.next();
// //     if (change == null) console.log("event doc was null!!");
// //     console.log(change);  
// //     res.write(change)                            // notified change event document
// // } 
// res.set('Content-Type', 'application/json'); // Required?
// res.writeHead(200, { 'Content-Type': 'application/json'}); // Required?

// var stream = Story.find()
//     .sort({_id:-1})
//     .stream()
//     .pipe(JSONStream.stringify())
//     .pipe(res)



// });

// for streams set status to 206 partial data

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage });
const uploadProfile = multer({
  limits: {
    fileSize: 10485760 //in bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Only images allowed'))
    }
    cb(undefined, true)
  }
})




app.post('/addStory', uploadProfile.single("image"), async (rek, res) => {
  console.log("entering stories")
  const heading = rek.body.heading;
  const caption = rek.body.caption;
  const allowComments = Boolean(rek.body.allowComment);
  console.log(allowComments, "allowComments")
  console.log(rek.file, "file")
  var buffer;
  var imagename;
  if (rek.file) {
    console.log("image stories")
    buffer = await sharp(rek.file.buffer).resize({ width: 400, height: 250 }).png().toBuffer()
    imagename = rek.file.filename;
  }
  else {
    console.log("no image stories")
    buffer = null;
    imagename = null;
  }
  id = rek.body.id;
  creatername = rek.body.creatername;
  console.log("id", id)
  console.log("buffer", buffer)
  const story1 = await new Story({
    heading: heading,
    creater: ObjectId(id),
    caption: caption,
    date: Date.now(),

    creatername: creatername,
    allowComments: allowComments,
    imagename: imagename,
    image: {
      data: buffer,
      contentType: 'image/png'
    }                                // assign the _id from the person
  });
  story1.save();
  await Person.updateOne({ _id: id }, { $push: { Posts: story1._id } })
  res.send("saved")
  console.log("after save")

})

// data: fs.readFileSync('uploads/' + rek.file.filename),
app.post('/avatar', uploadProfile.single('avatar'), async (rek, res) => {
  console.log(rek.body.status)
  const cid = rek.body.createrId
  const status = rek.body.status
  Profile.find({ createrId: cid }, async function (err, docs) //find if documents that satisfy the criteria exist
  {
    if (docs.length > 0) //if exists
    {
      if (rek.file) {
        const buffer = await sharp(rek.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        await Profile.updateOne({ createrId: cid }, {
          Status: status,
          avatar: {
            data: buffer,
            ContentType: 'image/png',
          }
        })
        console.log(docs); // print out what it sends back
        res.send("saved")
      }
      else {
        await Profile.updateOne({ createrId: cid }, {
          Status: status,
        })
        console.log(docs); // print out what it sends back
        res.send("saved")
      }


    }
    else // if it does not 
    {
      const newProfile = await new Profile({
        createrId: ObjectId(cid),
        Status: status,
        avatar: {
          data: buffer,
          contentType: 'image/png'

        }
      })
      newProfile.save()
      Person.updateOne({ _id: cid }, { profile: newProfile._id }).exec()
      res.send("saved")
    }
  });


  //   await req.user.save()
  //   res.status(200).send()
  // }, (error, req, res, next) => {
  //   res.status(400).send({error: "Something went wrong"})
})
app.get("/getProfile/:id", async (rek, res) => {
  try {
    const cid = rek.params.id
    Profile.find({ createrId: cid }).then((response) => {
      if (response.length > 0) {
        res.send(response)
      }
      else {
        res.status(404).send("error")
      }
    })

  }
  catch (err) {
    console.log(err)
    res.status(404).send("error")
  }

})

app.put("/likePost/:id/:userId", async (rek, res) => {
  console.log("entering like post")
  id = rek.params.id;
  userId = rek.params.userId;
  console.log("id", id)
  const user = await Story.findOneAndUpdate({ _id: id }, { $addToSet: { likes: userId } })
  const user2 = await Story.findOne({ _id: id }, { likes: 1 })
  console.log("user", user2)
  res.send(user2)


})
app.put("/dislikePost/:id/:userId", async (rek, res) => {
  console.log("entering dislike post")
  id = rek.params.id;
  userId = rek.params.userId;
  console.log("id", id)
  const user = await Story.findOneAndUpdate({ _id: id }, { $pull: { likes: userId } })
  const user2 = await Story.findOne({ _id: id }, { likes: 1 })
  console.log("user", user2)
  res.send(user2)

})

app.get("/addFriends", async (rek, res) => {
  console.log("get friends")
  const user = await Person.find({}, { name: 1 })
  console.log("user", user);
  res.send(user);
})

app.post("/sendRekuest", async (rek, res) => {

  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;

  try {
    // Check if sender and receiver exist in the database
    var sender = await Friends.findOne({ createrId: ObjectId(senderId) });
    var receiver = await Friends.findOne({ createrId: ObjectId(receiverId) });

    if (!sender) {
      console.log("sender not found")
      const newSender = new Friends({
        createrId: senderId,
        rekuestSents: [receiverId],
        friends: [],
        rekuestRecieved: []
      });
      await newSender.save();
      sender = await Friends.findOne({ createrId: senderId });
      await Person.findOneAndUpdate({ _id: senderId }, { friends: sender._id })

    }
    else {
      if (sender.friends.includes(receiverId)) {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (receiver.rekuestSents.includes(receiverId)) {
        return res.status(400).json({ message: 'Already Sent' });
      }
      sender.rekuestSents.addToSet(receiverId);
      await sender.save();
      await Person.findOneAndUpdate({ _id: senderId }, { friends: sender._id })

    }
    if (!receiver) {
      console.log("receiver not found")
      const newReceiver = new Friends({
        createrId: receiverId,
        rekuestSents: [],
        friends: [],
        rekuestRecieved: [senderId]

      });
      await newReceiver.save();
      receiver = await Friends.findOne({ createrId: receiverId });
      await Person.findOneAndUpdate({ _id: receiverId }, { friends: receiver._id })

    }
    else {
      if (receiver.friends.includes(senderId)) {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (receiver.rekuestRecieved.includes(senderId)) {
        return res.status(400).json({ message: 'Already Sent' });
      }
      receiver.rekuestRecieved.addToSet(senderId);
      await receiver.save();
      await Person.findOneAndUpdate({ _id: receiverId }, { friends: receiver._id })


    }


    return res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }

});

app.get("/showRekuests/:userId", async (rek, res) => {

  var userId = rek.params.userId;
  console.log("userId: ", userId);
  const user = await Friends.findOne({ createrId: userId }).populate("rekuestRecieved", "name")
  // console.log("recieved rekuests",user); 
  res.send(user);

})

app.put("/acceptRekuest", async (rek, res) => {
  var receiverId = rek.body.senderId;   //hammad
  var senderId = rek.body.targetId;      //thanos
  // hammad acceepts rekuest of thanos   

  //thanos the sender
  await Friends.findOneAndUpdate({ createrId: senderId }, {
    $pull: { rekuestSents: receiverId },
    $push: { friends: receiverId }
  });

  // hammad the receiver
  await Friends.findOneAndUpdate({ createrId: receiverId }, {
    $pull: { rekuestRecieved: senderId },
    $push: { friends: senderId }
  });


  res.send("done")

})


app.get("/myFriends/:userId", auth, async (rek, res) => {

  try {
    var userId = rek.params.userId;
    console.log("userId: ", userId);
    // res.send(user);
    console.log(typeof userId)
  }
  catch (err) {
    res.send(err)
  }
  try {
    const user = await Friends.findOne({ createrId: userId }, { friends: 1 })
    // console.log("friends", user.friends);
    let friendsId = [];
    user.friends.forEach((friend) => {
      friendsId.push(friend.toString());
    })
    Profile.find({ createrId: { $in: friendsId } }).populate("createrId", "name").select({ "Status": 1, "avatar": 1, "createrId": 1 }).exec((err, docs) => {
      if (err) {
        console.log("err,inside ")
        res.send("error")
      }

      console.log("docs")
      res.send(docs)
    })
  }
  catch (err) {
    console.log("not found")
    res.status(404).send("error2")
  }


})
app.get('/myPosts/:id', auth, async (rek, res) => {
  try {
    id = rek.params.id
    console.log("id: ", id)
    if (id) {
      const user = await Story.find({ creater: id })
      res.send(user)
    }
  }
  catch (error) {
    console.log(error)
    res.status(400).json("ID not found.Your are not authorized")
  }



})

app.delete("/deleteFriend/:userId/:friendId", async (rek, res) => {
  const userId = rek.params.userId;
  const friendId = rek.params.friendId;
  try {
    const user = await Friends.findOne({ createrId: userId })
    const friend = await Friends.findOne({ createrId: friendId })
    user.friends.pull(friendId)
    friend.friends.pull(userId)
    await user.save()
    await friend.save()
    res.status(200).send("done")

  }
  catch (err) {
    console.log(err)
    res.send("error")

  }
})

app.get("/showFriends/:userId", async (rek, res) => {
  try {
    var userId = rek.params.userId;
    // res.send(user);
  }
  catch (err) {
    res.send(err)
  }
  try {
    var count = 0
    let img = [];
    // console.log("hello")
    var userId = rek.params.userId;
    const user = await Friends.findOne({ createrId: userId }, { friends: 1 }).populate("friends", "name")
    //  const profile= await Friends.findOne({createrId:userId},{friends:1}).populate("friends","_id")
    // const profile= await Friends.findOne({createrId:userId},{friends:1}).populate({path:"friends",select:"createrId",populate:{path:"profile",select:"Status"} })

    Friends.findOne({ createrId: userId }, { friends: 1 }).then(async (resp) => {
      if (resp) {
        console.log(resp, "res")
        resp.friends.forEach(async (element) => {
          var img1 = await Profile.findOne({ createrId: element._id }, { avatar: 1 })
          if (img1) {
            img[count] = img1
            img1 = null
            count = count + 1
          }
          if (count == resp.friends.length) {
            console.log("done")
            res.send({ img, user })

          }
        })



      }
    })
    console.log(profile, "profile updated")


  }
  catch (err) {

  }


})


app.get("/showAddFriends/:searche", async (rek, res) => {
  var searche = rek.params.searche;
  console.log("search", searche);

  const user = await Person.find({ name: new RegExp(searche.slice(0, 2), 'i') })
  console.log(user)
  if (user) {
    res.send(user)
  }
  else {
    res.send("no user found")
  }
})


app.get("/getStatus/:id/:friendId", async (rek, res) => {
  var id = rek.params.id
  var fid = rek.params.friendId;
  console.log("insideStatus")
  //  Person.find({_id:id}).populate({path:"friends",select: "friends",populate:{
  //   path: "friends",select:"_id"

  //  }}).then(res=>{

  //     if(res){

  //       console.log("res",res)
  //       res.forEach(element => {
  //        console.log("hello",element.friends)
  //        element.friends.forEach(doc =>{

  //         console.log("hello2",doc)
  //         doc.forEach(d=>{
  //           console.log("hello3",d)
  //         })
  //        }) 
  //       });
  //     }
  //  })
  //  })
  // console.log("user",user)

  const user = await Profile.find({ createrId: fid }, { Status: 1 })
  console.log(user)
  res.send(user)

})


app.post('/send-request', async (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;

  try {
    // Check if sender and receiver exist in the database
    var sender = await Friends.findOne({ createrId: ObjectId(senderId) });
    var receiver = await Friends.findOne({ createrId: ObjectId(receiverId) });

    if (!sender) {
      console.log("sender not found")
      const newSender = new Friends({
        createrId: senderId,
        rekuestSents: [receiverId],
        friends: [],
        rekuestRecieved: []
      });
      await newSender.save();
      sender = await Friends.findOne({ createrId: senderId });
      await Person.findOneAndUpdate({ _id: senderId }, { friends: sender._id })

    }
    else {
      if (sender.friends.includes(receiverId)) {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (receiver.rekuestSents.includes(receiverId)) {
        return res.status(400).json({ message: 'Already Sent' });
      }
      sender.rekuestSents.addToSet(receiverId);
      await sender.save();
      await Person.findOneAndUpdate({ _id: senderId }, { friends: sender._id })

    }
    if (!receiver) {
      console.log("receiver not found")
      const newReceiver = new Friends({
        createrId: receiverId,
        rekuestSents: [],
        friends: [],
        rekuestRecieved: [senderId]

      });
      await newReceiver.save();
      receiver = await Friends.findOne({ createrId: receiverId });
      await Person.findOneAndUpdate({ _id: receiverId }, { friends: receiver._id })

    }
    else {
      if (receiver.friends.includes(senderId)) {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (receiver.rekuestRecieved.includes(senderId)) {
        return res.status(400).json({ message: 'Already Sent' });
      }
      receiver.rekuestRecieved.addToSet(senderId);
      await receiver.save();
      await Person.findOneAndUpdate({ _id: receiverId }, { friends: receiver._id })


    }


    return res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});




app.listen(process.env.PORT || 5000, (rek, res) => {
  console.log("server is up")
})

/* adding then  listening for changes */





// db.friends.aggregate([{ $match: { createrId: ObjectId() } }])


// db.friends.aggregate([{ $match: { createrId: ObjectId("630522ea41980b03a048f5f8") } }, { $lookup: { from: "profiles", localField: "friends", foreignField: "createrId", as: "dosts" } }])