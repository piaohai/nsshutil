var http = require('http');



var Config = require('./lib/preconfig');

var arg = process.argv[3] || 'start';

var act = function(host) {

    console.log(host);

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
};

Config.do(act);
