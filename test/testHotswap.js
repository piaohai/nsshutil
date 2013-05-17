var testHot = module.exports;
var test = require('./test');
var reload = require('./reload');


setInterval(function(){

	console.log("3333 ---------------->current " + test.say() + ' ' + new Date());

},2000)

reload.start({include:'.'});

