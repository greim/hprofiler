var profiler = require('../run-hoxy');

var proxy = profiler({
  width: 100,
  start: function(url){
    // return true to trigger start recording
    return url === '/';
  },
  stop: function(url){
    // return false to trigger stop recording
    return /^\/api\/1\//.test(url);
  }
});

// proxy is a hoxy instance
// http://greim.github.io/hoxy/#class-proxy

proxy.log('error warn', process.stderr);
proxy.log('info', process.stdout);
proxy.listen(8080);
