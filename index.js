const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
var ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt");
const sharp = require('sharp')
const { signup, login } = require("./users-controllers")
const multer = require("multer");
const Hello = require("./module");
const Person = require("./models");
const Story = require("./modelsStory");
const Friends = require("./modelsFriends");
const Profile = require("./ProfileModel");
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
// console.log("env", process.env.MONGODB_URL)
mongoose.connect("mongodb+srv://Hulk:Hulk%401322@cluster0.cmdv1.mongodb.net/hulk2?retryWrites=true&w=majority").then((err, res) => console.log(err));

app.use(cookieParser());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});


app.get('/myPosts/:id', async (rek, res) => {
  try {
    id = rek.params.id
    console.log("id: ", id)
    if (id) {
      const user = await Story.find({ creater: id })
      res.status(202).send(user)


    }
  }
  catch (error) {
    res.status(400).json("ID not found.Your are not authorized")
  }





})

app.delete("/deletePost/:id/:userid", async (rek, res) => {
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
    // await Story.find().sort({ _id: -1 }).skip(skip).limit(limit).then((result) => {
    //   if (result.length > 0) {
    //     res.send(result)
    //   }
    //   else {
    //     res.status(300).send("not found")
    //   }
    // })
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
  heading = rek.body.heading;
  caption = rek.body.caption;
  const buffer = await sharp(rek.file.buffer).resize({ width: 400, height: 250 }).png().toBuffer()
  id = rek.body.id;
  creatername = rek.body.creatername;
  console.log("id", id)
  const story1 = await new Story({
    heading: heading,
    creater: ObjectId(id),
    caption: caption,
    date: Date.now(),

    creatername: creatername,
    imagename: rek.file.filename,
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
  console.log("he")
  const buffer = await sharp(rek.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  console.log(buffer)
  console.log(rek.body.status)
  const cid = rek.body.createrId
  const status = rek.body.status
  Profile.find({ createrId: cid }, async function (err, docs) //find if documents that satisfy the criteria exist
  {
    if (docs.length > 0) //if exists
    {

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
      console.log("Not in docs");
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
        console.log("hello")
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

  senderId = rek.body.senderId;
  targetId = rek.body.targetId;
  // Friends.updateOne({createrId: senderId},{
  //   createrId:senderId,
  //   $push:{rekuestSents:targetId},
  // },
  // {upsert: true}) 
  Friends.findOne({}, { createrId: senderId }, async (err, friend) => {

    if (friend) {
      console.log(" inside friend", friend);
      await Friends.updateOne({ createrId: senderId }, { $push: { rekuestSents: targetId } })



      var frien = await Friends.findOne({ createrId: targetId }).clone().catch(function (err) { console.log(err) })

      if (frien) {
        console.log("friend", friend);
        await Friends.updateOne({ createrId: targetId }, { $push: { rekuestRecieved: senderId } })
        console.log("hello")

      }
      else {
        console.log("inside else else")
        const friends = new Friends({
          createrId: ObjectId(targetId),
          rekuestRecieved: [senderId]
        })
        await friends.save();

        var frie = await Friends.findOne({ createrId: targetId })

        console.log("fri ", frie._id)
        ///storing in person friends
        await Person.findOneAndUpdate({ _id: targetId }, { friends: frie._id })


      }




      //      Friends.findOne({},{createrId:targetId},async(err,friends)=>{
      //       if(friends){
      //         console.log("checking receiver exists",friend);
      //         await Friends.updateOne({createrId:targetId},{$push:{rekuestRecieved:senderId}} )
      //         console.log("hell")


      //       }
      //       else{
      //         console.log("inside else else receiver does not exist")
      //         const friends= await new Friends({
      //          createrId:ObjectId(targetId),
      //          rekuestRecieved:[senderId]
      //         })
      //        await friends.save();



      //       }

      //  })

      console.log("hello")


    }
    else {
      //first entry in friends
      console.log("inside else")
      const friends = new Friends({
        createrId: ObjectId(senderId),
        rekuestSents: [targetId]
      })
      await friends.save();

      // finding new documnet id in freinds
      var fri = await Friends.findOne({ createrId: senderId }).clone().catch(function (err) { console.log(err) })

      console.log("fri ", fri._id)
      ///storing in person friends
      await Person.findOneAndUpdate({ _id: senderId }, { friends: fri._id }).clone().catch(function (err) { console.log(err) })

      var frien = await Friends.findOne({ createrId: targetId }).clone().catch(function (err) { console.log(err) })

      if (frien) {
        console.log("friend", friend);
        await Friends.updateOne({ createrId: targetId }, { $push: { rekuestRecieved: senderId } })
        console.log("hello")

      }
      else {
        console.log("inside else else")
        const friends = new Friends({
          createrId: ObjectId(targetId),
          rekuestRecieved: [senderId]
        })
        await friends.save();

        var frie = await Friends.findOne({ createrId: targetId })

        console.log("fri ", frie._id)
        ///storing in person friends
        await Person.findOneAndUpdate({ _id: targetId }, { friends: frie._id })


      }


      //   Person.findOneAndUpdate({_id:senderId},{friends:})

      //  Friends.findOne({},{createrId:targetId},async(err,friends)=>{
      //       if(friends){
      //         console.log("friend",friend);
      //         await Friends.updateOne({createrId:targetId},{$push:{rekuestRecieved:senderId}} )
      //         console.log("hello")


      //       }
      //       else{
      //         console.log("inside else else")
      //         const friends=  new Friends({
      //          createrId:ObjectId(targetId),
      //          rekuestRecieved:[senderId]
      //         })
      //        await friends.save();

      //         var frie= await Friends.findOne({createrId:targetId})

      //         console.log("fri ", frie._id)
      //           ///storing in person friends
      //         await Person.findOneAndUpdate({_id:targetId},{friends:frie._id})


      //       }

      //  }).clone().catch(function(err){ console.log(err)})

    }
  })
  console.log("frienssd");
  console.log("Updating", senderId, targetId);

  res.send("hello")


})



app.get("/showRekuests/:userId", async (rek, res) => {

  var userId = rek.params.userId;
  console.log("userId: ", userId);
  const user = await Friends.findOne({ createrId: userId }).populate("rekuestRecieved", "name")
  // console.log("recieved rekuests",user); 
  res.send(user);

})

app.put("/acceptRekuest", async (rek, res) => {
  var userId = rek.body.senderId;
  var senId = rek.body.targetId;
  // settings in user
  await Friends.findOneAndUpdate({ createrId: userId }, {
    $pull: { rekuestRecieved: senId },
    $push: { friends: senId }
  });

  // setting in rekuest sender                              
  await Friends.findOneAndUpdate({ createrId: senId }, {
    $pull: { rekuestSents: userId },
    $push: { friends: userId }
  });


  res.send("done")

})


app.get("/myFriends/:userId", async (rek, res) => {

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
    res.send("error2")
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


    profile.friends.forEach(async (element) => {
      console.log(element._id, "img")
      var img1 = await Profile.findOne({ createrId: element }, { avatar: 1 })
      console.log(img1._id, "avatar")
      if (img1) {
        img[count] = img1
        img1 = null
        // console.log(img,"img1")
        count = count + 1;
        console.log(count, "count")
      }
      console.log(count, "count1")

    });
    console.log(count, "count2")
    console.log("ppp", profile.friends.length)
    console.log("psda", count)
    if (profile.length) {



      if (count == profile.friends.length) {
        console.log("hello11")
        console.log(img, "hello")
      }
    }

    // const img=await Profile.findMany({_id:profile._id})


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




app.listen(process.env.PORT || 5000, (rek, res) => {
  console.log("server is up")
})

/* adding then  listening for changes */





