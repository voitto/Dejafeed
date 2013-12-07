
var express = require('express'),
  app = express(),
  fs = require('fs'),
  jsdom = require('jsdom');

port = process.argv[2] || 8000;

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'text/html');
  res.end('Dejafeed: <a href="/subscriptions">Subscriptions</a> <a href="/feed">Feed</a>');
});

app.get('/subscriptions', function(req, res){
  jsdom.env(
    './opml.tpl', 
    ['./lib/jquery.js', './lib/weld.js'],
    function(errors, window) {
      var data = [{ outline: 'bozo' },
                  { outline: 'yolo' }];
      window.weld(window.$('body')[0], data);
      res.send('\
<?xml version="1.0" encoding="ISO-8859-1"?>\
<opml version="2.0">'+
      window.$('opml').html()+
      '</opml>');
    }
  );
});

app.get('/feed', function(req, res){
  jsdom.env(
    './rss.tpl', 
    ['./lib/jquery.js', './lib/weld.js'],
    function(errors, window) {
      var data = [{ title: 'bozo',  link : 'linke1' },
                  { title: 'yolo', link : 'link2' }];
      //window.$('.item').find('title').addClass('title');
      window.weld(window.$('item')[0], data, {insert:function(parent, element){
            parent.insertBefore(element, parent.firstChild);
      }});
      //window.$('.item').each(function( index ) {
      //});
      res.send('\
<?xml version="1.0"?>\
<rss version="2.0" xmlns:rss5="http://rss5.org/">'+
        window.$('rss').html()+
        '</rss>');
    }
  );
});

app.listen(port);

console.log("Dejafeed running");

