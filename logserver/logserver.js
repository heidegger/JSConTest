/* version 0.1 */
/* author: Dirk Kienle, Phillip Heidegger */


var sys = require("sys"),  
    http = require("http"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs");

/* BEGIN library functions extended */  
function writeAll (fd, buffer, callback) {
  fs.write(fd, buffer, 0, buffer.length, null, function (writeErr, written) {
    if (writeErr) {
      fs.close(fd, function () {
        if (callback) callback(writeErr);
      });
    } else {
      if (written === buffer.length) {
        fs.close(fd, callback);
      } else {
        writeAll(fd, buffer.slice(written), callback);
      }
    }
  });
}
fs.appendFile = function (path, data, encoding_, callback) {
  var encoding = (typeof(encoding_) == 'string' ? encoding_ : 'utf8');
  var callback_ = arguments[arguments.length - 1];
  var callback = (typeof(callback_) == 'function' ? callback_ : null);
  fs.open(path, 'a', 0666, function (openErr, fd) {
    if (openErr) {
      if (callback) callback(openErr);
    } else {
      var buffer = Buffer.isBuffer(data) ? data : new Buffer(data, encoding);
      writeAll(fd, buffer, callback);
    }
  });
};
/* END library functions extended */  

function nDigits(i,n,fill) {
  if (!n) n = 2;
  if (!fill) fill = '0';
  var s = '' + i;
  while (s.length < n) {
    s = fill + s;
  };
  return s;
};
function dateToString(now) {
  var y = now.getYear();
  if (y < 2000) { 
    y = y + 1900; 
  }
  var d = y + "." + nDigits(now.getMonth()) + '.' + nDigits(now.getDate());
  var t = nDigits(now.getHours()) + ':' + 
    nDigits(now.getMinutes()) + ':' + nDigits(now.getSeconds());
  return d + ' ' + t;
}

function storeData () {
  
}

/* write log entry into file */
function writeToFile(data,response) {
  var filename = './logs/'+data.functionName+'.txt';
  function errHandler(err) {
    if (err) {
      response.doOwnClose('\nsaving data failed');
      throw err;
    }
    console.log('Logdata saved!');      
    response.doOwnClose('\nsaving data successfully <a href="log.txt">to log</a>');
  };

  path.exists(filename,function(exists) {
      console.log(data);
      fs.appendFile(filename, 
                    "[" + dateToString(new Date()) + "]" +
                    "[" + data.exampleId + "]" +
                    " " + data.type + ": " +
                    data.entry + '\n', 
                    errHandler);
  });
};

http.createServer(function(request, response) {  
  var uri = url.parse(request.url).pathname;  
  if ((request.method === 'POST') && (uri === '/log.htm')) {
    console.log('getting log data');
    var log_data = '';
    request.addListener('data', function(chunk) {
      console.log(chunk.toString('ascii'));
      log_data += chunk.toString('ascii');
    });
    request.addListener('end', function () {
      console.log('write log entry to file');
      response.sendHeader(200);
      response.write("<html><head><title>log server</title></head><body>");
      response.write("log entry added!");
      response.doOwnClose = function (s) {
        this.write(s);
        this.end('</body></html>');
      };
      log = require('querystring').parse(log_data);
      writeToFile(log,response);
    });
  } else {
    var filename = path.join(process.cwd(), uri);  
    path.exists(filename, function(exists) {
      if(!exists) {  
        response.sendHeader(404, {"Content-Type": "text/plain"});  
        response.write("404 Not Found\n");  
        response.end();  
        return;  
      }  
      fs.readFile(filename, "binary", function(err, file) {  
        if(err) {  
          response.sendHeader(500, {"Content-Type": "text/plain"});  
          response.write(err + "\n");  
          response.end();  
          return;  
        }  
        console.log("send file: " + filename);
        response.sendHeader(200);  
        response.write(file, "binary");  
        response.end();  
      });
    });  
  }  
}).listen(8080);  
  
sys.puts("Server running at http://localhost:8080/");  

