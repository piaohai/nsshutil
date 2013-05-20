var Connection = require('ssh2');
var rl = require('readline');
var sys = require('sys');
var fs = require('fs');

var PreUtil = require('./lib/preconfig');

process.stdin.setEncoding('utf8');

var publicKey = fs.readFileSync(PreUtil.config.publicKey) || '';
var privateKey = fs.readFileSync(PreUtil.config.privateKey) || '';

var firstMap = {};

var lines = rl.createInterface(process.stdin, process.stdout, null);
lines.setPrompt('>:');

var clients = {};

var switchConnect = function(host,config) {
  var c = new Connection();
  c.on('ready', function() {
    firstMap[host] = false;
    c.shell(function(err, stream) {
      if (err) throw err;
      var lastcmd = 'sudo -i -u ' + config.destname;
      stream.write(lastcmd);
      stream.write('\n');
      stream.on('data', function(data, extended) {
        if (!data) return;
        var tdata = data+'';
        if (tdata.indexOf(lastcmd)!=-1 || tdata[tdata.length-2]==='$'){
          lines.prompt();
          if (tdata[tdata.length-2]==='$') {
            if (!!firstMap[host]) {
              c.end();
            };
            firstMap[host] = true;
            lastcmd = " echo '" +  publicKey + "' >> /home/"+config.destname+"/.ssh/authorized_keys";
            stream.write(lastcmd);
            stream.write('\n');
          }
        }
      });
      stream.on('end', function() {
      });
      stream.on('close', function() {
        lines.prompt();
      });
      stream.on('exit', function(code, signal) {
      });
    });
    lines.prompt();
  });
  c.on('error', function(err) {
    console.log(host + ' Connection :: error :: ' + err);
  });
  c.on('close', function(had_error) {
    directConnect(host,config);
  });
  c.connect({host: host,
    port: config.port,
    username: config.username,
    passphrase:config.passphrase || '' ,
    privateKey: privateKey
  });
};

var directConnect = function(host,config) {
  var c = new Connection();
  c.on('ready', function() {
    console.log('------------' + host + ' :: ready ----------');
    c.shell(function(err, stream) {
      if (err) throw err;
      stream.on('data', function(data, extended) {
        if (!data) return;
        var tdata = data+'';
        lines.prompt();
        if (tdata[tdata.length-2]==='$') {
          console.log('------------' + host + ' ----------');
          console.log(tdata);
          lines.prompt();
        }
      });
      stream.on('end', function() {
      });
      stream.on('close', function() {
        lines.prompt();
      });
      clients[host] = stream;
      stream.on('exit', function(code, signal) {
      });
    });
    lines.prompt();
  });
  c.on('error', function(err) {
    console.log(host + ' Connection :: error :: ' + err);
  });
  c.on('end', function() {
  });
  c.on('close', function(had_error) {
    console.log(host + ' Connection :: close');
    delete clients[c];
  });
  c.connect({host: host,
    port: config.port,
    username: config.destname,
    passphrase:config.passphrase || '' ,
    debug: function (msg) {
        //console.log('Connection: ' + msg);
      },
      privateKey: privateKey
    });
};

if (PreUtil.config.username!=PreUtil.config.destname) {
  PreUtil.do(switchConnect);
} else {
  PreUtil.do(directConnect);
}

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
