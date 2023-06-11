const mongoose=require("mongoose")
const UserSchema= new mongoose.Schema({
      name:{
        type:String,
        required:true,
      
      },
      email:{
        type:String,
        required:true,
        unique:true,
      },
      password:{
        type:String,
        require:true
      },
       posts:[
        { 
            heading:{ type:String,
                    },
            caption:{type:String},
             authors:{type:String},
             likes:{type: Number},
            date:{type:Object},
        
             
          
        },
      ],
       
        
       }
   
      
)
 
const Hello=mongoose.model("hulk2",UserSchema);


module.exports = Hello;
