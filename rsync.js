var lineReader = require('line-reader');
var fs = require('fs');
var user = 'pomelo';
var src = '/home/yph/workspace/pomelowork/push-load';
var dest = '/home/pomelo';

lineReader.eachLine('./ip', function(line, last) { 
   var cmd = require('util').format('rsync -avz -e "ssh -p1046" %s %s@%s:%s',src,user,line,dest);
   console.log(cmd);
   require('child_process').exec(cmd, function(err,data) {
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