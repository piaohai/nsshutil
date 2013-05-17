var EventEmitter = require('events').EventEmitter;
var util = require('util');
var directoryWalker = require('directory-walker');
var path = require('path');
var fs = require('fs');

var IDLE = 1;
var LOADING = 2 ;

var Reload = function(){
	this.status = IDLE;
	this.lastReloadTime = null;
	this._includes = [];
	this._excludes = [];
	this._reloads = [];
	this._onlyChange = false;
}

util.inherits(Reload,EventEmitter);

Reload.prototype.start = function(config){
	if (config) {
		if (config.include) {
			this.include(config.include);
		}
		if (config.exclude) {
			this.exclude(config.exclude);
		}
	}
	this._onlyChange = config.onlyChange || false;
	this.walk();
}


Reload.prototype.reload = function() {
	var self = this;
	if (this.status === LOADING) {
		self.emit('RELOADING');
		return;
	}
	this.status = LOADING;
	this.lastReloadTime = Date.now();
	self.emit('RELOADING');
	var reloadableModules = [];
	for (var key in require.cache) {
		var module = require.cache[key];
		if (self.isModuleReloadable(module)) {
			delete require.cache[key];
			reloadableModules.push(module);
		} else {
	            //console.log('[Hot Reload] Not unloading ' + module.filename);
	    }
	}
    console.log('[Hot Reload] ' + reloadableModules.length + ' modules removed from cache.');
    for (var i = 0; i < reloadableModules.length; i++) {
         self.reloadModule(reloadableModules[i]);
    }
    for (var key in require.cache) {
		var module = require.cache[key];
    	console.log(module.filename);
	}
    this._reloads = [];
    self.emit('ReloadEND');
    this.status = IDLE;
}

Reload.prototype.isModuleReloadable = function(module) {

    var filename = module.filename;

    if (this._excludes) {
        for (var i = 0; i < this._excludes.length; i++) {
            var exclude = this._excludes[i];
            if (matches(exclude, filename)) {
                return false;
            }
        }
    }

    if (this._includes) {
        for (var i = 0; i < this._includes.length; i++) {
            var include = this._includes[i];
            if (matches(include, filename)) {
            	if (!this._onlyChange) {
            		return true;
            	} else {
	            	for (var j = 0; j < this._reloads.length; j++) {
			            var _reload = this._reloads[j];
			            if (matches(_reload, filename)) {
			                return true;
			            }
			        }
		        }
            }
        }
    }

    return false;
}

/**
 * Reload a given module.
 * @param {Module} module a module
 * @param {EventEmitter} an event emitter
 */
Reload.prototype.reloadModule = function(module) {
    console.log('[Hot Reload] Reloading module: ' + module.filename);
    this.emit('beforeModuleReload', module);
    if (module.exports.unloadModule) {
        module.exports.unloadModule.call(exports);
    }
    delete require.cache[module.filename];
    var newModule = require(module.filename);
    for (var key in newModule) {
        if (newModule.hasOwnProperty(key)) {
            module.exports[key] = newModule[key];
        }
    }
    this.emit('afterModuleReload', module);
}


Reload.prototype.walk = function(){
	var self = this;
	var dwalker = directoryWalker.createDirectoryWalker({
		excludes : this._excludes,
		onDirectory : function(directory) {
			fs.watch(directory,
				function(event, file) {
					console.log('[Hot Reload] Changed: ' + file);
					self._reloads.push(directory+'/'+file);
					self.reload();
				});
		},
		listeners : {
			'error' : function(err) {
				console.error(err);
			}
		}
	});

	if (this._includes) {
		for (var i = 0; i < this._includes.length; i++) {
			dwalker.walk(this._includes[i]);
		}
	}

}

Reload.prototype.include = function(includes){
	if (!Array.isArray(includes)) {
		includes = [includes];
	}

	for (var i = 0; i < includes.length; i++) {
		var dir = resolveFilename(includes[i]);
		this._includes.push(dir);
	}	
}

Reload.prototype.exclude = function(excludes){
	if (!Array.isArray(excludes)) {
		excludes = [excludes];
	}

	for (var i = 0; i < excludes.length; i++) {
		var dir = resolveFilename(excludes[i]);
		this._excludes.push(dir);
	}	
}

function resolveFilename(filename) {
	if (filename.constructor !== String) {
		return filename;
	}
	if ((filename.charAt(0) !== '.') && (filename.charAt(0) !== '/')) {
		return filename;
	} else {
		return path.resolve(filename);
	}
}

function matches(filter, name) {
    if (filter.constructor === RegExp) {
        // see if name matches regex
        if (filter.test(name)) {
            return true;
        }
    } else {
        // see if name starts with given filter value
        if (name.indexOf(filter) === 0) {
            return true;
        }
    }
}

module.exports = new Reload();