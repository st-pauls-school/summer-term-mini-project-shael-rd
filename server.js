const constants = require('./src/constants.js')
const express = require('express')
const url = require('url')
const server = express()
const router = express.Router()
const port = 3001
const originWhitelist = ['http://localhost:' + port, 'http://localhost:8080']

server.get('/', (request, response) => response.send('Hello World'))

server.use('/api', router)

router.use((request, response, next) => {  
  let origin = request.headers.origin;
  console.log('Server info: Request received from' + origin);
  console.log(constants.serverURL)

  // only allow requests from origins that we trust
  if (originWhitelist.indexOf(origin) > -1) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    console.log('Found whitelisted origin')
  }
  
  // only allow get requests, separate methods by comma e.g. 'GET, POST'
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // push through to the proper route
  next();
})

router.get('/stuff', (request, response) => {
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var myParam = parameters.q
  // e.g. myVenues = 12;

  var myResponse = 'I multiplied the number you gave me (' + myParam + ') and multiplied it by 5 and got ' + (myParam * 5) + '!'
  response.json({message: myResponse})
})

router.post('/signup', (request, response) => {
  console.log('request received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var mysql = require('mysql')
  var con = mysql.createConnection({
    host: '127.0.0.1',
    user: 'oscar',
    password: 'password',
    database: 'myDB'
  })

  var queryString = 'SELECT * FROM UserList WHERE username="'
  queryString += parameters.q
  queryString += '"'
  console.log(queryString)
  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to the server at this time.')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from table.')
      } else if (result.length > 0) {
        response.json({result: 'yes'})
        console.log('yes')
      } else {
        response.json({result: 'no'})
        console.log('no')
      }
    })
  })
})

server.listen(port, () => console.log('Listening on port ' + port))