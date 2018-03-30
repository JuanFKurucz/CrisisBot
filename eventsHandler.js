const fs = require("fs");

var eventsFile=__dirname+"/data/eventos.json";

function saveEventos(eventsData){
  fs.writeFile(eventsFile,JSON.stringify({"eventos":eventsData}),'utf8',function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

function distanceTime(time1,time2){
  return Math.abs(time1[0]*60-time2[0]*60) +  Math.abs(time1[1]-time2[1]);
}

function eventos(actualDay,actualTime,dayOfWeek,callback){
  var changes=false;
  fs.readFile(eventsFile, "utf8", function (err, fdata) {
    if (err) { throw err; }
    var eventos = JSON.parse(fdata)["eventos"];
    for(var e in eventos){
      if(eventos[e]==null){
        continue;
      }
      var eTime=eventos[e]["time"].split(":");
      if( eventos[e]["last"]!=actualDay &&
          (eventos[e]["when"]==0 || eventos[e]["when"]==-1 || eventos[e]["when"] == dayOfWeek) &&
          distanceTime(eTime,actualTime.split(":"))<5&&
          (eTime[0]<actualTime.split(":")[0] || (eTime[0]==actualTime.split(":")[0] && eTime[1]<=actualTime.split(":")[1]))){
        changes=true;
        eventos[e]["last"]=actualDay;
        callback(eventos[e]["text"]);
        if(eventos[e]["when"]==-1 && e > -1){
          eventos.splice(e, 1);
        }
      }
    }
    if(changes){
      saveEventos(eventos);
    }
  });
}

function guardarEvento(nuevoEvento){
  fs.readFile(eventsFile, "utf8", function (err, fdata) {
    if (err) { throw err; }
    console.log(nuevoEvento)
    var eventos = JSON.parse(fdata)["eventos"];
    eventos.push(nuevoEvento);
    console.log(eventos)
    saveEventos(eventos);
  });
}

module.exports = {
    eventos: eventos,
    guardarEvento:guardarEvento
};
