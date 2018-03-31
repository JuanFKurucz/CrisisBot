const fs = require("fs");

function readFile(file,callback,encoding="utf8"){
  fs.readFile(file,encoding, function (err, content) {
    if (err) { throw err; }
    callback(content,file);
  });
}

function writeFile(file,content,callback=null,encoding="utf8"){
  if(callback==null){
    callback=function(){}
  }
  fs.writeFile(file,content,encoding,function(err) {
      if (err) { throw err; }
      callback();
  });
}

function fileExist(file){
  if (fs.existsSync(file)) {
    return true;
  } else {
    return false;
  }
}

function loopDir(dir,callback){
  fs.readdir(dir, function(err, filenames) {
    if (err) { throw err; }
    filenames.forEach(function(filename) {
      readFile(dir + filename,callback);
    });
  });
}

function countFiles(dir,callback){
  fs.readdir(dir, function(err, filenames) {
    if (err) { throw err; }
    var i=0;
    var stopIt=false;
    filenames.forEach(function(filename) {
      i++;
      if(stopIt==false && i==filenames.length){
        callback(i);
      }
    });
  });
}

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    fileExist: fileExist,
    loopDir: loopDir,
    countFiles: countFiles
};
