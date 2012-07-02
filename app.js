/*!
 * app.js is the server component of slippery
 *
 */

var Express = require('express');

var PORT = 8080;

/*
 * set up the application
 */
var app = module.exports = Express.createServer();
var io = require('socket.io').listen(app);

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(Express.cookieParser());
    app.use(Express.session( {secret: "mySecret"} ));
    app.use(app.router);
    app.use(Express['static'](__dirname + '/public'));
});

io.sockets.on('connection', function(socket) {
    socket.on('join', function(username) {
        socket.broadcast.emit('new_user', username);
        socket.join(username);
    });

    socket.on('broadcast', function(message){
        io.sockets.emit('broadcast', message);
    });

    socket.on('whisper', function(message){
        io.sockets.in(message.reciever).emit('whisper', message);
    });
});


app.get('/', function(req, res, next) {
    res.render('chat');
});


app.listen(PORT, function () {
    console.log('Server listening on port: http://localhost:' + PORT);
  });
