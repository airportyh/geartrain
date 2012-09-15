var fs = require('fs')
var readFile = fs.readFileSync // Oh no I didn't!
var entryPoint = process.argv[2]

var componentsInfo = JSON.parse(readFile('components.json'))

function resolveModulePath(module){
    if (componentsInfo[module]){
        return componentsInfo[module].source.main
    }else{
        return module + '.js'
    }
}

function getDependencies(module){
    if (module in componentsInfo){
        var deps = componentsInfo[module].dependencies
        return deps ? Object.keys(deps) : []
    }else{
        var deps = []
        var contents = readFile(resolveModulePath(module)).toString()
        var lines = contents.split('\n')
        lines.forEach(function(line){
            var match = line.match(/^\/\/= require ([a-zA-Z0-9]+)/)
            if (match){
                var module = match[1]
                deps.push(module)
            }
        })
        return deps
    }
}

function load(module, modules, fileContents){
    if (module in modules) return
    var deps = getDependencies(module)
    deps.forEach(function(dep){
        load(dep, modules, fileContents)
    })
    var contents = readFile(resolveModulePath(module)).toString()
    fileContents.push(contents)
    modules[module] = true
}

var fileContents = []
load(entryPoint, {}, fileContents)
var contents = fileContents.join('\n;\n')
contents = ';(function(){\n' + contents + '}());'
console.log(contents)