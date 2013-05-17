var http = require('http');
// Controlling server.
http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type":"text/html; charset=utf-8"});
    if (req.method === "GET") {
        var url = require('url').parse(req.url, true);
        if (url.pathname === '/') {

        	var html = 'name:<input type=text ><input type=password>script:<textarea></textarea>'
            return res.end(html);
        }  if (url.pathname === '/stats') {
            // Return stats on '/'
            try {
                var actors = {};
                for (var i=0;i<robots.length;i++){
                    actors = robots[i].agent.actors || {};
                    break;
                }
                var stats = {size:robots.length,actors:actors};
                return res.end(JSON.stringify(stats) + "\n");
            } catch(ex) {
                return res.end(JSON.stringify(ex.stack) + "\n");
            }
        } else if (url.pathname === '/set') {
            // Set params on '/set', preserving the type of param.
            for (var key in url.query) {
                config['apps'][key] = (typeof config[key] == 'number') ? +url.query[key] : url.query[key];
            }
            return res.end(JSON.stringify(config) + "\n");

        } else if (url.pathname === '/restart') {
            require('child_process').exec("sudo restart client", function() {});
            return res.end("OK\n");
        }  else if (url.pathname === '/pull') {
            require('child_process').exec("cd /home/ubuntu/hello && git pull ", function() {});
            return res.end("OK\n");
        } else if (url.pathname === '/stop') {
            setTimeout(function(){process.exit(0)},1000);
            return res.end("HTTP SERVER CLOSE OK\n");
        } else if (url.pathname === '/reset') {
            return res.end(ok);
        } else if (url.pathname === '/start') {
            var num = url.query['num'] || 1;
            run(num);
            return res.end("OK\n" + num);
        }
    }
    res.writeHead(404);
    res.end("<h1>404<h1>\n");
}).listen(8080);

console.log(' http server start at port '  + 8080)

process.on('uncaughtException', function(err) {
  console.error(' Caught exception: ' + err.stack);
  fs.writeFileSync('/tmp/log',err.stack,'utf8');
});
