/**
 * Starts express.js server, specifying port to listen on and which urls to allow requests from.
 * Also routes each request to its appropriate POST function, which contains things like file management and SQL queries.
 */
import {constants} from '../src/constants.js'
const express = require('express')
const mysql = require('mysql')
const url = require('url')
const server = express()
const router = express.Router()
/**
 * Specifies list of URLs from constants file which server will allow requests from.
 * Currently only contains the express server itself and the frontend server.
 */
const originWhitelist = [constants.serverURL, constants.frontendURL]

/**
 * Links router to server, and specifies that all file requests must pass through {string} /api directory
 */
server.use('/api', router)

/**
 * Handles routing of POST requests to their javascript functions, 
 *   and also checks if request is made from a trusted origin and adding appropriate response headers.
 * {param} request : object contains information about the request source, including its origin url, 
 *   headers, url parameters, etc.
 * {param} response : object that contains the response json file, as well as response headers.
 * {param} next : function that is called to pass request onto its proper respurce.
 */
router.use((request, response, next) => {  
  /**
   * isolates url from request object
   */
  let origin = request.headers.origin;
  console.log('Request received from ' + origin);

  /**
   * {function} .indexOf() returns -1 if it cannot find {string} origin in the {list} originWhiteList, which contains the trusted urls.
   * If it cannot find the url, it will not execute any subsequent resource.
   */
  if (originWhitelist.indexOf(origin) > -1) {
    /**
     * {header} Access-Control-Allow-Origin : allows the url {string} origin to access the resource in a cross-site manner. Prevents
     *   any other url from being able to make cross-domain requests to the server.
     * {header} Access-Control-Allow-Methods : set with {string} POST to allow a POST request as a viable query method.
     * {header} Access-Control-Allow-Headers : set with {string} content-type to tell client what type the returned content actually
     *   is, {string} X-Requested-With defines how the request was made. Used to avoid access errors.
     */
    response.setHeader('Access-Control-Allow-Origin', origin);
    console.log('Found whitelisted origin.')
    response.setHeader('Access-Control-Allow-Methods', 'POST');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
    next();
  } else {
    console.log('Request recieved from untrusted url.')
  }
})

/**
 * Creates a generic mysql connection through {object} con, and returns that object.
 * mysql.createConnection requires server credentials stored in an object as a parameter. Credentials are
 *   stored in constants file for easy maintainance.
 */
var getCon = function () {
  var con = mysql.createConnection({
    host: constants.mySQLHost,
    user: constants.mySQLUser,
    password: constants.mySQLPassword,
    database: constants.mySQLDatabase
  })
  return con
}

/**
 * Resource that handles signup requests. Checks if username already exists in database.
 *   If username already exists it returns {string} no, and the client informs the user that their username has already been
 *   taken.
 */
router.post('/signup', (request, response) => {
  console.log('Signup request received')
  /**
   * Parse url parameters from the requesting url.
   */
  let parameters = url.parse(request.url, true).query

  /**
   * Make connection to mysql database
   */
  let con = getCon()

  /**
   * Selects any record from the database where the usernames match.
   * Query string is sanitised using {function} mysql.format(), which escapes any parameters indicated by {char} ? .
   *   In this case, as parameters.q is escaped as it is provided from a text input from the user. Prevents against
   *   SQL injection attacks.
   */
  let queryString = mysql.format('SELECT * FROM UserList WHERE username = ?', [parameters.q])
  console.log(queryString)

  /**
   * Initialise connection with mysql database.
   * {param} function(err) : breaks connection if an error is returned through {param} err.
   */
  con.connect(function (err) {
    if (err) {
      console.log('Unable to connect to database.\n')
      return
    }
    console.log('Connected to MySQL database.')
    /**
     * Initialises a database query, using {param} queryString as the query string.
     * {param} function(err, result) details how the resource should deal with the server's response
     *   which is given in {param}{object} result.
     *   If {param} err is true, then it breaks connection.
     */
    con.query(queryString, function (err, result) {
      if (err) {
        console.log('Unable to find any results from table for signup request.')
      /**
       * If the database has returned any record, the result object will have a non-zero length. Any 
       *   record returned must be a matching username. This means the user's username has already been taken.
       *   The response is subsequently loaded with a json object containing the response {string} yes.
       */
      } else if (result.length > 0) {
        response.json({result: 'yes'})
        /**
         * If the length is zero, then the response is loaded with the response {string} no.
         */
      } else {
        response.json({result: 'no'})
      }
      console.log('Closing connection...\n')
    })
  })
})

/**
 * Resource that handles login requests. Checks if user's username and password match any existing user records.
 */
router.post('/login', (request, response) => {
  console.log('Login request received')
  let parameters = url.parse(request.url, true).query

  let con = getCon()

  /**
   * Selects any record which matches the request username and password. User controlled input is sanitised.
   */
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
      /**
       * Returns {string} yes if the mysql response table has at least 1 record, indicating the user credentials are valid.
       */
      } else if (result.length > 0) {
        response.json('yes')
      } else {
        response.json('no')
      }
      console.log('Closing connection...\n')
    })
  })
})

