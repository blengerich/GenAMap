To build: 

$ node-gyp configure build

This builds an executable in the build/Release folder.

To run:
$ node
> const addon = require('./build/Release/addon');
> console.log('This should be eight:', addon.add(3,5));