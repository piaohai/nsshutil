var Config = require('./lib/preconfig');

var sync = function (host, config) { 
   console.log(host);
   var cmd = require('util').format('rsync -zrtopg --progress --delete -avz --exclude "%s" -e "ssh -p%s -i %s " %s %s@%s:%s',config.exclude, config.port,config.keyFile,config.src,config.username,host,config.dest);
   console.error(cmd);
   require('child_process').exec(cmd, function(err,data) {
      if (err) throw err;
      console.log(data);
   });
} 

Config.do(sync);
