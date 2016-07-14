// Import the express module
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var cookie = require('cookie');

//Username variable
var currentUser;

//Sort tasklist function
function compare(a,b)
{
  	return b.priority - a.priority;
}

/*
//Get url variable function
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
*/

app.disable('x-powered-by');

//Handlebars Setup
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Parse Encoded Data
app.use(require('body-parser').urlencoded({extended: true}));

//For cookies
var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));

// Defines the port to run on
app.set('port', process.env.PORT || 3000);

// Something about a resource directory
app.use(express.static(__dirname + '/public'));

// Home view
app.get('/home', function(req, res){

	var active = 0;

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function (err, db) {
	if (err) 
	{
		console.log('Unable to connect to the Server', err);
	} 
	else
	{
		// We are connected
		console.log('Connection established to', url);

		// Get the documents collection
		var collection = db.collection('User');

		// Find user
		collection.findOne({email: currentUser}, function (err, result) {
			if (err) 
			{
				res.send(err);
			}
			else if (result) 
			{
				result.task.sort(compare);

				result.task.forEach( function (obj)
				{
				    if(obj.done==false)
						active++;
				});


				collection.update({email:currentUser}, {$set: {task:result.task}}, function (err, result1){
				if (err)
				{
					console.log(err);
				} 
				else 
				{
					console.log("stuff updated");

					var arrayLength = result.task.length;
					for (var i = 0; i < arrayLength; i++)
					{
					    if(result.task[i].done==false)
				    	{
							result.task[i].check=true;
							break;
				    	}
					}
				
					res.render('Home',{
						// Pass the returned database documents to HBS
						"tasklist" : result,
						"active" : active
					});
				}
				//Close connection
				db.close();
				});
			}
			else
			{
				res.render('/login');
			}
		});
	}
	});
});

app.get('/', function(req,res){
	res.render('LogIn');

});

// Terminal calls going to a Url
app.use(function(req, res, next){
	console.log('Navigating to URL : ' + req.url);
	next();
});

// Catch and print error
app.use(function(err, req, res, next){
	console.log('Error : ' + err.message);
	next();
});

app.post('/checkLogIn', function(req, res){

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function (err, db) {
		if (err) 
		{
			console.log('Unable to connect to the Server', err);
		} 

		else
		{
			// We are connected
			console.log('Connection established to', url);

			// Get the documents collection
			var collection = db.collection('User');

			//Get Login info
			var formData = {email: req.body.email, passWord: req.body.pwd};

			// Find all users
			collection.find({"email": formData.email, "passWord": formData.passWord}).toArray(function (err, result) {
				if (err)
				{
					res.send(err);
				}

				else if (result.length) 
				{
					console.log('yes result');
					currentUser = formData.email;
					res.cookie('currentUsers', {expire :new Date()+9999});
					res.redirect("/home");
				}

				else
				{
					console.log('no result');
					console.log(formData.email);
					console.log(formData.passWord);
					res.render('LogIn',{

					// Pass the error message flag to the LogIn page
					"wrongLogin" : true
				});
					
				}
				//Close connection
				db.close();
			});
		}
	});
});

app.post('/addaccount', function(req, res){

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log('Unable to connect to the Server:', err);
		} else {
			console.log('Connected to Server');

			// Get the documents collection
			var collection = db.collection('User');

			// Get the user data passed from the form
			var user1 = {firstName: req.body.firstName, passWord: req.body.pwd,
				email: req.body.email, task: []};

			// Insert the student data into the database
			collection.insert([user1], function (err, result){
				if (err) {
					console.log(err);
				} else {

					// Redirect to the updated student list
					res.redirect("/LogIn");
				}

				// Close the database
				db.close();
			});

		}
	});

});

app.post('/posttask', function(req, res){

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function(err, db){
		if (err) {
			console.log('Unable to connect to the Server:', err);
		} else {
			console.log('Connected to Server');

			// Get the documents collection
			var collection = db.collection('User');

			// Get the user data passed from the form
			var task1 = {text: req.body.tasktext, priority: req.body.imp, done:false};

			// Insert the student data into the database
			collection.update({email:currentUser}, {$push: {task: task1}}, function (err, result){
				if (err) {
					console.log(err);
				} else {

					// Redirect to the updated student list
					res.redirect("/list");
				}

				// Close the database
				db.close();
			});

		}
	});

});

