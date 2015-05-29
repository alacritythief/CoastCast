$(document).ready(function() {

  // Checks if string is empty
  String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
  };

  // Initialize Socket.io
  var socket = io();

  // Update Usercount
  socket.on('usercount', function(msg) {
    $('.message-usercount').animate({
      backgroundColor: "#666",
    }, 1000);
    $('.message-usercount').animate({
      backgroundColor: "#000000",
    }, 500);
    $('#usercount').text(msg);
  });

  // Report Updating
  socket.on('new_report', function(report) {
    if (report['bg'] === 'RED') {

      $('#redbg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report['report'] +"</li><li>Reported by: " + report['user'] +"</li><li>Posted: " + report['timestamp'] +"</li></ul></li>");

      $('#redbg li.report-listing:first').animate({
        color: "#fff",
        backgroundColor: "#ee5544",
      }, 1000);

      $('#redbg li.report-listing:first').animate({
        color: "#000",
        backgroundColor: "none",
      }, 500);

      if ($('#redbg li.report-listing').length > 10) {
        $('#redbg li.report-listing:last').remove();
      };

    } else if (report['bg'] === 'GREEN') {

      $('#greenbg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report['report'] +"</li><li>Reported by: " + report['user'] +"</li><li>Posted: " + report['timestamp'] +"</li></ul></li>");

      $('#greenbg li.report-listing:first').animate({
        color: "#fff",
        backgroundColor: "#66aa88",
      }, 1000);

      $('#greenbg li.report-listing:first').animate({
        color: "#000",
        backgroundColor: "none",
      }, 500);

      if ($('#greenbg li.report-listing').length > 10) {
        $('#greenbg li.report-listing:last').remove();
      };

    } else if (report['bg'] === 'BLUE') {

      $('#bluebg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report['report'] +"</li><li>Reported by: " + report['user'] +"</li><li>Posted: " + report['timestamp'] +"</li></ul></li>");

      $('#bluebg li.report-listing:first').animate({
        color: "#fff",
        backgroundColor: "#4477dd",
      }, 1000);

      $('#bluebg li.report-listing:first').animate({
        color: "#000",
        backgroundColor: "none",
      }, 500);

      if ($('#bluebg li.report-listing').length > 10) {
        $('#bluebg li.report-listing:last').remove();
      };

    } else if (report['bg'] === 'EBG') {

      $('#ebg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report['report'] +"</li><li>Reported by: " + report['user'] +"</li><li>Posted: " + report['timestamp'] +"</li></ul></li>");

      $('#ebg li.report-listing:first').animate({
        color: "#fff",
        backgroundColor: "#330022",
      }, 1000);

      $('#ebg li.report-listing:first').animate({
        color: "#000",
        backgroundColor: "none",
      }, 500);

      if ($('#ebg li.report-listing').length > 10) {
        $('#ebg li.report-listing:last').remove();
      };
    };

  });

  // Report Submission & Validation
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

    // Validate Report
    if (!reportValues['user'].isEmpty() && !reportValues['bg'].isEmpty() && !reportValues['report'].isEmpty()) {

      console.log('good report');
      console.log(reportValues);
      socket.emit('send_report', reportValues);
      $(this).closest('form').find("input[type=text], textarea").val("");
      return false;

    } else {

      console.log("bad report");
      console.log(reportValues);
      $(this).closest('form').find("input[type=text], textarea").val("");
      return false;

    };

  });


});
