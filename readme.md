# Hoxy Profiler

A tool that prints out crude profiles of web page loading on the command line.
You must provide a `start()` and `stop()` function to tell it when to start and stop recording requests, based on the url.

```javascript
var profiler = require('hprofiler');

var opts = {
  width: 100, // width to print out (default 80)
  start: function(url){
    return url === '/';
  },
  stop: function(url){
    return /^\/api\/1\//.test(url);
  }
};

var proxy = profiler(opts);
proxy.log('error warn', process.stderr);
proxy.log('info', process.stdout);
proxy.listen(8080);
```

`proxy` is a hoxy instance in the above code.
Args from `opts` are passed to `new hoxy.Proxy()`.
http://greim.github.io/hoxy/#class-proxy

    npm install hprofiler

MIT License.
