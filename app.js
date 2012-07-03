/*!
 * app.js is the server component of slippery
 *
 */

var Express = require('express');
var Cluster = require('cluster');
var parseCookie = require('./lib/utils').parseCookie;
var sessionStore = new Express.session.MemoryStore();
var numCPUs = require('os').cpus().length;
var PORT = 8080;


/*
 * cluster harder
 */

if (Cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    Cluster.fork();
  }

  Cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.pid + ' died');
    });
} else {

  /*
   * set up the application
   */
  var app = Express.createServer();
  var io = require('socket.io').listen(app);

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
      socket.join(session.username);

      socket.on('broadcast', function(message){
          message.sender = session.username;
          io.sockets.emit('broadcast', message);
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

}
