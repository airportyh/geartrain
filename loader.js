var Loader = (function(){

    var modules = {}
    var componentsInfo

    var keys = Object.keys || function(obj){
        var retval = []
        for (var key in obj) retval.push(key)
        return retval
    }

    function resolveModulePath(module){
        if (componentsInfo[module]){
            return componentsInfo[module].source.main
        }else{
            return module + '.js'
        }
    }

    function ajax(url, callback){
        var xhr = new XMLHttpRequest
        xhr.onreadystatechange = function(){
            if (this.readyState === 4){
                var content = this.responseText
                if (callback){
                    callback(this, content)
                }
            }
        }
        xhr.open('GET', url)
        xhr.send()
    }

    function execModule(module, code){
        var file = resolveModulePath(module)
        code += '\n//@ sourceURL=' + file
        console.log('loader: executing ' + file)
        window.eval(code)
        modules[module] = true
    }

    function getDependencies(module, callback){
        if (module in componentsInfo){
            var deps = componentsInfo[module].dependencies
            if (callback) callback(deps ? keys(deps) : [])
        }else{
            getModuleCode(module, function(code){
                // parse out 'require' calls, and load the 
                var lines = code.split('\n')
                var deps = []
                for (var i = lines.length; i--;){
                    var line = lines[i]
                    var match = line.match(/^\/\/= require ([a-zA-Z0-9]+)/)
                    if (match){
                        deps.push(match[1])
                    }
                }
                if (callback) callback(deps)
            })
        }
    }

    function getModuleCode(module, callback){
        var file = resolveModulePath(module)
        ajax(file, function(xhr, code){
            if (callback) callback(code)
        })
    }
    
    function loadModule(module, callback){
        if (module in modules){
            if (callback) callback()
            return
        }
        getDependencies(module, function(deps){
            loadModules(deps, function(){
                getModuleCode(module, function(code){
                    execModule(module, code)
                    if (callback) callback()
                })
            })
        })
    }
    
    function loadModules(modules, callback){
        modules = modules.slice(0)
        function next(){
            var module = modules.pop()
            if (!module){
                if (callback) callback()
            }else{
                loadModule(module, next)
            }
        }
        next()
    }

    function fetchComponentsInfo(callback){
        ajax('components.json', function(xhr, content){
            componentsInfo = JSON.parse(content)
            if (callback) callback()
        })
    }

    return {
        load: function(name){
            fetchComponentsInfo(function(){
                loadModule(name)
            })
        }
    }

}())