


$(document).ready(function(){
	var socket=io();
	
	$('#submit').click(function(){
		var user_name=document.getElementById('user_name').value;
		var email=document.getElementById('email').value;
		var password=document.getElementById('password').value;
		var confirm_password=document.getElementById('confirm_password').value;
		
		//alert(user_name + " " +email + " " +password + " " +confirm_password);
		if(user_name!="" && email!="" && password!="" && confirm_password!="")
		{
			//alert("okay");
			if(confirm_password==password)
			{
				var check_email=filter_email(email);
				
				if(check_email!=1)
				{
				var packet={user_name:user_name,email:email,password:password};
				packet=JSON.stringify(packet);
				socket.emit("submit_form_data",packet);
				}
				else
				{
					alert("Invalid email!");
				}
				
				
			}
			else
			{
				alert("Both the passwords must be same!");
			}
		}
        else
        {
			alert("All fields are mandatory!");
		}			
	});
	
	
  function filter_email(email)
  {
  
	if(email.indexOf("@")!=-1)
	{
	    return 0;   //Correct email format
	}
	else
	{
	  return 1;     // incorrect email format
	}
  }
  
  socket.on("user_already_exsist",function()
  {
	  alert("Email already Registered! Try new email.");
  });
	
  socket.on("success",function(data){
	  var user_id=data.user_id;
	  document.cookie="user=" +user_id;   // setting session cookie
	  alert("Successfully registered!");
	  window.location.assign("/home");
	  
  })	
	
});