var fs = require("fs");
var http = require("http");
var _mysql = require('mysql');

var url = require("url");
var multipart = require("multipart");
var sys = require("sys");
var events = require("events");
var posix = require("posix");

var formidable = require('formidable');

var util = require('util');

var sessions = {};




//SET UP DATABASE
var HOST = 'localhost';
var PORT = 3306;
var MYSQL_USER = 'jeffrey';
var MYSQL_PASS = 'mypass';
var DATABASE = 'hackathon5';

var mysql = _mysql.createConnection({
    host: HOST,
    port: PORT,
    user: MYSQL_USER,
    password: MYSQL_PASS,
});


var server = http.Server(function (request, response) {
console.log("server received something!!!");
    switch (url.parse(request.url).pathname) {
        case "/":  // client code delivery
            fs.readFile("client_es.html", function (error, content) {
                if (error) {
                    response.writeHead(404);
                    response.end();
                    return;
                }
                response.writeHead(200, {"Content-Type": "text/html"});
                response.end(content);
            });
            break;

        case "/stoc":  // server-to-client
			console.log("received stoc");
            var sessionId = parts[2];
            var userId = parts[3];
            if (!sessionId || !userId) {
                response.writeHead(400);
                response.end();
                break;
            }
            console.log("@" + sessionId + " - " + userId + " joined.");

            response.writeHead(200, {"Content-Type": "text/event-stream"});

            function keepAlive(resp) {
                resp.write(":\n");
                resp.keepAliveTimer = setTimeout(arguments.callee, 30000, resp);
            }
            keepAlive(response);  // flush headers + keep-alive

            var session = sessions[sessionId];
            if (!session)
                session = sessions[sessionId] = {"users" : {}};

            if (!session.users[userId]) {
                session.users[userId] = {};
                for (var pname in session.users) {
                    var esResp = session.users[pname].esResponse;
                    if (esResp) {
                        clearTimeout(esResp.keepAliveTimer);
                        keepAlive(esResp);
                        esResp.write("event:join\ndata:" + userId + "\n\n");
                        response.write("event:join\ndata:" + pname + "\n\n");
                    }
                }
            }

            session.users[userId].esResponse = response;

            request.on("close", function () {
                for (var pname in session.users) {
                    if (pname == userId)
                        continue;
                    var esResp = session.users[pname].esResponse;
                    esResp.write("event:leave\ndata:" + userId + "\n\n");
                }
                delete session.users[userId];
                console.log("@" + sessionId + " - " + userId + " left.");
            });
            break;

        case "/ctos":  // client-to-server
            var sessionId = parts[2];
            var userId = parts[3];
            var peerId = parts[4];
            var peer;
            var session = sessions[sessionId];
            if (!session || !(peer = session.users[peerId])) {
                response.writeHead(400);
                response.end();
                break;
            }

            var body = "";
            request.on("data", function (data) { body += data; });
            request.on("end", function () {
                console.log("@" + sessionId + " - " + userId + " => " + peerId + " :");
                console.log(body);
                var evtdata = "data:" + body.replace(/\n/g, "\ndata:") + "\n";
                peer.esResponse.write("event:user-" + userId + "\n" + evtdata + "\n");
            });

            response.writeHead(204);
            response.end();
            break;
		case "/imgpost":
			/*console.log("receiving image post");
			response.on('data', function (chunk) {
                fs.writeFile(dir+'image.png', chunk, function (err) {
                    if (err) throw err;
                    console.log('It\'s saved to '+dir+'image.png!');
                });
            });
			response.writeHead(204);
            response.end();*/
			//upload_file(request, response);
			upload2(request,response);
			//upload3(request,response);
			//response.writeHead(204);
            //response.end();
			break;
		case "/getuploadform":
			display_form(request,response);
			break;
		case "/lookupPledge":
			//SET UP DATABASE
			var DATABASE = 'hackathon5';

			var mysql = _mysql.createConnection({
				host: 'localhost',
				port: 3306,
				user: 'jeffrey',
				password: 'mypass',
			});
		
			console.log("[200] " + request.method + " to " + request.url);
			
			request.addListener("end", function() {
				//parse request.content and do stuff with it
				var userID = request.url.substring(request.url.indexOf("username")+9, request.url.length);
				
				//connect to DB
				console.log("connecting to "+DATABASE+"...");
				mysql.connect();
				console.log("connection successful.");
				mysql.query('use ' + DATABASE);
				
				
				//query the DB for user
				console.log("Fetching donation for user: "+userID);
				var query = mysql.query("CALL fetch_donation('"+userID+"')", function(err, rows, fields) {
					if (err) throw err;
					
					response.writeHead(200, "OK", {'Content-Type': 'application/json'});
					response.write(JSON.stringify(rows[0]));
				});
				
				console.log("Done.");
				mysql.end();
			});
			break;
		case "/submitPledge":
			//SET UP DATABASE
			var DATABASE = 'hackathon5';

			var mysql = _mysql.createConnection({
				host: 'localhost',
				port: 3306,
				user: 'jeffrey',
				password: 'mypass',
			});
		
			console.log("[200] " + request.method + " to " + request.url);
			
			request.addListener("end", function() {
				//parse query string for user name
				var donId = request.url.substring(request.url.indexOf("dId")+4, request.url.indexOf("&"));
				var donData = JSON.parse(request.url.substring(request.url.indexOf("&data=")+7, request.url.length));
				
				console.log(donData);
				console.log(donId);
				
				//connect to DB
				console.log("connecting to "+DATABASE+"...");
				mysql.connect();
				console.log("connection successful.");
				mysql.query('use ' + DATABASE);
				
				for(var i=0; i<donData.length; i++){
					console.log("Pushing donation pledge to DB: "+userID);
					
					var vals; 	//TODO: save the individiual attributes in vals, comma separated
					
					var query = mysql.query("INSERT INTO DONATION VALUES("+vals+")", function(err, rows, fields) {
						if (err) throw err;
						
						//TODO: respond with success or failure!
					//	response.writeHead(200, "OK", {'Content-Type': 'application/json'});
					//	response.write(JSON.stringify(rows[0]));
					});
				}

				console.log("Done.");
				mysql.end();
			});
			break;
        default:
            response.writeHead(404);
            response.end();
    }
});


