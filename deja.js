
var express = require('express'),
  app = express(),
  fs = require('fs'),
  jsdom = require('jsdom');

port = process.argv[2] || 8000;

app.use(express.bodyParser());

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'text/html');
  res.end('Dejafeed: <a href="/subscriptions">Subscriptions</a> <a href="/feed">Feed</a> <a href="/subscribe">Subscribe</a>');
});

app.post('/subscribe', function(req, res){
  jsdom.env(
    './opml.tpl', 
    ['./lib/jquery.js', './lib/weld.js'],
    function(errors, window) {
      if ( fs.existsSync('./data/subs.opml')) {
        // append to subs.opml
        jsdom.env(
          './data/subs.opml', 
          ['../lib/jquery.js', '../lib/weld.js'],
          function(errors, window1) {
            var data = [{ outline: req.body.suburl }];
            window1.$('body .outline').each(function( index, element ) {
             data.push({ outline: window1.$( element ).attr('url') });
            });
            window1.weld(window1.$('body')[0], data);
            window1.$('body .outline').each(function( index, element ) {
              window1.$( element ).attr('url', window1.$( element ).text());
            });
            fs.writeFile('./data/subs.opml', '\
<?xml version="1.0" encoding="ISO-8859-1"?>\
<opml version="2.0">'+
            window1.$('opml').html()+
            '</opml>');
            res.end('<p>subscribed</p><a href="/">home</a>');
          }
        );
      } else {
        // create subs.opml
        var data = [{ outline: req.body.suburl }];
        window.weld(window.$('body')[0], data);
        window.$('body .outline').each(function( index, element ) {
          window.$( element ).attr('url', window.$( element ).text());
        });
        fs.writeFile('./data/subs.opml', '\
<?xml version="1.0" encoding="ISO-8859-1"?>\
<opml version="2.0">'+
        window.$('opml').html()+
        '</opml>');
        res.end('<p>subscribed</p><a href="/">home</a>');
      }
    }
  );
});

app.get('/subscribe', function(req, res){
  res.setHeader('Content-Type', 'text/html');
  res.end('<form method="post" action="/subscribe">HTML or XML URL: <input name="suburl" type="text" /><input type="submit" value="Subscribe" /></form>');
});

app.get('/subscriptions', function(req, res){
  if ( fs.existsSync('./data/subs.opml')) {
  res.end(fs.readFileSync('./data/subs.opml'));
  } else {
    res.end('no subscriptions yet');
  }
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

