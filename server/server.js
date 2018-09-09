import constants from '../src/constants.js'
const express = require('express')
const url = require('url')
const server = express()
const router = express.Router()
const port = constants.serverPort
const originWhitelist = [constants.serverURL, constants.frontendURL]

server.use('/api', router)

router.use((request, response, next) => {  
  let origin = request.headers.origin;
  console.log('Server info: Request received from ' + origin);

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

router.post('/signup', (request, response) => {
  console.log('Signup request received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var mysql = require('mysql')
  var con = mysql.createConnection({
    host: constants.mySQLHost,
    user: constants.mySQLUser,
    password: constants.mySQLPassword,
    database: constants.mySQLDatabase
  })

  var queryString = 'SELECT * FROM UserList WHERE username="'
  queryString += parameters.q
  queryString += '"'
  console.log(queryString)
  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to th database.')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from table.')
      } else if (result.length > 0) {
        response.json({result: 'yes'})
      } else {
        response.json({result: 'no'})
      }
      console.log('Closing connection...')
    })
  })
})

router.post('/login', (request, response) => {
  console.log('Login request received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var mysql = require('mysql')
  var con = mysql.createConnection({
    host: constants.mySQLHost,
    user: constants.mySQLUser,
    password: constants.mySQLPassword,
    database: constants.mySQLDatabase
  })

  var queryString = 'SELECT * FROM UserList WHERE username="'
  queryString += parameters.q
  queryString += '" AND password="'
  queryString += parameters.r
  queryString += '"'
  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to the database.')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from the table.')
      } else if (result.length > 0) {
        response.json({result: 'yes'})
      } else {
        response.json({result: 'no'})
      }
      console.log('Closing connection...')
    })
  })
})

server.listen(port, () => console.log('Listening on port ' + port))