(function(){

    var isNode = typeof process === 'object'
    var modules = {}
    var componentsInfo = null

    var keys = Object.keys || function(obj){
        var retval = []
        for (var key in obj) retval.push(key)
        return retval
    }

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
        if (componentsInfo[module]){
            return componentsInfo[module].source.main
        }else{
            return module + '.js'
        }
    }

    function getModuleCode(module, callback){
        var file = resolveModulePath(module)
        readFile(file, callback)
    }

    function getDependencies(module, callback){
        if (module in componentsInfo){
            var deps = componentsInfo[module].dependencies
            callback(deps ? keys(deps) : [])
        }else{
            getModuleCode(module, function(err, code){
                if (err){
                    console.error("Can't get code for module " + module)
                    callback([])
                }
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
                        console.error(err)
                        callback()
                    }
                    console.log('processModule ' + module)
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

    function readComponentsInfo(callback){
        readFile('components.json', function(err, code){
            if (err){
                console.error("Can't read components.json")
                callback()
                return
            }
            componentsInfo = JSON.parse(code)
            callback()
        })
    }

    function webMain(){

        function execModule(module, code, callback){
            var file = resolveModulePath(module)
            code += '\n//@ sourceURL=' + file
            console.log('loader: executing ' + file)
            window.eval(code)
            modules[module] = true
            callback()
        }

        window.Loader = {
            load: function(module){
                readComponentsInfo(function(){
                    loadModule(module, execModule, function(){})
                })
            }
        }

    }

    function nodeMain(){
        
        var fileContents = []
        function addToFileContents(module, code, callback){
            fileContents.push(code)
            modules[module] = true
            callback()
        }

        readComponentsInfo(function(){
            loadModule(process.argv[2], addToFileContents, function(){
                var contents = fileContents.join('\n;\n')
                contents = ';(function(){\n' + contents + '}());'
                console.log(contents)
            })
        })

    }

    var main = isNode ? nodeMain : webMain

    main()

}())