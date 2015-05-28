$(document).ready(function() {

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

  $('#report-form').submit(function() {
    var reportValues = {};
    $.each($('#report-form').serializeArray(), function(_, kv) {
      if (reportValues.hasOwnProperty(kv.name)) {
        reportValues[kv.name] = $.makeArray(reportValues[kv.name]);
        reportValues[kv.name].push(kv.value);
      }
      else {
        reportValues[kv.name] = kv.value;
      }
    });
    console.log(reportValues);
    socket.emit('send_report', reportValues);
    return false;
  });


});
