const fs = require("fs");
var btoa = require('btoa');

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

function createUserFile(name,a=true){
  var userFile=__dirname+"/../players/"+btoa(name)+".json";
  console.log(userFile);
  if(!fileExist(userFile) || a==false){
    console.log(true);
    fs.writeFile(userFile,JSON.stringify({discordName:"",discordId:"",verified:false}),'utf8',function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("done");
    });
  }
}

function eliminateUserFile(name){
  var userFile=__dirname+"/../players/"+btoa(name)+".json";
  if(fileExist(userFile)){
    fs.unlink(userFile, (err) => {
      if(err) {
          return console.log(err);
      }
    });
  }
}

function changeFileName(name,newname){
  var userFile=__dirname+"/../players/"+btoa(name)+".json";
  var newName=__dirname+"/../players/"+btoa(newname)+".json";
  if(fileExist(userFile) && !fileExist(newName)){
    fs.rename(userFile, newName, function (err) {
      if (err) throw err;
      console.log('renamed complete');
    });
  }
}

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    fileExist: fileExist,
    loopDir: loopDir,
    countFiles: countFiles,
    createUserFile: createUserFile,
    eliminateUserFile: eliminateUserFile,
    changeFileName: changeFileName
};
