const onConnection = (socket) => {
  console.log(`OrgTracks Socket: User connected (${socket.user._id})`);
  socket.join(socket.user._id.toString());
};

module.exports = onConnection;