/**
 * Resource that handles the event of a successful sign up.
 * Creates a file directory in their name to store their image files, and adds their credentials to
 *   {table} UserList
 */
router.post('/signupNewUser', (request, response) => {
  console.log('\nRequest to add user received')
  let parameters = url.parse(request.url, true).query

  let mkdirp = require('mkdirp')
  /**
   * Creates a new directory on the server within {string} /userIMGs to store that user's image files.
   * Uses the user's username as the name of the directory, as it is guaranteed to be unique.
   */
  mkdirp('./userIMGs/' + parameters.user, function(err) {
    if (err) console.log('Failed to create folder for user' + parameters.user)
    else console.log('Folder creation successful.')
  })

  let con = getCon()

  /**
   * Inserts new user's username and password into {table} UserList
   */
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

/**
 * Resource that returns a random word from the large dictionary stored on the server - {table} Words.
 */
router.post('/randomWord', (request, response) => {
  console.log('Request to get random word received.')
  let con = getCon()

  /**
   * Executing this query in BIDMAS order...
   * The largest id from the Words table is found using {aggregate function} MAX().
   * {function} RAND() returns a random floating point number between 0 and 1. This is multiplied by the largest
   *   id in the table, and is then rounded to the nearest integer using {aggregate function} ROUND(). This in
   *   essence selects a random id from the table between 0 and {aggregate function} MAX(id), 
   *   and is returned as {string} id
   * {table} Words is then joined as {char} w to our previous id, identified as {object} x.id. The join condition is that
   *   the {object} w.id is greater than our {object} x.id. This means that the primary key {object} w.id does 
   *   not have to be completely
   *   continuous and can have some gaps where certain id's below the max id do not exist.
   * The join is limited to 1 record, as we only need 1 random word. This prevents wasted processing.
   * This query could have easily been executed using {query} ORDER BY RAND(). However, this is extremely slow as
   *    it generates random values for every record in {table} Words when we in fact only need 1 record.
   */
  let queryString = mysql.format('SELECT w.* FROM Words AS w JOIN (SELECT ROUND(RAND()'
  + ' * (SELECT MAX(id) FROM Words)) AS id) AS x WHERE w.id >= x.id LIMIT 1')

  'SELECT w.* FROM Words AS w JOIN 1542 AS x WHERE w.id >= x.id LIMIT 1'
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
      /**
       * {list} result is a list, with each element in the list being an object representing a record. As only 1
       *   record is returned from our sql query, we access it by using {list} result[0]
       */
      response.json({result: result[0]})
      console.log('Closing connection...\n')
    })
  })

})

/**
 * Resource that returns the {attribute} userid of the username provided in the url
 */
