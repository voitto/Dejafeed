
var express = require('express'),
  app = express(),
  fs = require('fs'),
  jsdom = require('jsdom'),
  http = require('http'),
  url = require('url'),
  FeedParser = require('feedparser'),
  request = require('request');

port = process.argv[2] || 8000;

app.use(express.bodyParser());

app.get('/', function(req, res){
  function endit(res,posts){
    posts.sort(function(a,b){
      return a.date + b.date;
    });
    var html = '';
    for (n in posts)
      html = html + '<a href="'+posts[n].link+'">'+posts[n].title+'</a><BR>';
    res.setHeader('Content-Type', 'text/html');
    html = 'Dejafeed: <a href="/subscriptions">Subscriptions</a> <a href="/feed">Feed</a> <a href="/subscribe">Subscribe</a><BR>' + html;
    res.end(html);
  }
  var cbc = 0;
  var lim = 0;
  var tit = 0;
  console.log('lim was '+lim.toString());
  jsdom.env(
    './data/subs.opml', 
    ['../lib/jquery.js'],
    function(errors, window1) {
      lim = window1.$('body .outline').length;
      var posts = [];
      window1.$('body .outline').each(function( index, element ) {
        var endpoint = window1.$( element ).attr('url');
        request(endpoint)
          .pipe(new FeedParser([]))
          .on('error', function(error) {
          })
          .on('meta', function (meta) {
          })
          .on('data', function (item) {
            tit++;
            console.log(item.title);
              var title = item.title;
              var link = item.link;
              var date = Date.parse(item.pubdate);
              posts.push({title:title,link:link,date:date});
          })
          .on('end',function(){
            cbc++;
            if (cbc == lim)
              endit(res,posts);
          });
      });
    }
  );
});

app.post('/subscribe', function(req, res){
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
    jsdom.env(
      './opml.tpl', 
      ['./lib/jquery.js', './lib/weld.js'],
      function(errors, window) {
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
    );
  }
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
      window.weld(window.$('item')[0], data, {insert:function(parent, element){
            parent.insertBefore(element, parent.firstChild);
      }});
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

