var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/user', function (req, res) {
  var username = req.params.username;
  userId = 0;
  res.json({
    id: userId,
    name: username,
    sm: 'asdf'
    });
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
