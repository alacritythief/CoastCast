var socket = io();
socket.on('usercount', function(msg) {
  $('.message-usercount').animate({
    backgroundColor: "#666",
  }, 1000);
  $('.message-usercount').animate({
    backgroundColor: "#000000",
  }, 500);
  $('#usercount').text(msg);
});
