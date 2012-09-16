Chains: Simple Javascript Dependency Management
===============================================

Chains is a Javascript dependency management system for people who want the benefits of dependency management but don't want a full-on module system like AMD or CommonJS. To put it another way, it's for people who are okay with using global variables for tying things together. To put it yet another way, it's for people who are okay with going to the [public toilet](http://www.sitepoint.com/google-closure-how-not-to-write-javascript/) once in a while.

Chains is heavily influenced by [Sprockets](https://github.com/sstephenson/sprockets), [Bower](https://github.com/twitter/bower), and [Require.js](http://requirejs.org/).

What's in it
------------

In Require.js fashion, Chains comes packed with a **compiler** and an **async loader**. The compiler takes as argument an entry point .js file, resolves all its dependencies and spits out a concatenated source file with everything your app needs. The async loader is a .js file that you include in your web page. You specify the entry point .js file you want to load using `Loader.load('entryPoint.js')`, and it will  asynchronously resolve and load all the dependencies for you.

Require Directive
-----------------

To specify a dependency to another Javascript file `otherfile.js`, use the require directive (in comments)

    //= require otherfile

`otherfile.js` is then looked for in the same directory as the current file. You can use slashes `/` to walk subdirectories. The require directive syntax is the same as the one used in [Sprockets](https://github.com/sstephenson/sprockets#the-directive-processor).

Integration with Bower
----------------------

If you want to use [Bower](https://github.com/twitter/bower) to install packages for you, first install Bower. When installing, instead of using `bower install jquery`, use

    chains install jquery

Here is what the `install` command does: first it uses Bower to install the package; then it writes the dependency map gotten from `bower list --map` to the file `components.json` - this is what both the compiler and loader use to resolve dependencies that are provided by Bower. Now you can use a require directive to include jquery

    //= require jquery

Using the Compiler
------------------

The compiler takes an entry point as parameter, let's say if `main.js` is the entry point, you would do

    chains build main

This will appends all dependencies of main.js in the correct order and output the resulting bundled .js file to `STDOUT`.

Using the Loader
----------------

In your html page, first include the `chains.js`

    <script src="chains.js"></script>

Then, use `Loader.load(entrypoint)` to load the entry point file you want.

    <script>
    Loader.load('main.js');
    </script>

It will asynchronously load all its dependencies. *Note: you must serve the files over HTTP, local files won't work.*

Status
------

Chains is in Proof of Concept (POC) phase at the moment. Probably shouldn't use it for production just yet.

Influences
----------

* [Require.js](http://requirejs.org/)
* [Bower](https://github.com/twitter/bower)
* [Sprockets](https://github.com/sstephenson/sprockets)
* [Browserify](https://github.com/substack/node-browserify)

Weaknesses
----------

1. Loader does not work when the page is run from the local file system. The loader uses Ajax to retrieve the contents of the .js files, which is subject to the same-origin policy.

License
-------

(The MIT License)

Copyright (c) 2012 Toby Ho &lt;airportyh@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
