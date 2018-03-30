const fs = require("fs");
var btoa = require('btoa');

var guildFile = __dirname+"/guildNames.txt";
if (fs.existsSync(guildFile)) {
  fs.readFile(guildFile, "utf8", function (err, text) {
    if (err) { throw err; }
    var lines = text.split(";");
    for(var l=0;l<lines.length;l++){
      fs.writeFile(__dirname+"/players/"+btoa(lines[l])+".json",JSON.stringify({discordName:"",verified:false}),'utf8',function(err) {
          if(err) {
              return console.log(err);
          }
      });
    }
  });
}
