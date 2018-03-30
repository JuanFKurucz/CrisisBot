const {readFile,writeFile,fileExist,loopDir}=require("./lib/handleFile.js");
var btoa = require('btoa');

function loadData(author,callback){
  var dataFolder=__dirname+"/players/"+author.id+".json";
  var data={};
  if (fileExist(dataFolder)) {
    readFile(dataFolder,callback);
  } else {
    var newProfile={
      "Nombre":author.username+"#"+author.discriminator
    };
    writeFile(__dirname+"/players/"+author.id+".json",JSON.stringify(newProfile));
    callback(null);
  }
}

function checkIfRegistered(discordName,callback){
  var dirname=__dirname+"/players/";
  var stopIt=false;
  var i=0;
  loopDir(dirname,function(content){
    i++;
    var object = JSON.parse(content);
    if(discordName==object.discordName){
      stopIt=true;
      callback("Usted ya esta registrado");
    }
    if(stopIt==false && i==filenames.length){
      callback("");
    }
  })
}

function registrar(author,inGame_nick,callback){
  var dataFolder=__dirname+"/players/";
  var player=btoa(inGame_nick);
  var discordName=author.username+"#"+author.discriminator;
  var playerFile=dataFolder+player+".json";
  if (fileExist(playerFile)) {
    checkIfRegistered(discordName,function(result){
      readFile(playerFile,function(fdata){
        var s=false;
        if(result==""){
          var object = JSON.parse(fdata);
          if(object.discordName==""){
            object.discordName=discordName;
            object.verified=false;
            writeFile(__dirname+"/players/"+player+".json",JSON.stringify(object));
            result="Usuario registrado con exito, esperando verificacion. Contacte con un administrador";
            s=true;
          } else if (discordName==object.discordName) {
            result="Usted ya esta registrado con este nick";
          } else {
            result="El usuario ya esta tomado por "+ object.discordName;
          }
        }
        callback(result,s);
      });
    });
  } else {
    callback("El nick ingresado no es miembro del clan Crisis - S35 Shieldon");
  }
}

module.exports = {
    loadData: loadData,
    registrar: registrar
};
