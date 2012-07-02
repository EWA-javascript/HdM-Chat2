$(function(){
    var ws;
    var username;

    console.log('START');

    function sendText() {
      var message2send = username + ": " + $("#input").val();
      ws.send(message2send);
      $("#input").val('');
    }

    $("#connect").click(function(){
        ws = new WebSocket("ws:localhost:8080");
        username = $("#username").val();

        ws.onopen = function(){
          console.log("Connected as " + username);
          /*TODO: Connect to the Server*/
          ws.send("Say Hello to " + username);
        };

        ws.onmessage = function(message){
          console.log("Got message: " + message.data);
          var chatlog = $("#chatlog").val() + message.data + '\n';
          $("#chatlog").val(chatlog);
        };
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
