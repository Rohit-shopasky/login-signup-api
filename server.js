var express=require("express");
var app=express();
var http=require("http").Server(app);
var io=require("socket.io")(http);
var mongoose = require('mongoose');
app.use("/js",express.static("js"));

console.log("Server running on port 3000. Please type http://localhost:3000/ on url");

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


var crypto = require('crypto');
algorithm = 'aes-256-ctr',    //
    password = 'rohit';           // Password encryption module attached

mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    //console.log("Connection Successful!");
});
 
 var time= Date();
 var userSchema = mongoose.Schema({
      user_name: String,
      email: String,
      password: String,
	  created_date:String
    });
	
	var user= mongoose.model('user', userSchema, 'user_info');

  function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  try{
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
  }
  catch(ex){
	  console.log('text encrypt nahi hua trying it again');
            encrypt(text);
  }
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  try{
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
  }
  catch(ex){
	  console.log('text decrypt nahi hua trying it again..');
            decrypt(text);
  }
}  


app.get("/login",function(req,res){
	res.sendFile("login.html",{root:'./'});
})

app.get("/",function(req,res){
	res.sendFile("index.html",{root:'./'});
});

app.get("/home",function(req,res){
	res.sendFile("home.html",{root:'./'});
});

io.on("connection",function(socket){
	socket.on("submit_form_data",function(packet){
	 //console.log(packet);
	 packet=JSON.parse(packet);
	 var user_name=packet.user_name;
	 var email=packet.email;
	 var password=encrypt(packet.password);
	 
	   user.find({
       'email': email
       }, 
	   function (err, result) {
             if(result.length==0)
			 {
				 // okay insert 
				  var user1 = new user({ user_name:user_name, email:email,password:password,created_date:time });
 
                  // save model to database
                  user1.save(function (err, res) {
                  if (err) return console.error(err);
                  console.log(user1.user_name + " saved to user_info collection.");
				  var user_id=res._id;
				  socket.emit("success",{user_id:user_id});
				  
                 });
				 
			 }
			 else
			 {
				 // user already exsist
				 console.log("User already exsist");
				 socket.emit("user_already_exsist",{})
			 }
       });
	 
	 
	});
	
	
	socket.on("get_details",function(data){
		var user_id=data.user_id;
		user.find({ '_id':user_id }, function (err, person) {
       if (err) return handleError(err);
        
		 var password=decrypt(person[0].password);
		  var details={user_name:person[0].user_name,email:person[0].email,password:password,created_date:person[0].created_date};
		  socket.emit("details_of_user",details);
         
        });
	});
	
	socket.on("user_login",function(packet){
		var packet=JSON.parse(packet);
		var email=packet.email;
	   var password=encrypt(packet.password);
		 user.find({ $and:[{email:email},{password:password}]}, function (err, person) {
     if (err) return handleError(err);
  // Prints "Space Ghost is a talk show host".
       if(person.length==0)
	   {
		   socket.emit("error_login",{});
		   console.log("Username or password incorrect!")
	   }
	   else
	   {
		   var user_id=person[0]._id;
		   socket.emit("success_login",{user_id:user_id});
		   console.log("Sucessfuly login!");
	   }
    });
	});
	
});



http.listen(3000);
// server is runs on port 3000