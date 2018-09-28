var request = require('request');
var users = require('./whobot.json');
var XMLHttpRequest = require("xmlhttprequest");
var randomWhoPrev = -1;

function getRamdomOrg(min, max) {
  var xhr = new XMLHttpRequest();
  var url = 'https://www.random.org/integers/?num=1&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new';
  xhr.open('GET', url, false);
  xhr.send();
  return parseInt(xhr.responseText);
}

module.exports = function (req, res, next) {
  console.log(req.body);
  /*token
    team_id
    team_domain
    channel_id
    channel_name
    user_id
    user_name
    command
    text
    response_url
    trigger_id*/

  var botPayload = {}; 
  var randomWho = -1;

  for (; randomWho == -1 || users[randomWhoPrev] == users[randomWho] || req.body.user_name == users[randomWho];) {
    randomWho = getRamdomOrg(0, users.length - 1);
  }
  randomWhoPrev = randomWho;

  var message = '@' + req.body.user_name + ' gives a ';
  if (req.body.text)
    message = message + req.body.text;
  else
    message = message + "nullptr";
  message = message + ' to @' + users[randomWho];
  
  botPayload.text = message;
  botPayload.channel = req.body.channel_id;

  send(botPayload, function (error, status, body) {
    if (error) {
      return next(error);

    } else if (status !== 200) {
      // inform user that our Incoming WebHook failed
      return next(new Error('Incoming WebHook: ' + status + ' ' + body));

    } else {
      return res.status(200).end();
    }
  });
}

function send (payload, callback) {
  var path = process.env.INCOMING_WEBHOOK_PATH;
  var uri = process.env.SLACK_WEBHOOK_URL;
 
  request({
    uri: uri,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    callback(null, response.statusCode, body);
  });
}
