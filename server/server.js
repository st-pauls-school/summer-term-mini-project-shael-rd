/**
 * 
 */
import {constants} from '../src/constants.js'
const express = require('express')
const mysql = require('mysql')
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
  let parameters = url.parse(request.url, true).query

  let con = getCon()

  let queryString = mysql.format('SELECT * FROM UserList WHERE username = ?', [parameters.q])
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
  let parameters = url.parse(request.url, true).query

  let con = getCon()

  let queryString = mysql.format('SELECT * FROM UserList WHERE username = ? AND password = ?', [parameters.q, parameters.r])
  console.log(queryString)

  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      response.json('connect_error')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from the table for login request.')
      } else if (result.length > 0) {
        response.json('yes')
      } else {
        response.json('no')
      }
      console.log('Closing connection...\n')
    })
  })
})

router.post('/signupNewUser', (request, response) => {
  console.log('\nRequest to add user received')
  let parameters = url.parse(request.url, true).query

  let mkdirp = require('mkdirp')
  mkdirp('./userIMGs/' + parameters.user, function(err) {
    if (err) console.log('Failed to create folder for user' + parameters.user)
    else console.log('Folder creation successful.')
  })

  let con = getCon()

  let queryString = mysql.format('INSERT INTO UserList (username, password) VALUES (?, ?)', [parameters.user, parameters.pass])
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
  let con = getCon()

  
  let queryString = mysql.format('SELECT w.* FROM Words AS w JOIN (SELECT ROUND(RAND() * (SELECT MAX(id) FROM Words)) AS id) AS x WHERE w.id >= x.id LIMIT 1')

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
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  let queryString = mysql.format('Select userid FROM userlist WHERE username = ?', [parameters.username])
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
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  
  let queryString = mysql.format('INSERT INTO TestResults (testtype, userid, score, time, date, accuracy) VALUES(?, ?, ?, ?, ?, ?)',
   [parameters.testtype, parameters.userid, parameters.score, parameters.time, 'CURRENT_TIMESTAMP', parameters.accuracy])
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
  let con = getCon()

  let queryString = mysql.format('SELECT Max(wordid) as id FROM WordScore')
  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    con.query(queryString, function (err, result) {
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
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  parameters.drawingSurface = parameters.drawingSurface.replace(/ /g, '+')
  let fs = require('fs')
  let path = './userIMGs/' + parameters.username + '/' + parameters.wordid + '_' + parameters.word + '.txt'
  fs.writeFile(path, parameters.drawingSurface, function (err, data) {
    if (err) {
      console.log('Failed to create file: ', err)
    } else {
      console.log('Successfully created new file.')
    }
  })

  let queryString = mysql.format('INSERT INTO WordScore (date, word, score, userid) VALIES (?, ?, ?, ?)',
  ['CURRENT_TIMESTAMP', parameters.word, parameters.score, parameters.userid])
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
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  let queryString = mysql.format('SELECT MAX(score) AS highscore FROM TestResults WHERE userid = ? AND testtype = ?',
  [parameters.userid, parameters.testtype])
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
  let con = getCon()

  let rawQueryString = 'SELECT * FROM (SELECT * FROM ? WHERE userid = ?'
  if(parameters.table === 'TestResults') rawQueryString += ' AND testtype = ' + con.escape(parameters.testtype)
  rawQueryString += ' ORDER BY date DESC LIMIT ?) sub ORDER BY date ASC'
  let queryString = mysql.format(rawQueryString, [parameters.table, parameters.userid, parameters.number])

  /*
  let queryString = 'SELECT * FROM ('
  queryString += 'SELECT * FROM ' + parameters.table
  queryString += ' WHERE userid=' + parameters.userid + ' '
  if(parameters.table === 'TestResults') queryString += 'AND testtype="' + parameters.testtype + '" '
  queryString += 'ORDER BY date DESC LIMIT ' + parameters.number + ') sub '
  queryString += 'ORDER BY date ASC'
  console.log('Query String: ', queryString)
  */

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
  let con = getCon()

  let queryString = mysql.format('SELECT AVG(time) as avg_time, AVG(score) as avg_score, AVG(accuracy) as avg_accuracy' +
' FROM testresults WHERE testType = ?', [parameters.type])
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

router.post('/getImageUrl', (request, response) => {
  console.log('Request to return image url received')
  let parameters = url.parse(request.url, true).query

  let fs = require('fs')
  let files = fs.readdirSync('./userIMGs/' + parameters.username)
  for (var f of files) {
    if (f.includes(parameters.id.toString())) {
      let returnURL = fs.readFileSync('./userIMGs/' + parameters.username + '/' + f).toString()
      let word = f.replace(parameters.id.toString() + '_', '')
      word = word.replace('.txt', '')

      response.json({url: returnURL, word: word})
      console.log('Successfully found file with id: ', parameters.id)
      return
    }
  }
  response.json('no')
  console.log('Failed to find file with id: ', parameters.id)
})

server.listen(port, () => console.log('Listening on port ' + port))