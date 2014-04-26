var port = 5000;
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql')

console.log("Listening on port " + port);
server.listen(port);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/vraag.html');
});
app.get('/vraag.html', function (req, res) {
  res.sendfile(__dirname + '/vraag.html');
});
app.get('/lijst.html', function (req, res) {
  res.sendfile(__dirname + '/lijst.html');
});
app.get('/moderate.html', function (req, res) {
  res.sendfile(__dirname + '/mod.html');
});

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'nodejs',
  debug : true,
})
connection.connect(function(err) {
    if ( !err ) {
        console.log("Connected to MySQL");
    } else if ( err ) {
        console.log(err);
    }
});



 




io.sockets.on('connection', function (socket)
{
	
	socket.on('sendchat', function (message, username) 
	{
	
		connection.query('INSERT INTO questions (name, question,visible,likes,postdate) VALUES (? , ? , 1, 0,NOW());' , [username, message]); 
		connection.query('SELECT * from questions WHERE visible = 1 AND DATE(postdate) = DATE(NOW()) order by likes desc;', function(err, results)
		{

			if (err) throw err;
			var output = '<ul>';
			for (var index in results) 
			{
			
				output += '<li class="upvote" data-id='+ results[index].id +'><div class="name"><p>' + results[index].name + '</p></div><div class="question">' + results[index].question +  '</div><div class="likes" data-id='+results[index].id+ '><p>' + results[index].likes + '</p></div></li>';
			
			}
			
			output += '</ul>';
			io.sockets.emit('updatechat', output);
			
		});
		
	});
	
	
	socket.on('upthevote',function(id)
	{
	
		connection.query('UPDATE questions SET likes = likes + 1 WHERE id = ?;', [id]);
		connection.query('SELECT * from questions WHERE visible = 1 AND DATE(postdate) = DATE(NOW()) order by likes desc;', function(err, results)
		{
			
				if (err) throw err;
				var output = '<ul>';
				for (var index in results) 
				{
				
					output += '<li class="upvote" data-id='+ results[index].id +'><div class="name"><p>' + results[index].name + '</p></div><div class="question">' + results[index].question +  '</div><div class="likes" data-id='+results[index].id+ '><p>' + results[index].likes + '</p></div></li>';
			
				}
				
				output += '</ul>';
				io.sockets.emit('updatelikes',output);
			
		});
		
	});
	
	socket.on('modabuse',function(pass,input)
	{
		if(pass=="admin")
		{

			connection.query('UPDATE questions SET visible = 0 WHERE id = ?;', [input]);
			io.sockets.emit('remove',input);
			
		}
		else
		{
		
			io.sockets.emit('fail');
		
		}
	
	});
	
	


});
