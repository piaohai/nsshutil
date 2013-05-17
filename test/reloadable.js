/**
 * 支持hotswap的工具
 */
var fs = require('fs');
var reload = module.exports;

var innerM = {};
var intervalWatch = 1000;

//var innerFunc = {};
/**
 * 热加载化用户模块
 * 
 * @param parent 加载模块的宿主目录
 * @param module 被加载模块的名称
 
reload.able = function(parent, module){
  var file = parent+"/"+module;
  var key = require.resolve(file);
  console.log("[%s] has reloadable function", key);
  addWatch(key);
  return function(){
	  var m = innerM[key];
	  if(!!m)
		  return m;
	  m = require(file);
	  innerM[key] = m;
	  return m;
  };
};
*/
/**
 * 热加载化用户模块内的方法
 * 
 * @param parent 加载模块的宿主目录
 * @param module 被加载模块的名称
 */
reload.able = function(parent, module){
  var file = parent+"/"+module;
  var key = require.resolve(file);
  console.log("[%s] has reloadable function", key);
  addWatch(key);
  var m = innerM[key];
  if(!!m)
	  return m;
  var inner = require(file);
  m = {};
  m.__inner = file;
  for(var func in inner){
		m[func] = inner[func];
  }
  innerM[key] = m;
  return m;
};


/**
 * 将文件加入监控
 * 
 * @param key
 */
function addWatch(key){
  console.log("[%s] has been added watch",key);
  fs.watch(key,{ persistent: true},function(event, filename){
	  //当文件修改，则删除cache重新加载
	  console.log("[%s] has modified: [%s]",key,event);
	  if(event=='change')
	    hotswap(key);
  });
}

function hotswap(key){
  var m = innerM[key];
  if(!!m){
	delete require.cache[key];
	for(var func in m){
	  console.log("delete [%s] from [%s]", func, m);
	  if(func != '__inner')
		  delete m[func];
	}
	var inner = require(m.__inner);
	for(var func in inner){
		m[func] = inner[func];
	}
  }
}