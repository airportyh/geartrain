Compiler Usage
--------------

To install a package

    chains install jquery

To do anything that bower can do

    chains "something something"

will be translated to `bower something something`.

To compile a bundle starting with an entry point .js file

    chains compile main.js > bundle.js

To set the src directory

    chains compile --srcDir src main.js > bundle.js

Or -s for short

To set the components directory

    chains compile --componentDir components main.js > bundle.js

Or -c for short



