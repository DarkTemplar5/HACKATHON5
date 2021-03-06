var video = document.querySelector('#video');
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;
var fs = null; // file system 
var error = 0; // if file system API error
var _stop = false; // if user presses stop
var frames = 0; // index for the image files (files0 files1 etc)
var _files = []; // store the path of the images recoreded


function errorHandler(err){
error =1 ;
 var msg = 'An error occured: ';
 
    switch (err.code) {
        case FileError.NOT_FOUND_ERR:
            msg += 'File or directory not found';
            break;
 
        case FileError.NOT_READABLE_ERR:
            msg += 'File or directory not readable';
            break;
 
        case FileError.PATH_EXISTS_ERR:
            msg += 'File or directory already exists';
            break;
 
        case FileError.TYPE_MISMATCH_ERR:
            msg += 'Invalid filetype';
            break;
 
        default:
            msg += 'Unknown Error';
            break;
    };
 
 console.log(msg);
};

var stopRec = function() {
    // stop video recording
    _stop = true;
}

var stop = document.getElementById('stop');
stop.addEventListener('click', stopRec, false);

var initDirectory = function(fs) {
    fs.root.getDirectory('Video', {create: true}, function(dirEntry) {
        console.log('You have just created the ' + dirEntry.name + ' directory.');

        document.getElementById('replay').addEventListener('click', replayVideo, false);

        fs.root.getDirectory('Video', {}, function(dirEntry){
          var dirReader = dirEntry.createReader();
          dirReader.readEntries(function(entries) {
            for(var i = 0; i < entries.length; i++) {
              var entry = entries[i];
              if (entry.isDirectory){
                console.log('Directory: ' + entry.fullPath);
              }
              else if (entry.isFile){
                console.log('File: ' + entry.fullPath);
              // remove comment to delete all files
                _files.push(entry.fullPath);
                frames = parseInt(entry.fullPath[entry.fullPath.length-1]);
              }
            }
         
          }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}

var deleteReplay = function() {
        fs.root.getDirectory('Video', {}, function(dirEntry){
          var dirReader = dirEntry.createReader();
          dirReader.readEntries(function(entries) {
            if(!entries.length) alert('nothing to delete');
            for(var i = 0; i < entries.length; i++) {
              var entry = entries[i];
              if (entry.isFile){
                 fs.root.getFile(entry.fullPath, {create: false}, function(fileEntry) {
                  fileEntry.remove(function() {
                    console.log('File successufully removed.');
                  }, errorHandler);
                }, errorHandler);
              }
            }
         
          }, errorHandler);
        }, errorHandler);
}

document.getElementById('delete-replay').addEventListener('click', deleteReplay, false);

var writeToFile = function(name, data) {

    fs.root.getFile('Video/' + name, {create: true, exclusive: true}, function(fileEntry) {
        console.log('A file ' + fileEntry.name + ' was created successfully.');
            fs.root.getFile('Video/' + fileEntry.name, {create: false}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
                console.log('writing to ' + 'Video/' + fileEntry.name)
                _files.push('Video/' + fileEntry.name);
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                var bb = new BlobBuilder();
                bb.append(data);
                fileWriter.write(bb.getBlob('text/plain'));
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}


var initFs = function(filesys) {
    fs = filesys;
    setTimeout(initDirectory(fs), 500);
}

var frameimages = [];

var replayVideo = function(idx) {
    // reads through all the images and show them (image path stored in _files)
    stopRec(); // stop video recording
    video.style.display = 'none'; // hide the video to see the recording
    if(idx.clientX) idx = 0;
    if(_files[idx] === undefined) {
        alert('nothing to play');
        return;
    }
    var img = document.getElementById('replay-screen');
    fs.root.getFile(_files[idx], {}, function(fileEntry) {
        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                    img.src = this.result;
                if(++idx < _files.length) 
				{
					console.log("playing video "+idx);
                    setInterval(replayVideo(idx), 2*1000); // y u no work !?
				}
            };
            reader.readAsText(file);
        }, errorHandler);
    }, errorHandler);
}

var readFile = function(filename) {
    fs.root.getFile(filename, {}, function(fileEntry) {
        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                console.log(this.result);
            };
            reader.readAsText(file);
        }, errorHandler);
    }, errorHandler);
}

document.getElementById('play').addEventListener('click', function(){
        navigator.webkitGetUserMedia('video', function(stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        video.controls = false;
        localMediaStream = stream;
    }, function(){
            alert('no support for webkitGetUserMedia()');
    });


    var back = document.getElementById('canvas');
    var backcontext = back.getContext('2d');

    cw = 240;
    ch = 400;
    back.width = cw;
    back.height = ch;
    draw(video, backcontext, cw, ch);

    function draw(v, bc, w, h) {
         bc.drawImage(v, 0, 0, w, h);
            var stringData=canvas.toDataURL();
            if(fs !== null) {
                writeToFile('frames' + frames++, stringData);
            }
            if(!_stop) 
                setTimeout(function(){ draw(v, bc, w, h); }, 200); // the timeout here decides video rec framerate
    }
}, false);

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.TEMPORARY, 10*1024*1024, initFs, errorHandler);