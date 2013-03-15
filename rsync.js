var lineReader = require('line-reader');
var fs = require('fs');

var args = process.argv;
var ipFile = args[2] || './ip';
var src  = args[3] || '/home/yph/workspace/pomelowork/push-load';
var dest = args[4] || '/home/pomelo';
var keyFile = args[5] || '/home/yph/x.ssh/id_rsa';
var user  = args[6] || 'pomelo';
var port = args[7] || 1046;

var user = 'pomelo';
var src = '/home/yph/workspace/pomelowork/push-load';
var dest = '/home/pomelo';

lineReader.eachLine(ipFile, function(host, last) { 
   var cmd = require('util').format('rsync -avz -e "ssh -p%s -i %s " %s %s@%s:%s',port,keyFile,src,user,host,dest);
   console.log(cmd);
   require('child_process').exec(cmd, function(err,data) {
      if (err) throw err;
      console.log(data);
   });
   if (last) {
   	//console.log('last');
   } 
  //if (/* done */) {
    //return false; // stop reading
  //}
}).then(function(){
	    //fs.writeFileSync('message.txt', linex);
});