const {countFiles,readFile,writeFile,fileExist,loopDir}=require("./handleFile.js");
var btoa = require('btoa');
var atob = require('atob');

function loadData(author,callback){
  var dataFolder=__dirname+"/../players/"+author.id+".json";
  var data={};
  if (fileExist(dataFolder)) {
    readFile(dataFolder,callback);
  } else {
    var newProfile={
      "Nombre":author.username+"#"+author.discriminator
    };
    writeFile(__dirname+"/../players/"+author.id+".json",JSON.stringify(newProfile));
    callback(null);
  }
}

function checkIfRegistered(discordName,callback){
  var dirname=__dirname+"/../players/";
  var stopIt=false;
  var i=0;
  countFiles(dirname,function(filesLength){
    loopDir(dirname,function(content){
      i++;
      var object = JSON.parse(content);
      if(discordName==object.discordName){
        stopIt=true;
        callback("Usted ya esta registrado");
      }
      if(stopIt==false && i==filesLength){
        callback("");
      }
    })
  })
}

function registrar(author,inGame_nick,callback){
  var dataFolder=__dirname+"/../players/";
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
            object["discordId"]=author.id;
            object.verified=false;
            writeFile(__dirname+"/../players/"+player+".json",JSON.stringify(object));
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

function purifyText(text){
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getAllNicks(callback){
  var dirname=__dirname+"/../players/";
  var dic={};
  var stopIt=false;
  var i=0;
  countFiles(dirname,function(filesLength){
    loopDir(dirname,function(content,file){
      i++;
      var object = JSON.parse(content);
      var givename=object.discordName;
      if(givename==""){
        givename="not registered "+i;
      }
      dic[givename]=atob(file.substring(file.indexOf('/players/')+'/players/'.length,file.indexOf(".json")));
      if(stopIt==false && i==filesLength){
        callback(dic);
      }
    })
  })
}

function getNick(discordName,callback){
  var dirname=__dirname+"/../players/";
  var dic={};
  var stopIt=false;
  loopDir(dirname,function(content,file){
    if(stopIt==false){
      var object = JSON.parse(content);
      var givename=object.discordName;
      if(discordName==givename){
        stopIt=true;
        callback(atob(file.substring(file.indexOf('/players/')+'/players/'.length,file.indexOf(".json"))));
      }
    }
  })
}

function findCloseMatchesDic(dic,callback){
  getAllNicks(function(names){
    var newDic=dic;
    for(var key in newDic){
      for(var i=0;i<dic[key].length;i++){
        var s = dic[key][i].trim();
        a=s.substr(s.indexOf("-")+1,s.length).replace(/©/g,"");
        dic[key][i]=""+s.substr(0,s.indexOf("-")+1)+CloserMatch(purifyText(a),names,"");
      }
    }
    callback(newDic);
  });
}
function CloserMatch(realname,names,type){
  var puntos = [];
  var namesList=[];
  var modifiedNamesList=[];

  var discordList=[];
  var tmpPoints=0;
  for(var n in names){
    namesList.push(names[n]);
    modifiedNamesList.push(names[n].replace(/©/g,""));
  }
  for(var n in names){
    discordList.push(n);
  }

  for(var n in modifiedNamesList){
    tmpPoints=0;
    if(modifiedNamesList[n].length==realname.length){
      tmpPoints+=10;
    }
    for(var l=0;l<modifiedNamesList[n].length;l++){
      if(l<realname.length && modifiedNamesList[n][l].toLowerCase()==realname[l].toLowerCase()){
        tmpPoints+=3;
      }
    }
    for(var l=0;l<realname.length;l++){
      if(modifiedNamesList[n].toLowerCase().includes(realname[l].toLowerCase())){
        tmpPoints++;
      }
    }
    puntos.push(tmpPoints);
  }

  //https://stackoverflow.com/a/30850912
  var indexOfMaxValue = puntos.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

  if(type=="discord"){
    return discordList[indexOfMaxValue];
  } else {
    return namesList[indexOfMaxValue];
  }
}

function findCloserMatch(name,type,callback){
  var realname=name.replace(/©/g,"");
  getAllNicks(function(names){
    callback(CloserMatch(realname,names,type));
  });
}

module.exports = {
    loadData: loadData,
    registrar: registrar,
    getNick:getNick,
    getAllNicks: getAllNicks,
    findCloserMatch: findCloserMatch,
    findCloseMatchesDic: findCloseMatchesDic
};