app.get('/doneTask', function(req, res){

	var taski = req.param('taski');
	var ident = "task." + String(taski) + ".done";

	console.log(ident);

	var query = {};
	query[ident]=true;

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function(err, db){
		if (err) 
		{
			console.log('Unable to connect to the Server:', err);
		}
		else
		{
			console.log('Connected to Server');

			// Get the documents collection
			var collection = db.collection('User');

			collection.update({email:currentUser}, {$set : query}, function (err, result){
				if (err)
				{
					console.log(err);
				}
				else
				{
					// Redirect to the updated student list
					res.redirect("/list");
				}

				// Close the database
				db.close();
			});

		}
	});

});

// Link to list
app.get('/list', function(req, res){

	if(req.cookies.currentUsers){

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function (err, db) {
	if (err) 
	{
		console.log('Unable to connect to the Server', err);
	} 
	else
	{
		// We are connected
		console.log('Connection established to', url);

		// Get the documents collection
		var collection = db.collection('User');

		// Find user
		collection.findOne({email: currentUser}, function (err, result) {
			if (err) 
			{
				res.send(err);
			}
			else if (result) 
			{
				result.task.sort(compare);

				collection.update({email:currentUser}, {$set: {task:result.task}}, function (err, result1){
				if (err)
				{
					console.log(err);
				} 
				else 
				{
					console.log("stuff updated");
					res.render('List',{
						// Pass the returned database documents to HBS
						"tasklist" : result
					});
				}
				//Close connection
				db.close();
				});
			}
		
		});
	}
	});
}
			else 
				res.redirect('/LogIn');

});

// Link to progress
app.get('/progress', function(req, res){
	if(req.cookies.currentUsers){

	//Progress Vars
	var active = 0;
	var completed = 0;
	var imp3 = 0;
	var imp2 = 0;
	var imp1 = 0;

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function (err, db) {
	if (err) 
	{
		console.log('Unable to connect to the Server', err);
	} 
	else
	{
		// We are connected
		console.log('Connection established to', url);

		// Get the documents collection
		var collection = db.collection('User');

		// Find user
		collection.findOne({email: currentUser}, function (err, result) {
			if (err) 
			{
				res.send(err);
			}
			else if (result) 
			{

				result.task.forEach( function (obj)
				{
				    if(obj.done==false)
						active++;
					else if(obj.done==true)
						completed++;

					if(obj.priority==2)
						imp3++;
					else if(obj.priority==1)
						imp2++;
					else if(obj.priority==0)
						imp1++;
				});

				res.render('Progress',{
					// Pass the returned database documents to HBS
					"active": active,
					"completed": completed,
					"imp3": imp3,
					"imp2": imp2,
					"imp1": imp1
				});
			}
			db.close();
		});
	}
	});
  }
  			else
				res.redirect('/LogIn');
});

// Link to Create Account
app.get('/createaccount', function(req, res){
	res.render('CreateAccount');
});

// Link to Login
app.get('/login', function(req, res){
	res.render('LogIn');
});


//Link to Add Task 
app.get('/addtask', function(req, res){
	if(req.cookies.currentUsers)
		res.render('AddTask')
	else
		res.redirect('/');

});


app.get('/deletecookie', function(req, res){

	res.clearCookie('currentUsers');
	res.redirect('/login');
});

app.get('/listcookies', function(req, res){
	console.log("Cookies : ", req.cookies);
	res.send('Look in console for cookies');
});

app.get('/completedtasks',function(req, res){
	if(req.cookies.currentUsers){

	// Get a Mongo client to work with the Mongo server
	var MongoClient = mongodb.MongoClient;

	// Define where the MongoDB server is
	var url = 'mongodb://localhost:27017/myDB';

	// Connect to the server
	MongoClient.connect(url, function (err, db) {
	if (err) 
	{
		console.log('Unable to connect to the Server', err);
	} 
	else
	{
		// We are connected
		console.log('Connection established to', url);

		// Get the documents collection
		var collection = db.collection('User');

		// Find user
		collection.findOne({email: currentUser}, function (err, result) {
			if (err) 
			{
				res.send(err);
			}
			else if (result) 
			{
				result.task.sort(compare);
					console.log("stuff updated");
					res.render('CompletedTasks',{
						// Pass the returned database documents to HBS
						"tasklist" : result
					});
			}
				//Close connection
				db.close();
		
		});
	}
	});
}
});
// Defines a custom 404 Page and we use app.use because
// the request didn't match a route (Must follow the routes)
app.use(function(req, res) {
	// Define the content type
	res.type('text/html');

	// The default status is 200
	res.status(404);

	// Point at the 404.handlebars view
	res.render('404');
});

// Custom 500 Page
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);

	// Point at the 500.handlebars view
	res.render('500');
});

//Start Message
app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate');
});
