/*
 * Web debugging proxy server.
 * Generated by Hoxy.
 * http://greim.github.io/hoxy/
 * https://github.com/greim/hoxy
 * Copyright (c) <year> by First Last <email>
 * See "license.txt" for more info.
 */

var hoxy = require('hoxy');
var util = require('util');
var _ = require('lodash');
var config = _.extend({
  width:80,
  start: function(url){ throw new Error('missing start function'); },
  stop: function(url){ throw new Error('missing stop function'); }
},require('./hoxy.json'));

module.exports = function(opts){
  opts = _.extend(config, opts);

  // create a proxy server
  var proxy = new hoxy.Proxy(config);

  var phases = ['request','request-sent','response','response-sent'];

  function num(n){
    if (isNaN(n)){
      return '???';
    } else {
      n = '' + n;
      while(n.length < 3)n=' '+n;
      return n;
    }
  }

  function printTimeline(){
    var min = Infinity;
    var max = -Infinity;
    var times = [];
    timeline.forEach(function(cycle){
      var time = {url:cycle.data('url')};
      phases.forEach(function(phase){
        var t = cycle.data(phase);
        if (t !== undefined){
          min = Math.min(min, t);
          max = Math.max(max, t);
          time[phase] = t;
        }
      });
      times.push(time);
    });
    times.forEach(function(time){
      time.sending = time['request-sent'] - time['request'];
      time.waiting = time['response'] - time['request-sent'];
      time.receiving = time['response-sent'] - time['response'];
    });
    var range = max - min;
    var width = config.width;
    times.forEach(function(time){
      phases.forEach(function(phase){
        if (time[phase] === undefined){
          time[phase] = max;
        }
        var absTime = (time[phase] - min) / range;
        absTime = Math.round(absTime * width);
        time[phase] = absTime;
      });
    });
    times.forEach(function(time){
      var s = '| ';
      for (var i=0; i<time['request']; i++){
        s += '.';
      }
      for (var i=time['request']; i<time['request-sent']; i++){
        s += '>';
      }
      for (var i=time['request-sent']; i<time['response']; i++){
        s += '=';
      }
      for (var i=time['response']; i<time['response-sent']; i++){
        s += '<';
      }
      for (var i=time['response-sent']; i<width; i++){
        s += '.';
      }
      var amounts = util.format('sending: %sms, waiting: %sms, receiving: %sms', num(time.sending), num(time.waiting), num(time.receiving));
      console.log(s + ' | ' + amounts + ' | ' + time.url.substring(0,80));
    });
    console.log('total: ' + range + 'ms');
    console.log('\n\n');
  }

  var timeline;

  proxy.intercept('request', function(req, resp) {
    if (config.start(req.url)){
      timeline = [];
    } else if (config.stop(req.url)){
      if (timeline){
        setTimeout(function(){
          printTimeline();
          timeline = undefined;
        },0);
      }
    }
  });

  phases.forEach(function(phase){
    proxy.intercept(phase, function(req, resp) {
      if (timeline){
        if (phase === 'request'){
          timeline.push(this);
          this.data('url', req.url);
        }
        this.data(phase, Date.now());
      }
    });
  });
  return proxy;
};
