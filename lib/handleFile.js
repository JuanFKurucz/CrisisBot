const fs = require("fs");

function readFile(file,callback,encoding="utf8"){
  fs.readFile(file,encoding, function (err, content) {
    if (err) { throw err; }
    callback(content);
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

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    fileExist: fileExist,
    loopDir: loopDir
};
