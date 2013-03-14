var http = require('http');

var lineReader = require('line-reader');
var fs = require('fs');
var arg = process.argv[2] || 'start';

fs.appendFile('/tmp/log','sss','utf8');
return;

lineReader.eachLine('./ip', function(host, last) {
  (function(host) {
    var req = http.request({host:host, port:8890,path: '/'+arg, agent:false});

    req.setNoDelay();

    req.on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
        });
        res.on('error', function(error) {
          console.log(error);
        });
    });
    req.on('error', function(error) {
      console.log(error);
    });
    req.end();
  })(host);
}).then(function(){

});
