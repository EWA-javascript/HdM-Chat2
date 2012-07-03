$(function(){
    var socket = io.connect('http://localhost');

    socket.on('new_user', function(username) {
        appendToTextarea('Say Hello to ' + username);
      });

    socket.on('broadcast', function(message) {
        appendToTextarea(message.sender + ': ' + message.text);
      });

    socket.on('whisper', function(message) {
        appendToTextarea(message.sender + ' whispers: ' + message.text);
      });


    function isPrivateMessage(text) {
      return text.split(' ')[0] === '/msg';
    }

    function sendText() {
      var message2send = $("#input").val();
      console.log(message2send);
      if(isPrivateMessage(message2send)){
        console.log("private message");
        var text = message2send.split(' ');
        socket.emit('whisper', {reciever: text[1], text: text[2]});
      }
      else{
        socket.emit('broadcast', {text: message2send});
      }
      $("#input").val('');
    }

    function appendToTextarea(text) {
      var chatlog = $("#chatlog").val() + text + '\n';
      $("#chatlog").val(chatlog);
    }

    $("#send").click(function(){
        sendText();
      })

    $(document).keydown(function (e) {
        if (/^(input|textarea)$/i.test(e.target.nodeName) || e.target.isContentEditable) {
          if (e.keyCode === 13) {
            sendText();
          }
          return;
        }
      });

  });
