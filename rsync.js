var Config = require('./preconfig');

var sync = function (host, config) { 
   console.log(host);
   var cmd = require('util').format('rsync -avz -e "ssh -p%s -i %s " %s %s@%s:%s',config.port,config.keyFile,config.src,config.user,host,config.dest);
   require('child_process').exec(cmd, function(err,data) {
      if (err) throw err;
      console.log(data);
   });
} 

Config.do(sync);
