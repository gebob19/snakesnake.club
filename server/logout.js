const user = require('./user')

module.exports = {

  set : function (socket) {
    socket.on('logout', function(session_token) {
      // remove the session_token
      User.updateOne(
        {session_token}, 
        {$set : {"session_token" : null}}, function (err, result) {
          console.log(result);
          if (err) socket.emit('logout->res', 500);
          else if (!result) socket.emit('logout->res', 'INVALID_TOKEN');
          socket.emit('logout->res', false);
        })
      })
  }

}