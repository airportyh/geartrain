//= require core

function execModule(module, code, callback){
    var file = resolveModulePath(module)
    code += '\n//@ sourceURL=' + file
    //console.log('loader: executing ' + file)
    window.eval(code)
    
    callback()
}

window.Loader = {
    load: function(module, configFile){
        configFile = configFile || 'chains.json'
        initialize(configFile, function(){
            loadModule(module, execModule, function(){})
        })
    }
}



