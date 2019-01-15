import {constants} from '../src/constants.js'
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

var getCon = function () {
  var mysql = require('mysql')
  var con = mysql.createConnection({
    host: constants.mySQLHost,
    user: constants.mySQLUser,
    password: constants.mySQLPassword,
    database: constants.mySQLDatabase
  })
  return con
}

router.post('/signup', (request, response) => {
  console.log('Signup request received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var con = getCon()

  var queryString = 'SELECT * FROM UserList WHERE username="'
  queryString += parameters.q
  queryString += '"'
  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from table for signup request.')
      } else if (result.length > 0) {
        response.json({result: 'yes'})
      } else {
        response.json({result: 'no'})
      }
      console.log('Closing connection...\n')
    })
  })
})

router.post('/login', (request, response) => {
  console.log('Login request received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var con = getCon()

  var queryString = 'SELECT * FROM UserList WHERE username="'
  queryString += parameters.q
  queryString += '" AND password="'
  queryString += parameters.r
  queryString += '"'
  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from the table for login request.')
      } else if (result.length > 0) {
        response.json({result: 'yes'})
      } else {
        response.json({result: 'no'})
      }
      console.log('Closing connection...\n')
    })
  })
})

router.post('/signupNewUser', (request, response) => {
  console.log('\nRequest to add user received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query

  var mkdirp = require('mkdirp')
  mkdirp('./userIMGs/' + parameters.user, function(err) {
    if (err) console.log('Failed to create folder for user' + parameters.user)
    else console.log('Folder creation successful.')
  })

  var con = getCon()

  var queryString = 'INSERT INTO UserList (username, password) VALUES ("'
  queryString += parameters.user
  queryString += '", "'
  queryString += parameters.pass
  queryString += '")'
  console.log('Query String: ' + queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to insert values into database for signupNewUser request.\n')
        return
      }
      response.json({result: 'success'})
      console.log('Closing connection...\n')
    })
  })
})

router.post('/randomWord', (request, response) => {
  console.log('Request to get random word received.')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var con = getCon()

  var queryString = 'SELECT w.* FROM Words AS w JOIN '
  queryString += '(SELECT ROUND(RAND() * (SELECT MAX(id) FROM Words)) AS id) AS x '
  queryString += 'WHERE w.id >= x.id LIMIT 1;'

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to get word from Words table in database.\n')
        response.json({result: 'no'})
        return
      }
      response.json({result: result[0]})
      console.log('Closing connection...\n')
    })
  })

})

router.post('/getUserId', (request, response) => {
  console.log('Request to grab userId by username received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var con = getCon()

  var queryString = 'SELECT userid FROM userlist WHERE username="' + parameters.username + '"'
  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to get userid from UserList table in database.\n')
        response.json('no')
        return
      }
      response.json(result[0])
      console.log('Closing connection...\n')
    })
  })
})

router.post('/submitScore', (request, response) => {
  console.log('Request to submit user score received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var con = getCon()

  var queryString = 'INSERT INTO TestResults (testtype, userid, score, time, date, accuracy) VALUES ("'
  queryString += parameters.testtype + '", "'
  queryString += parameters.userid + '", '
  queryString += parameters.score + ', '
  queryString += parameters.time + ', '
  queryString += 'CURRENT_TIMESTAMP, '
  queryString += parameters.accuracy + ')'
  console.log('Query String: ' + queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to update TestResults table in database.\n')
        response.json({result: 'no'})
        return
      }
      response.json({result: 'yes'})
      console.log('Closing connection...\n')
    })
  })

})

router.post('/getLastWordid', (request, response) => {
  console.log('Request to fetch last autoincrement wordid received')
  var con = getCon()

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query('SELECT Max(wordid) as id FROM WordScore', function (err, result) {
      if (err) {
        console.log('Unable to get wordid from wordScores in database.\n')
        response.json('no')
        return
      }
      response.json(result)
      console.log('Closing connection...\n')
    })
  })
})

router.post('/submitWordData', (request, response) => {
  console.log('Request to submit word data received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var con = getCon()

  var fs = require('fs')
  var path = './userIMGs/' + parameters.username + '/' + parameters.wordid + '_' + parameters.word + '.txt'
  fs.writeFile(path, parameters.drawingSurface, function (err, data) {
    if (err) {
      console.log('Failed to create file: ', err)
    } else {
    console.log('Successfully created new file.')
    }
  })

  var queryString = 'INSERT INTO WordScore (date, word, score, userid) VALUES ('
  queryString += 'CURRENT_TIMESTAMP, '
  queryString += '"' + parameters.word + '", '
  queryString += parameters.score + ', '
  queryString += parameters.userid + ')'
  console.log('Query String: ' + queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to submit word to WordScore table in database.\n')
        response.json({result: 'no'})
        return
      }
      response.json({result: 'yes'})
      console.log('Closing connection...\n')
    })
  })
}),

router.post('/getHighscore', (request, response) => {
  console.log('Request to grab highscore received')
  var urlParts = url.parse(request.url, true)
  var parameters = urlParts.query
  var con = getCon()

  var queryString = 'SELECT MAX(score) AS highscore FROM TestResults WHERE '
  queryString += 'userid=' + parameters.userid
  queryString += ' AND testtype="' + parameters.testtype + '"'
  console.log('Query string: ', queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to get highscore from TestResults in database.\n')
        response.json({highscore: 0})
        return
      }
      response.json(result[0])
      console.log('Closing connection...\n')
    })
  })
})

router.post('/getRecentResults', (request, response) => {
  console.log('Request to grab recent scores received')
  let parameters = url.parse(request.url, true).query
  var con = getCon()

  let queryString = 'SELECT * FROM ('
  queryString += 'SELECT * FROM ' + parameters.table
  queryString += ' WHERE userid=' + parameters.userid + ' '
  if(parameters.table === 'TestResults') queryString += 'AND testtype="' + parameters.testtype + '" '
  queryString += 'ORDER BY date DESC LIMIT ' + parameters.number + ') sub '
  queryString += 'ORDER BY date ASC'
  console.log('Query String: ', queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to get recent test scores from table in database.\n')
        response.json('no')
        return
      }
      response.json({results: result})
      console.log('Closing connection...\n')
    })
  })
})

router.post('/getAvgScores', (request, response) => {
  console.log('Request to return average scores received')
  let parameters = url.parse(request.url, true).query
  var con = getCon()

  let queryString = 'SELECT AVG(time) as avg_time, AVG(score) as avg_score, AVG(accuracy) as avg_accuracy FROM testresults WHERE testType="'
  queryString += parameters.type + '"'

  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to get average scores from TestScores table in database.\n')
        response.json('no')
        return
      }
      response.json(result)
      console.log('Closing connection...\n')
    })
  })
})

server.listen(port, () => console.log('Listening on port ' + port))