function upload3(req,res)
{
/*fs.writeFile('newImage', req.files.image, function (err) {
  if (err) throw err;
  console.log("It's saved");
});*/

var form = new formidable.IncomingForm();

      // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

      form.parse(req, function(err, fields, files) {
        if (err) {

          // Check for and handle any errors here.

          console.error(err.message);
          return;
        }
		console.log(files);
		fs.writeFile(files["upload-file"].name, files["upload-file"],'base64', function (err) {
                      if (err) throw err;
                      console.log('It\'s saved!');
                });
		try{var eeeeeeek = files.upload;console.log("accessed files.upload "+eeeeeeek);}
		catch(eeer){console.log("failed to access files.upload");}
		
		console.log("setting response");
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');

        // This last line responds to the form submission with a list of the parsed data and files.
console.log("ending");
        res.end(util.inspect({fields: fields, files: files}));
      });
  console.log("It's saved?");

}





function upload2(req,res)
{
	var imagedata = '';
    req.setEncoding('binary');
	
	var filename = '';
	
	//req.on('filename', function(fn){
	//	console.log("filename set");
	//	filename = fn;
	//});
	var boundary = '----ThisIsTheBoundary1234567890';
	
    req.on('data', function(chunk){
		if(filename === '')
		{
		//console.log("recvd data "+chunk);
		var eek = chunk.split(boundary);
		//console.log("eek.length = "+eek.length);
		var index = eek[1].indexOf('filename="');
		var fn = eek[1].substring(index+('filename="'.length));
		var fn = fn.substring(0,fn.indexOf('"'));
        console.log("filename = "+fn);
		//chunk = eek[2].substring(eek[2].indexOf("Content-Type")+'Content-Type: image/png'.length);
		filename = fn;
		imagedata += chunk;
		}
		else
		{
			/*var index = chunk.indexOf(boundary);
			if (index != -1)
			{
				console.log("parsed the boundary");
				chunk = chunk.substring(0,index);
			}*/
			//console.log("received chunk, filename already set");
			imagedata += chunk;
		}
    });

    req.on('end', function(){
		var eek = imagedata.split(boundary);
		console.log("eek.length = "+eek.length);
		//console.log("is this it? "+eek[2]);
		imagedata = eek[3];
        fs.writeFile('tempvid/'+filename+'.png', imagedata, 'binary', function(err){
            if (err) throw err
            console.log('File saved as '+'tempvid/'+filename+'.png'+'.');
        });
    });
console.log("setting response");
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
		res.end();
}

/*
 * Display upload form
 */
function display_form(req, res) {
    res.setHeader("Content-Type", "text/html");
    res.write(
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="upload-file">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
    res.end();
}

/*
 * Write chunk of uploaded file
 */
function write_chunk(request, fileDescriptor, chunk, isLast, closePromise) {
    // Pause receiving request data (until current chunk is written)
    request.pause();
    // Write chunk to file
    sys.debug("Writing chunk");
    posix.write(fileDescriptor, chunk).addCallback(function() {
        sys.debug("Wrote chunk");
        // Resume receiving request data
        request.resume();
        // Close file if completed
        if (isLast) {
            sys.debug("Closing file");
            posix.close(fileDescriptor).addCallback(function() {
                sys.debug("Closed file");
                
                // Emit file close promise
                closePromise.emitSuccess();
            });
        }
    });
}

/*
 * Handle file upload
 */
function upload_file(req, res) {
    // Request body is binary
    req.setEncoding("binary");

    // Handle request as multipart
    var stream = new multipart.Stream(req);
    
    // Create promise that will be used to emit event on file close
    var closePromise = new events.Promise();

    // Add handler for a request part received
    stream.addListener("part", function(part) {
        sys.debug("Received part, name = " + part.name + ", filename = " + part.filename);
        
        var openPromise = null;

        // Add handler for a request part body chunk received
        part.addListener("body", function(chunk) {
            // Calculate upload progress
            var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
            var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);
     
            sys.debug("Uploading " + mb + "mb (" + progress + "%)");

            // Ask to open/create file (if not asked before)
            if (openPromise == null) {
                sys.debug("Opening file");
                openPromise = posix.open("./uploads/" + part.filename, process.O_CREAT | process.O_WRONLY, 0600);
            }

            // Add callback to execute after file is opened
            // If file is already open it is executed immediately
            openPromise.addCallback(function(fileDescriptor) {
                // Write chunk to file
                write_chunk(req, fileDescriptor, chunk, 
                    (stream.bytesReceived == stream.bytesTotal), closePromise);
            });
        });
    });

    // Add handler for the request being completed
    stream.addListener("complete", function() {
        sys.debug("Request complete");

        // Wait until file is closed
        closePromise.addCallback(function() {
            // Render response
            res.sendHeader(200, {"Content-Type": "text/plain"});
            res.sendBody("Thanks for playing!");
            res.finish();
        
            sys.puts("\n=> Done");
        });
    });
}


var port = 8084;
console.log("starting server...");
server.listen(port);
console.log("server listening on port "+port);