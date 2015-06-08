// DATE TOOLS

// Converts single digits to double digits

Date.prototype.addzero = function(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + "";
};

// Converts 24hr format to 12hr format
Date.prototype.standardHours = function() {
  var hours = this.getHours();
  if (hours > 12) {
      hours -= 12;
  } else if (hours === 0) {
     hours = 12;
  };
  return hours;
};

// Creates a MM/DD/YYYY HH:MM:SS timestamp
Date.prototype.timestamp = function() {
  return [
    [this.addzero(this.getMonth() + 1),
    this.addzero(this.getDate()),
    this.getFullYear()].join("/"),
    [this.addzero(this.standardHours()), this.addzero(this.getMinutes()),
    this.addzero(this.getSeconds())].join(":"),
    this.getHours() >= 12 ? "PM" : "AM"
  ].join(" ");
};

// Creates a raw YYYYMMDDHHMMSS timestamp
Date.prototype.rawstamp = function() {
  return [
    [this.getFullYear(),
    this.addzero(this.getMonth() + 1),
    this.addzero(this.getDate())
    ].join(""),
    [this.addzero(this.getHours()), this.addzero(this.getMinutes()),
    this.addzero(this.getSeconds())].join("")
  ].join("");
};

var now = new Date();

module.exports = now;
