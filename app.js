/*!
 * app.js is the server component of slippery
 *
 */

var Express = require('express');
var parseCookie = require('./lib/utils').parseCookie;
var sessionStore = new Express.session.MemoryStore();
var redis = require("redis");
var PORT = 8080;

/*
 * set up the application
 */
var app = module.exports = Express.createServer();
var io = require('socket.io').listen(app);
var rclient = redis.createClient();


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(Express.bodyParser());
    app.use(Express.cookieParser());
    app.use(Express.session( {store: sessionStore, secret: "mySecret"} ));
    app.use(app.router);
    app.use(Express['static'](__dirname + '/public'));
});



io.sockets.on('connection', function(socket) {
    var session = socket.handshake.session;
    socket.broadcast.emit('new_user', session.username);
    
    var history = [];
    
    rclient.llen("messages", function(err, history_len){
	    console.log("history: " + history_len);
	    rclient.lrange("messages", 0, history_len, function(err, rhistory){
		    //socket.broadcast(rhistory);
		    //console.log(rhistory);
		    //history = JSON.parse(rhistory);
		    rhistory.forEach(function(message, i){
				io.sockets.emit('broadcast', JSON.parse(message));
		    })

	    })
	    
    });
    
    
    socket.join(session.username);

    socket.on('broadcast', function(message){
        message.sender = session.username;
        io.sockets.emit('broadcast', message);
        //TODO: Write to redis
        rclient.rpush("messages", JSON.stringify(message));
        
    });

    socket.on('whisper', function(message){
        message.sender = session.username;
        io.sockets.in(message.reciever).emit('whisper', message);
    });
});

io.set('authorization', function (handshake, accept) {
    handshake.cookie = parseCookie(handshake.headers.cookie);
    handshake.sessionID = handshake.cookie['connect.sid'];
    sessionStore.get(handshake.sessionID, function (err, session) {
      if (err || !session) {
        accept('Error', false);
      } else {
        handshake.session = session;
        accept(null, true);
      }
    });
});

auth = function(req, res, next) {
  if (req.session.username != null) {
    next();
  } else {
    res.redirect('/auth');
  }
};

app.get('/', auth, function(req, res, next) {
    res.render('chat');
});

app.get('/auth', function(req, res, next) {
    res.render('auth');
});

app.post('/auth', function(req, res, next) {
    req.session.username = req.body.username;
    res.redirect('/');
});


app.listen(PORT, function () {
    console.log('Server listening on port: http://localhost:' + PORT);
  });
