//= require core

function execModule(module, code, callback){
    var file = resolveModulePath(module)
    code += '\n//@ sourceURL=' + file
    //console.log('loader: executing ' + file)
    window.eval(code)
    
    callback()
}

window.Geartrain = {
    load: function(module, configFile, callback){
        configFile = configFile || 'geartrain.json'
        initialize(configFile, function(){
            if (module instanceof Array){
                loadModules(module, execModule, callback || function(){})
            }else{
                loadModule(module, execModule, callback || function(){})
            }
        })
    }
}