router.post('/getUserId', (request, response) => {
  console.log('Request to grab userId by username received')
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  /**
   * Only returns one record, as usernames and {attribute} userids must be unique.
   */
  let queryString = mysql.format('SELECT userid FROM userlist WHERE username = ?', [parameters.username])
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

/**
 * Resource that enters information about user's test result into {table} TestResults
 */
router.post('/submitScore', (request, response) => {
  console.log('Request to submit user score received')
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  /**
   * Inserts information about user's recent test into {table} TestResults.
   * {string} CURRENT_TIMESTAMP is converted into a {type} datetime object containing the current time
   *   by the SQL database.
   * As all parameters from {object} url are parsed as strings, They must be converted back to their respective
   *    integer or floating point types before insertion into the query string. This is done using {function}
   *    parseInt and {function} parseFloat respectively.
   */
  let queryString = mysql.format('INSERT INTO TestResults (testtype, userid, score, time, date, accuracy) VALUES(?, ?, ?, ?, ?, ?)',
   [parameters.testtype, parseInt(parameters.userid), parseFloat(parameters.score), parseFloat(parameters.time),
     'CURRENT_TIMESTAMP', parseFloat(parameters.accuracy)])
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

/**
 * Resource that returns the latest auto incremented {attribute} wordid from {table} WordScore.
 *   As auto incremented ids always increase, the latest id will always be the largest, assuming nothing
 *   has been deleted from the database.
 */
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

/**
 * Resource that enters data describing a single word test into the server and database.
 * Saves a copy of the user's writing as a string as {format} base64 PNG, stored in a uniquely generated .txt file under
 *   their username's directory.
 * Stores other test result data into {table} WordScore   
 */
router.post('/submitWordData', (request, response) => {
  console.log('Request to submit word data received')
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  /**
   * {function} .repace() is a {type} String function that replaces the substring 
   *   described in the first parameter with the substringstring in the second.
   * {regex} / /g describes a space character, with {tag} g meaning 'global', which will in turn replace
   *    every occurance of a space in {string} parameters.drawingSurface with {char} +.
   * The reason this is performed is that when the {format} base64 PNG string is passed through the request URL
   *    from the client to the server, {char} + characters are automatically replaced with spaces. Leaving 
   * these spaces in the string without replacing them back will render it unusable.
   */
  parameters.drawingSurface = parameters.drawingSurface.replace(/ /g, '+')
  let fs = require('fs')
  /**
   * The path to the new word file to be created is defined. {string} ./userIMGs/ + {string} parameters.username
   *   describes the user's image file directory, created when they signed up by {resource} /signupNewUser.
   *   {integer} parameters.wordid is guaranteed to be unique, assuming the database hasn't seen any deletions, as
   *   it is an auto incrementing primary key. However, for the sake of maintainance, {string} parameters.word
   *   is added to the file name to illustrate what word the file contains a drawing of. The {string} .txt ending is
   *   added to indicate that the file is a text file.
   */
  let path = './userIMGs/' + parameters.username + '/' + parameters.wordid + '_' + parameters.word + '.txt'
  /**
   * {function} fs.writeFile() writes data described in {string} parameters.drawingSurface to the file path described 
   *   in {param} path. If the file described in {param} path does not exist, a new file is created.
   * {function} function (err, data) logs to the console wether file creation has been successful or not.
   */
  fs.writeFile(path, parameters.drawingSurface, function (err, data) {
    if (err) {
      console.log('Failed to create file: ', err)
    } else {
      console.log('Successfully created new file.')
    }
  })

  /**
   * Inserts test score information into {table} WordScore
   */
  let queryString = mysql.format('INSERT INTO WordScore (date, word, score, userid) VALIES (?, ?, ?, ?)',
  ['CURRENT_TIMESTAMP', parameters.word, parseFloat(parameters.score), parseInt(parameters.userid)])
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

  /**
   * Selects the highest score from {table} TestResults where {attribute} userid and {attribute} testtype match
   *   those given in the url parameters, using {aggregate function} MAX().
   */
  let queryString = mysql.format('SELECT MAX(score) AS highscore FROM TestResults WHERE userid = ? AND testtype = ?',
  [parseInt(parameters.userid), parameters.testtype])
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

  /**
   * The double questionmark {string} ?? here indicates that the value {string} parameters.table should be escaped
   *    as an identifier, not a simple string. In SQL, strings are identified with single quotes '' and 
   *    identifiers (table names, function names, etc) with ``.
   * A check is made to see if {string} parameters.table has been set to {table} TestResults. {table} TestResults 
   *    stores multiple types of test, so an extra {SQL query} AND testtype = clause must be added to ensure
   *    scores are fetched from the correct test type.
   * Scores are then fetched where the {attribute} userid matches the id provided in therequest query. They
   *    ordered by date and only the number of records set by {integer} parameters.number are put in the final table.
   *    This effectively returns the {integer} parameters.number most recent test scores for that user.
   * The scores are then re-ordered in ascending order. This is because these values are to be plotted on a graph,
   *    and the graph should have oldest scores first (towards the origin) and latest scores last.
   */
  let rawQueryString = 'SELECT * FROM (SELECT * FROM ?? WHERE userid = ?'
  if(parameters.table === 'TestResults') rawQueryString += ' AND testtype = ' + con.escape(parameters.testtype)
  rawQueryString += ' ORDER BY date DESC LIMIT ?) sub ORDER BY date ASC'
  let queryString = mysql.format(rawQueryString, [parameters.table, parseInt(parameters.userid), parseInt(parameters.number)])
  console.log(queryString)

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

/**
 * Resource that returns the global average score, accuracy and time of a test type.
 */
router.post('/getAvgScores', (request, response) => {
  console.log('Request to return average scores received')
  let parameters = url.parse(request.url, true).query
  let con = getCon()

  /**
   * {aggregate function} AVG() is used to average all the attributes in the records returned.
   */
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

/**
 * Recourse that returns the {format} base65 PNG string describing an image corresponding to
 *    the matching username and {attribute} wordid.
 */
router.post('/getImageUrl', (request, response) => {
  console.log('Request to return image url received')
  let parameters = url.parse(request.url, true).query

  let fs = require('fs')
  /**
   * {function} fs.readirSync() stores all file names found in the user's directory ({string} ./userIMGs/parameters.username)
   *    as individual strings in {list} files.
   */
  let files = fs.readdirSync('./userIMGs/' + parameters.username)
  /**
   * Iterate f over the list of file names.
   */
  for (var f of files) {
    /**
     * This statement will return true if the file name, {string} f, contains the wordid specified in 
     *    {integer} parameters.id.
     * {integer} parameters.id is guaranteed to be unique as it is a primary key, so only 1 file name in the user's
     *    directory can contain it. It must be parsed to a string using {function} .toString() as
     *    {function} .includes() only accepts string input.
     */
    if (f.includes(parameters.id.toString())) {
      /**
       * Read the file f and store its contents in {string} returnURL
       */
      let returnURL = fs.readFileSync('./userIMGs/' + parameters.username + '/' + f).toString()
      /**
       * The word stored in {string} f's name is extracted and stored in {variable} word. {function} .replace()
       *    deletes the initial {attribute} wordid (eg {string} 113_ or 29_), and then deletes the {string}
       *    .txt ending. This leaves just the word on its own.
       */
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

/**
 * Starts routine to let server listen for requests on whichever port is specified in the constants file.
 * Inline arrow function logs port number to console.
 */
server.listen(constants.serverPort, () => console.log('Listening on port ' + constants.serverPort))