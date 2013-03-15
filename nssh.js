var Connection = require('ssh2');
var rl = require('readline'),
    sys = require('sys');

var args = process.argv;
var ipFile = args[2] || './ip';
var user  = args[3] || 'pomelo';
var port = args[4] || 1046;
var keyFile = args[5] || '/home/yph/.ssh/id_rsa';
var passphrase = args[6] || '';

console.error('ipFile=%j user=%j port=%j keyFile=%j',ipFile,user,port,keyFile);

process.stdin.setEncoding('utf8');

var lines = rl.createInterface(process.stdin, process.stdout, null);
lines.setPrompt('>:');
var lineReader = require('line-reader');
var fs = require('fs');

var clients = {};

lineReader.eachLine(ipFile, function(host, last) {
  (function(host) {
    var c = new Connection();
    c.on('connect', function() {
      //console.log(host + ':: connect');
    });
    c.on('ready', function() {
      clients[host] = c;
      console.log('------------' + host + ' :: ready ----------');
      lines.prompt();
    });
    c.on('error', function(err) {
      console.log(host + ' Connection :: error :: ' + err);
    });
    c.on('end', function() {
      console.log('Connection :: end');
    });
    c.on('close', function(had_error) {
      console.log(host + ' Connection :: close');
      delete clients[c];
    });
    c.connect({host: host,
      port: port,
      username: user,
      passphrase:passphrase,
      privateKey: fs.readFileSync(keyFile)
    });
  })(host);
}).then(function(){

});


lines.on('line', function(chunk) {
    if (chunk==='exit'){
      process.exit(0);
    }
    if (!!chunk) {
      exec(chunk);
    } else {
      lines.prompt();
    }
});

lines.on('close', function () {
    sys.puts('process end.');
    process.exit(0);
});
 
 

var exec = function(chunk) {
  chunk = "source .profile && " + chunk;
  var last = "";
  for (var host in clients) {
    var c = clients[host];
    (function(c,host){
      c.exec(chunk, function(err, stream) {
        if (err) throw err;
        stream.on('data', function(data, extended) {
          console.log('------------' + host + ' ----------');
          var tdata = data+'';
          if (tdata!==last){
            console.log(tdata);
            last = tdata;
          } else {
            console.log(' >> ')
          }
          lines.prompt();
        });
        stream.on('end', function() {
        });
        stream.on('close', function() {
        });
        stream.on('exit', function(code, signal) {
        //console.log(host + ' Stream :: exit :: code: ' + code + ', signal: ' + signal);
        //c.end();
      });
      });
    })(c,host);
  }
};
 