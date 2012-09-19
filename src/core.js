// *******************************************************************
// The 4 functions here are stolen from the `path` module of the 
// standard library of Node.js. I am putting them here because they are 
// useful for the web side as well. I am going to just leave them as-is.
// The coding style is different from mine and that is why.
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
var splitPath = function(filename) {
  var result = splitPathRe.exec(filename);
  return [result[1] || '', result[2] || '', result[3] || '', result[4] || ''];
};


// path.normalize(path)
// posix version
var normalize = function(path) {
  var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.substr(-1) === '/';

  // Normalize the path
  path = normalizeArray(path.split('/').filter(function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

var join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(paths.filter(function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};

var dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};
// End of the `path` module functions.
// *******************************************************************



var isNode = typeof process === 'object'
var modules = {}
var joinPath = join
var componentsInfo = null
var config = { // Default values
    wrapModules: false
    , wrapApp: false
    , baseDir: './'
    , srcDir: './'
    , componentsParentDir: './'
    , paths: {}
}

var keys = Object.keys || function(obj){
    var retval = []
    for (var key in obj) retval.push(key)
    return retval
}

var exit = isNode ? process.exit : function(){}

var readFile = function(){

    function nodeReadFile(path, callback){
        require('fs').readFile(path, function(err, contents){
            callback(err, contents && String(contents))
        })
    }

    function ajax(url, callback){
        var xhr = new XMLHttpRequest
        xhr.onreadystatechange = function(){
            if (this.readyState === 4){
                var content = this.responseText
                callback(null, content)
            }
        }
        xhr.open('GET', url)
        xhr.send()
    }

    return isNode ? nodeReadFile : ajax

}()

function resolveModulePath(module){
    if (componentsInfo && componentsInfo[module]){
        return joinPath(config.baseDir, config.componentsParentDir, 
            componentsInfo[module].source.main)
    }else{
        // check for paths
        for (var path in config.paths){
            if (module.indexOf(path) === 0){
                return joinPath(config.baseDir, config.paths[path], module.substring(path.length) + '.js')
            }
        }

        return joinPath(config.baseDir, config.srcDir, module + '.js')
    }
}

function getModuleCode(module, callback){
    var file = resolveModulePath(module)
    readFile(file, callback)
}

function getDependencies(module, callback){
    if (componentsInfo && componentsInfo[module]){
        var deps = componentsInfo[module].dependencies
        callback(deps ? keys(deps) : [])
    }else{
        getModuleCode(module, function(err, code){
            if (err){
                console.error("Error: Can't get code for module " + module + '. ' + err)
                callback([])
                exit(1)
                return
            }
            // parse out 'require' calls, and load the 
            var lines = code.split('\n')
            var deps = []
            for (var i = lines.length; i--;){
                var line = lines[i]
                var match = line.match(/^\/\/= require ([a-zA-Z0-9_\/]+)/)
                if (match){
                    deps.push(match[1])
                }
            }
            callback(deps)
        })
    }
}

function loadModule(module, processModule, callback){
    if (module in modules){
        if (callback) callback()
        return
    }
    getDependencies(module, function(deps){
        loadModules(deps, processModule, function(){
            getModuleCode(module, function(err, code){
                if (err){
                    console.error("Can't read code for module " + module + ': ' + err)
                    exit(1)
                    callback()
                    return
                }
                modules[module] = true
                processModule(module, code, callback)
            })
        })
    })
}

function loadModules(modules, processModule, callback){
    modules = modules.slice(0)
    function next(){
        var module = modules.pop()
        if (!module){
            if (callback) callback()
        }else{
            loadModule(module, processModule, next)
        }
    }
    next()
}

function readConfig(configFile, callback){
    config.baseDir = dirname(configFile)
    readFile(configFile, function(err, code){
        if (err){
            callback()
            return
        }
        var cfg = JSON.parse(code)
        for (var key in cfg)
            config[key] = cfg[key]
        callback()
    })
}

function readComponentsInfo(callback){
    var componentJsonPath = joinPath(config.baseDir, 'components.json')
    readFile(componentJsonPath, function(err, code){
        if (err){
            callback()
            return
        }
        componentsInfo = JSON.parse(code)
        callback()
    })
}

function initialize(configFile, callback){
    readConfig(configFile, function(){
        readComponentsInfo(callback)
    })
}

if (typeof exports !== 'undefined'){
    exports.initialize = initialize
    exports.loadModule = loadModule
}


