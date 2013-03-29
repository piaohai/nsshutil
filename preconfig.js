var fs = require('fs');
var configFile = "./config";

var Config = function() {
  this.config = {};
}

Config.prototype.init = function() {
  var config = this.config;
  var configStr=fs.readFileSync(configFile,"utf8").toString().split("\n");;
  for (var i in configStr){
    var line = configStr[i];
    if (!!line){
      var vals = line.split('=');
      config[vals[0]]=vals[1];
    }
  }
  var ipFile = process.argv[2] || config.ipFile;
  config.user = ipFile;
  config.port = process.argv[3] || config.port;
  this.ips = [];
  var duplicate = {};
  configStr=fs.readFileSync(ipFile,"utf8").toString().split("\n");;
  for (var i in configStr){
    var line = configStr[i];
    if (!!line){
      if (!duplicate[line]) {
        this.ips.push(line);
        duplicate[line] = true;
      }
    }
  }
  return this;
}

Config.prototype.do = function(cb){
  for (var ip in this.ips){
    cb(this.ips[ip],this.config);
  }
}

module.exports = new Config().init();

