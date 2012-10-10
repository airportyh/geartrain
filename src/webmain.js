//= require core

// globalEval from <http://perfectionkills.com/global-eval-what-are-the-options/>
var globalEval = (function() {

  var isIndirectEvalGlobal = (function(original, Object) {
    try {
      // Does `Object` resolve to a local variable, or to a global, built-in `Object`,
      // reference to which we passed as a first argument?
      return (1,eval)('Object') === original;
    }
    catch(err) {
      // if indirect eval errors out (as allowed per ES3), then just bail out with `false`
      return false;
    }
  })(Object, 123);

  if (isIndirectEvalGlobal) {

    // if indirect eval executes code globally, use it
    return function(expression) {
      return (1,eval)(expression);
    };
  }
  else if (typeof window.execScript !== 'undefined') {

    // if `window.execScript exists`, use it
    return function(expression) {
      return window.execScript(expression);
    };
  }

  // otherwise, globalEval is `undefined` since nothing is returned
})();

function execModule(module, code, callback){
    /*
    function loadScript(url, callback){
        function cb(){
            if (callback) callback()
        }
        
        var script = document.createElement('script')
        if (script.readyState){
            script.onreadystatechange = function(){
                var rs = script.readyState
                if (rs === 'loaded' || rs === 'complete'){
                    script.onreadystatechange = null
                    cb()
                }
            }
        }else{
            script.onload = function(){
                cb()
            }
        }
        script.src = url
        document.getElementsByTagName('head')[0]
            .appendChild(script)
    }

    var file = resolveModulePath(module)
    loadScript(file, callback)
    */
    code += '\n//@ sourceURL=' + file
    globalEval(code)
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



