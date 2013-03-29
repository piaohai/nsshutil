var Connection = require('ssh2');
var rl = require('readline'),
    sys = require('sys');

var Config = require('./preconfig');

process.stdin.setEncoding('utf8');

var firstMap = {};

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
      console.log('------------' + host + ' :: ready ----------');
      firstMap[host] = true;
      c.shell(function(err, stream) {
        if (err) throw err;
        stream.on('data', function(data, extended) {
          var tdata = data+'';
          //console.log(data);
          //console.log(tdata);
          if (!tdata) return;
          lines.prompt();
          console.log('------------' + host + ' ----------');
          //if (tdata!==last){
            if (!firstMap[host])
             {
              if (!!tdata) {
                console.log(tdata);
              }
            }
            //last = tdata;
          //} 
          lines.prompt();
          firstMap[host] = false;
        });
        stream.on('end', function() {
          console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
        });
        stream.on('close', function() {
          console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
          lines.prompt();
        });
        clients[host] = stream;
        stream.on('exit', function(code, signal) {
            console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
        });
      });
      lines.prompt();
    });
    c.on('error', function(err) {
      console.log(host + ' Connection :: error :: ' + err);
      console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
    });
    c.on('end', function() {
      console.log('Connection :: end');
      console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
    });
    c.on('close', function(had_error) {
      console.log(host + ' Connection :: close');
      console.log('enddddddddddddddddddddddddddddddddddddddddddddd');
      delete clients[c];
    });
    c.connect({host: host,
      port: config.port,
      username: config.user,
      passphrase:config.passphrase || '' ,
      tryKeyboard: true,
      debug: function (msg) {
        //console.log('Connection: ' + msg);
      },
      privateKey: fs.readFileSync(config.keyFile) || ''
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
  var last = "";

var exec = function(chunk) {
  for (var host in clients) {
    var c = clients[host];
    (function(c,host){
       c.write(chunk + '\n');
    })(c,host);
  }
};
 