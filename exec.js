var Connection = require('ssh2');
var rl = require('readline'),
    sys = require('sys');

var Config = require('./preconfig');

process.stdin.setEncoding('utf8');

var lines = rl.createInterface(process.stdin, process.stdout, null);
lines.setPrompt('>:');
var fs = require('fs');

var clients = {};

var connect = function(host,config) {
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
      port: config.port,
      username: config.user,
      passphrase:config.passphrase || '' ,
      privateKey: fs.readFileSync(config.keyFile)
    });
};
 
Config.do(connect);


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
          lines.prompt();
        });
        stream.on('close', function() {
          lines.prompt();
        });
        stream.on('exit', function(code, signal) {
          lines.prompt();
      });
      });
    })(c,host);
  }
};
 