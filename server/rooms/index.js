const Room = require('./room');
const User = require('../models/user');
const FreeRoomModerator = require('../moderators/freeroomModerator')

const rooms = new Map();

function serialize(user) {
  return {
    id: user.id,
    balance: user.balance
  };
}

module.exports = {
  setRooms(io) {
    rooms.set(1, new Room(io, 1, 0, new FreeRoomModerator()))
    // rooms.set(2, new Room(io, 2, 1));
  },

  setConnections(socket) {
    socket.on('getRooms', () => {
      socket.emit('getRooms->res', Array.from(rooms.values())
        .map(room => room.serializeForLobby()));
    });

    socket.on('play', (room_id, token_session) => {
      User.findOne({session_token: token_session}, async (err, user) => {
        if (err) {
          socket.emit('play->res', 500);
          return;
        } else if (!user) {
          socket.emit('play->res', 'INVALID_TOKEN');
          return;
        }
        
        const selectedRoom = rooms.get(room_id);

        if (!selectedRoom) {
          socket.emit('play->res', 'INVALID_ROOM_ID');
          return;
        }

        if (selectedRoom.fee > user.balance) {
          socket.emit('play->res', 'INSUFFICIENT_COINS');
          return;
        }

        user.balance -= selectedRoom.fee
        await user.save()
        selectedRoom.getModerator().addPlayer(socket);
        socket.join(selectedRoom.id);
        socket.current_room = room_id;
        socket.emit('play->res', null);
      });
    });

    socket.on('spawn', function() {
      room = rooms.get(socket.current_room)
      room.spawnPlayer(socket);
    });

    socket.on('dead', function() {
      room = rooms.get(socket.current_room)
      room.killPlayer(socket);
    })

    socket.on('disconnect', function() { 
      if (socket.current_room > 0) {
        room = rooms.get(socket.current_room)
        room.getModerator().removePlayer(socket);
      }
    })
  }
};
