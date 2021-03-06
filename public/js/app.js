$(document).ready(function() {

  // Checks if string is empty
  String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
  };

  // Initialize Socket.io
  var socket = io();

  // Alters Logo based on Window Size:
  $(window).resize(function() {
    if ($(window).innerWidth() < 550 ) {
      $("#logo").text("CC");
    } else {
      $("#logo").text("CoastCast");
    }
  }).resize();

  if (window.screen.width < 550 ) {
    $("#logo").text("CC");
  } else {
    $("#logo").text("CoastCast");
  }

  // Update Usercount
  socket.on('usercount', function(msg) {
    $('#usercount').text(msg);
  });

  // Report Updating
  socket.on('new_report', function(report) {
    if (report.bg === 'RED') {

      $('#redbg')
        .prepend("<li class='report-listing'><ul><li class='report-text'>" + report.report +"</li><li>Reported by: " + report.user +"</li><li>Posted: " + report.timestamp +"</li></ul></li>");
      $('#redbg li.report-listing:first')
        .animate({
          backgroundColor: "#ee5544",
        }, 1000);
      $('#redbg li.report-listing:first')
        .animate({
          backgroundColor: "none",
        }, 30000);

      if ($('#redbg li.report-listing').length > 10) {
        $('#redbg li.report-listing:last').remove();
      }

    } else if (report.bg === 'GREEN') {

      $('#greenbg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report.report +"</li><li>Reported by: " + report.user +"</li><li>Posted: " + report.timestamp +"</li></ul></li>");
      $('#greenbg li.report-listing:first')
        .animate({
          backgroundColor: "#66aa88",
        }, 1000);
      $('#greenbg li.report-listing:first')
        .animate({
          backgroundColor: "none",
        }, 30000);

      if ($('#greenbg li.report-listing').length > 10) {
        $('#greenbg li.report-listing:last').remove();
      }

    } else if (report.bg === 'BLUE') {

      $('#bluebg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report.report +"</li><li>Reported by: " + report.user +"</li><li>Posted: " + report.timestamp +"</li></ul></li>");
      $('#bluebg li.report-listing:first')
        .animate({
          backgroundColor: "#4477dd",
        }, 1000);
      $('#bluebg li.report-listing:first')
        .animate({
          backgroundColor: "none",
        }, 30000);

      if ($('#bluebg li.report-listing').length > 10) {
        $('#bluebg li.report-listing:last').remove();
      }

    } else if (report.bg === 'EBG') {

      $('#ebg').prepend("<li class='report-listing'><ul><li class='report-text'>" + report.report +"</li><li>Reported by: " + report.user +"</li><li>Posted: " + report.timestamp +"</li></ul></li>");
      $('#ebg li.report-listing:first')
        .animate({
          backgroundColor: "#85667a",
        }, 1000);
      $('#ebg li.report-listing:first')
        .animate({
          backgroundColor: "none",
        }, 30000);

      if ($('#ebg li.report-listing').length > 10) {
        $('#ebg li.report-listing:last').remove();
      }
    }
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
    if (!reportValues.bg.isEmpty() && !reportValues.report.isEmpty()) {
      socket.emit('send_report', reportValues);
      $('.message')
        .fadeIn("slow")
        .addClass('message-green')
        .text('Your report has been successfully created!')
        .delay("1500").fadeOut("slow")
        .queue(function() { $(this).removeClass('message-green'); $(this).dequeue(); });
      $(this)
        .closest('form')
        .find("input[type=text], textarea")
        .val("");
      return false;
    } else {
      $('.message')
        .fadeIn("slow")
        .addClass('message-red')
        .text('Please Complete All Fields.')
        .delay("1500").fadeOut("slow")
        .queue(function() { $(this).removeClass('message-red'); $(this).dequeue(); });
      $(this)
        .closest('form')
        .find("input[type=text], textarea")
        .val("");
      return false;
    }

  });
});
