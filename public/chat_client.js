$(function(){
    var socket;
    var username;

    console.log('START');

    function isPrivateMessage(text) {
      return text.split(' ')[0] === '/msg';
    }

    function sendText() {
      var message2send = $("#input").val();
      if(isPrivateMessage(message2send)){
        var text = message2send.split(' ');
        socket.emit('whisper', {sender: username, reciever: text[1], text: text[2]});
      }
      else{
        socket.emit('broadcast', {sender: username, text: message2send});
      }
      $("#input").val('');
    }

    function appendToTextarea(text) {
      var chatlog = $("#chatlog").val() + text + '\n';
      $("#chatlog").val(chatlog);
    }


    $("#connect").click(function(){
        socket = io.connect('http://localhost');
        username = $("#username").val();

        socket.on('connect', function(data) {
            socket.emit('join', username);
        });

        socket.on('new_user', function(username) {
            appendToTextarea('Say Hello to ' + username);
        });

        socket.on('broadcast', function(message) {
            appendToTextarea(message.sender + ': ' + message.text);
        });

        socket.on('whisper', function(message) {
            appendToTextarea(message.sender + ' whispers: ' + message.text);
        });

      });

    $("#send").click(function(){
        sendText();
      })

    $(document).keydown(function (e) {
        if (/^(input|textarea)$/i.test(e.target.nodeName) || e.target.isContentEditable) {
          if (e.keyCode === 13) {
            sendText()
          }
          return;
        }
      });

  });
