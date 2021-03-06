var User = require('../models/user');

module.exports = class StatTracker {

  constructor() {
    this.trackingPlayers = new Map();
  }

  increaseTakedowns(userID, socket) {
    if (this.trackingPlayers.has(userID)) {
      var takedownCount = this.trackingPlayers.get(userID);
    } else {
      var takedownCount = 0;
    }
    this.trackingPlayers.set(userID, takedownCount+1);
    socket.emit('takedown');
  }

  async updateTakedowns(userID) {
    if (this.trackingPlayers.has(userID)) {  
      var user = await User.findOne({_id : userID})
        .catch(err => {
          console.log(err);
          return;
        });
      var newTakedowns = this.trackingPlayers.get(userID);
      this.trackingPlayers.delete(userID);
      user.takedowns += newTakedowns;
      await user.save();
    }
  }

}
