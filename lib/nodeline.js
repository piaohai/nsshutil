Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

  NativeModule.wrap = function(script) {
    var script = script.replace(new RegExp("console.log\\(","gm"),"console.log(__filename+' - '+__line+': ',");
    script = script.replace(new RegExp("logger.info\\(","gm"),"logger.info(__line+': '+");
    script = script.replace(new RegExp("logger.error\\(","gm"),"logger.info(__line+': '+");
    script = script.replace(new RegExp("logger.warn\\(","gm"),"logger.info(__line+': '+");
    return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
  };


