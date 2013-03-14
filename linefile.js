var lineReader = require('line-reader');
var fs = require('fs');
var i = 0;
var linex = "";
lineReader.eachLine('/home/yph/urs2.csv', function(line, last) { 
  if (line.indexOf('@')==-1){
  	line+='@163.com'
  }
  i++;
  linex+=line;
  if (i%300==0) {
    //console.log(linex);
    linex+='\r\n';
    //fs.appendFile('message.txt', linex, function (err) {
	  //if (err) throw err;
	  //console.log('The "data to append" was appended to file!');
	//});
    //linex="";
  } else {
  	linex+=":"
  }
  //if (/* done */) {
    //return false; // stop reading
  //}
}).then(function(){
	    fs.writeFileSync('message.txt', linex);
});