const Discord = require('discord.js');
const client = new Discord.Client();
const {registrar,findCloserMatch,findCloseMatchesDic,getNick} = require(__dirname+"/lib/dataHandler.js");
const {writeFile,readFile,changeFileName,createUserFile,eliminateUserFile} = require(__dirname+"/lib/handleFile.js");
const {eventos,guardarEvento} = require(__dirname+"/lib/eventsHandler.js");
const {guardarPokemon,guardarEquipo,obtenerPokemon,borrarPokemon,borrarEquipo} = require(__dirname+"/lib/wiki.js");
const moment = require('moment-timezone');

const serverName = "Crisis S35";
const PetDexTimeZone="America/Anguilla";
const serverId="422196601478447105";
const ChannelIds={  "anuncio-eventos" : "427861480264695809",
                    "participacion"   : "429671407061041173",
                    "organizacion"    : "433651760238821397"}
const RolesIds={  "Miembro":"422199019075272704"  }

var warMaps=[
  "Meadow Arcoiris",
  "Ciudad de Hector",
  "NeoGen (Pueblo de Neo)",
  "Bosque Mistico (Bosque Misterioso)",
  "Costa del Sol",
  "Volcan Grito",
  "Cañon Trueno",
  "Desierto Lovesong (Desierto Cancion de amor)",
  "Luz de Estrella",
  "Valle de Luna (Vale de Luz de luna)",
  "Montaña Cuckoo",
  "Isla del Amanecer (Isla Amanecer)",
  "Colina del Destino",
  "Pantano Olvidado",
  "Lago de Cristal (Lago de Vidrio)",
  "Ruinas de Dragon"
];
const MessagesId={
  "organizacion":{
    "Info":"433656034578661377",
    "Meadow Arcoiris":"433656035467853826",
    "Ciudad de Hector":"433656036784603137",
    "NeoGen (Pueblo de Neo)":"433656038256934912",
    "Bosque Mistico (Bosque Misterioso)":"433656039221624833",
    "Costa del Sol":"433656063707971605",
    "Volcan Grito":"433656065297743894",
    "Cañon Trueno":"433656066610429972",
    "Desierto Lovesong (Desierto Cancion de amor)":"433656067797286923",
    "Luz de Estrella":"433656068883611658",
    "Valle de Luna (Vale de Luz de luna)":"433656092820504587",
    "Montaña Cuckoo":"433656094196236298",
    "Isla del Amanecer (Isla Amanecer)":"433656095362514945",
    "Colina del Destino":"433656096754761730",
    "Pantano Olvidado":"433656098541797417",
    "Lago de Cristal (Lago de Vidrio)":"433656123015561216",
    "Ruinas de Dragon":"433656124223258624"
  },
  "participacion":{
    "Info":"433656034490449931",
    "Meadow Arcoiris":"433656035656335372",
    "Ciudad de Hector":"433656037074141193",
    "NeoGen (Pueblo de Neo)":"433656037980241942",
    "Bosque Mistico (Bosque Misterioso)":"433656039490191360",
    "Costa del Sol":"433656063708102662",
    "Volcan Grito":"433656065066795018",
    "Cañon Trueno":"433656066631270400",
    "Desierto Lovesong (Desierto Cancion de amor)":"433656067671588877",
    "Luz de Estrella":"433656069399773214",
    "Valle de Luna (Vale de Luz de luna)":"433656089305808927",
    "Montaña Cuckoo":"433656090824278026",
    "Isla del Amanecer (Isla Amanecer)":"433656092627697664",
    "Colina del Destino":"433656093495787532",
    "Pantano Olvidado":"433656094972444672",
    "Lago de Cristal (Lago de Vidrio)":"433656115314688030",
    "Ruinas de Dragon":"433656116518584321"
  }
};

function send(msg,m){
  msg.channel.send(m);
}
function tagRole(RoleName){
  return "<@&"+RolesIds[RoleName]+">"
}

function getKeyByValue(object,value){
  for( var prop in object ) {
      if( object.hasOwnProperty( prop ) ) {
           if( object[ prop ] === value )
               return prop;
      }
  }
  return null;
}



function editSecuence(a){
  if(a.length!=0){
    client.channels
    .get(a[0].split(",")[0])
    .fetchMessage(a[0].split(",")[1])
    .then(function(message){
      message.edit(getKeyByValue(ChannelIds,a[0].split(",")[2]))
      a.shift();
      editSecuence(a);
    })
    .catch(console.error);
  } else {
    console.log("done editting");
  }
}

client.on('ready', () => {
  console.log(client.channels.get(ChannelIds["participacion"]).messages);
  console.log(`Logged in as ${client.user.tag}!`);
/*  setInterval(function(){
    eventos(
      moment().tz(PetDexTimeZone).format("YYYY/MM/DD"),
      moment().tz(PetDexTimeZone).format("HH:mm"),
      moment().tz(PetDexTimeZone).weekday(),
      function(m){
        client.channels.get(ChannelIds["anuncio-eventos"]).send(tagRole("Miembro")+" "+m);
      }
    )
  },1000);*/
});


function separateCommand(command){
  var listCommand=[];
  var tmp="";
  var comillas=false;
  for(var letter in command){

    if(command[letter]==" " || command[letter]=="\n"){
      if(comillas==false){
        listCommand.push(tmp);
        tmp="";
      } else {
        tmp+=command[letter];
      }
    } else {
      if(command[letter]=="'" || command[letter]=='"'){
        if(comillas==false){
          comillas=true;
        } else {
          comillas=false;
        }
      } else {
        tmp+=command[letter];
      }
    }
  }
  listCommand.push(tmp);
  return listCommand;
}

function granPermission(member){
  var levelPermission=99;
  if(member.id == "162355874570960896"){
    return 0;
  }
  if(member.roles.find("name","Administracion")!=null){
    levelPermission=0;
  } else if(member.roles.find("name","Comandante de Guerras")!=null){
    levelPermission=1;
  } else if(member.roles.find("name","Miembro")!=null){
    levelPermission=2;
  } else if(member.roles.find("name","Miembro Pendiente")!=null){
    levelPermission=3;
  } else {
    levelPermission=4;
  }
  return levelPermission;
}

function sendMp(author,text){
  author.send(text);
}


function changeParticipation(nick,pos=-1){
  client.channels.get(ChannelIds["participacion"]).fetchMessage(MessagesId["listaGuerra"])
    .then(function(message){
      var realMessage=message.content;
      var entries=realMessage.split("\n");
      for(var e=0;e<entries.length;e++){
        if(entries[e].indexOf("-")!=-1){
          if(entries[e].includes(nick) && ((pos==-1 && isNaN(entries[e].trim()[0]))||entries[e].trim()[0]==pos)){
            if(command[1]=="participar" && entries[e].indexOf(":white_check_mark:")==-1){
              entries[e]+="\t\t\t<@!"+msg.author.id+"> :white_check_mark:";
            } else if(command[1]=="abandonar" && entries[e].indexOf(":white_check_mark:")!=-1) {
              entries[e]=entries[e].split("\t\t\t")[0];
            }
          }
        }
      }
      message.edit(entries.join("\n"))
    })
    .catch(console.error);
}

var usuarioCreandoGuerra = null;
var estadoCreandoGuerra = 0;
var textoGuerra="";
function guerra(msg,permiso,command){
  try{
    if(permiso<=2 && msg.channel.id == ChannelIds["participacion"]){
      switch(command[1]){
        case "participar":
        case "abandonar":
          var userToChange=msg.author.username+"#"+msg.author.discriminator;
          if(!isNaN(command[2])){
            getNick(userToChange,function(nick){
              changeParticipation(nick,command[2]);
            })
          } else if(command.length==3 && permiso<=1){
            findCloserMatch(command[2],"",function(w){
              changeParticipation(w);
            })
          } else {
            getNick(userToChange,function(nick){
              changeParticipation(nick);
            })
          }
          break;
        case "crear":
          console.log('inside crear');
          if(permiso<=1 && estadoCreandoGuerra==0){
            usuarioCreandoGuerra=msg.author.id;
            estadoCreandoGuerra=1;
            textoGuerra+=warMaps[estadoCreandoGuerra-1]+"\n";
            sendMp(msg.author,"Ingrese la lista de usuarios para "+warMaps[estadoCreandoGuerra-1] + "\n(Ingrese '-saltar' para dejar el mapa vacio)");
          } else {
            if(permiso<=1){
              throw new Error("Ya hay una creacion de guerra en proceso.");
            } else {
              throw new Error("No tienes permisos para usar este comando.");
            }
          }


            /*
            var enters=msg.content.split("\n");
            var vdic={};
            var lastMap="";
            for(var m=1;m<enters.length;m++){
              if(enters[m].indexOf("-")==-1){ //mapa
                lastMap=enters[m].trim();
                vdic[lastMap]=[];
              } else { //usuario
                vdic[lastMap].push(enters[m].trim());
              }
            }
            findCloseMatchesDic(vdic,function(dic){
              client.channels.get(ChannelIds["participacion"]).fetchMessage(MessagesId["listaGuerra"])
                  .then(function(message){
                    var realMessage="Esta no es la lista OFICIAL y posiblemente este mal\n\n:map:️\t\tMAPAS\t"+moment().tz(PetDexTimeZone).format("DD/MM/YYYY")+"\t\t:map:️\n";
                    for(var key in dic){
                      realMessage+="\n:round_pushpin:\t\t"+key+"\t\t:round_pushpin:\n";
                      for(var i=0;i<dic[key].length;i++){
                        realMessage+="\t"+dic[key][i]+"\n";
                      }
                    }
                    message.edit(realMessage+"\n\nEsta no es la lista OFICIAL y posiblemente este mal");
                  })
                  .catch(console.error);
            })
            */

          break;
        case "editar":// editar accion persona mapa
          if(permiso<=1){
            client.channels.get(ChannelIds["participacion"]).fetchMessage(MessagesId["listaGuerra"])
                .then(function(message){
                  var celdas = message.content.split(":round_pushpin:");
                  var dic={};
                  var lastC="";
                  for(var c=0;c<celdas.length;c++){
                    if(celdas[c].split("\n").length==1){
                      lastC=celdas[c].trim();

                      dic[lastC]=[];
                    } else if(lastC!="") {
                      var names=celdas[c].split("\t");
                      for(var n=0;n<names.length;n++){
                        if(names[n].trim()!="" && !names[n].includes("(")){
                          dic[lastC].push(names[n].trim());
                        }
                      }
                    }
                  }
                  switch(command[2]){
                    case "agregar":
                      findCloserMatch(
                        command[3].substr(command[3].indexOf("-")+1,command[3].length).replace(/©/g,""),
                        "",function(n){
                        dic[command[4]].push(command[3].substr(0,command[3].indexOf("-")+1)+n);
                        editWarMessage(dic);
                      })
                      break;
                    case "borrar":
                      for(var i=0;i<dic[command[4]].length;i++){
                        if(dic[command[4]][i].toLowerCase().includes(command[3].toLowerCase())){
                          dic[command[4]].splice(i, 1);
                          break;
                        }
                      }
                      editWarMessage(dic);
                      break;
                  }
                })
                .catch(console.error);
          } else {
            throw new Error("No tienes permisos para usar este comando.");
          }
          break;
      }
    } else {
      if(permiso<=2){
        throw new Error("Este comando solo funciona en el canal 'participacion' de la categoria 'Canales de guerra'");
      } else {
        throw new Error("No tienes permisos para usar este comando.");
      }
    }
  } catch(e){
    console.log(e.message);
    if(msg.channel.id == ChannelIds["participacion"]){
      sendMp(msg.author,e.message);
    } else {
      msg.reply(e.message);
    }
  }
}

client.on('message', msg => {
  try{
    switch(msg.channel.type){
      case "dm":
        if(usuarioCreandoGuerra==msg.author.id){
          if(msg.content!="-saltar"){
            textoGuerra+=msg;
          }
          estadoCreandoGuerra++;
          if(estadoCreandoGuerra<warMaps.length){
            textoGuerra+=warMaps[estadoCreandoGuerra-1]+"\n";
            sendMp(msg.author,"Ingrese la lista de usuarios para "+warMaps[estadoCreandoGuerra-1] + "\n(Ingrese '-saltar' para dejar el mapa vacio)");
          } else {
            var enters=textoGuerra.split("\n");
            var vdic={};
            var lastMap="";
            for(var m=1;m<enters.length;m++){
              if(warMaps.indexOf(enters[m].trim())==-1){ //mapa
                lastMap=enters[m].trim();
                vdic[lastMap]=[];
              } else { //usuario
                vdic[lastMap].push(enters[m].trim());
              }
            }
            findCloseMatchesDic(vdic,function(dic){
              var realMessage="Esta no es la lista OFICIAL y posiblemente este mal\n\n:map:️\t\tMAPAS\t"+moment().tz(PetDexTimeZone).format("DD/MM/YYYY")+"\t\t:map:️\n";
              var arrayList=[];
              arrayList.push(ChannelIds["organizacion"]+","+MessagesId["organizacion"]["Info"]+","+realMessage);
              arrayList.push(ChannelIds["participacion"]+","+MessagesId["participacion"]["Info"]+","+realMessage);
              for(var bKey in MessagesId){
                for(var key in dic){
                  realMessage="\n:round_pushpin:\t\t"+key+"\t\t:round_pushpin:\n";
                  for(var i=0;i<dic[key].length;i++){
                    realMessage+="\t"+dic[key][i]+"\n";
                  }
                  arrayList.push(ChannelIds[bKey]+","+MessagesId[bKey][key]+","+realMessage);
                }
              }
              console.log(arrayList);
              editSecuence(arrayList);
            })
          }
        }
        break;
      case "text":
        const guildMember = msg.member;
        const permiso=granPermission(guildMember);
        if (msg.content[0] === '+') {
          var command = separateCommand(msg.content.substring(1,msg.content.length));
          switch(command[0]){
            case "registrar":
              if(permiso==4){
                if(command.length<=1){
                  msg.reply("El comando necesita que ingreses tu nick especifico");
                } else if(!command[1].includes("©")){
                  msg.reply("Debido a las reglas el nick inGame tiene que incluir el caracter ©");
                } else {
                  registrar(msg.author,command[1],function(er,s){
                    msg.reply(er);
                    if(s){
                      guildMember.addRole(msg.guild.roles.find("name", "Miembro Pendiente"));
                    }
                  });
                }
              } else if(permiso==3){
                msg.reply("Tu aplicacion a Miembros esta en espera, contacta a un administrador");
              } else {
                msg.reply("Ya eres Miembro");
              }
              break;
            case "usuario":
              if(permiso<=1){
                switch(command[1]){
                  case "crear":
                    createUserFile(command[2]);
                    break;
                  case "reenombrar":
                    findCloserMatch(command[2],"",function(n){
                      changeFileName(n,command[3])
                    });
                    break;
                  case "reiniciar":
                    findCloserMatch(command[2],"",function(n){
                      createUserFile(n,false);
                    });
                    break;
                  case "eliminar":
                    findCloserMatch(command[2],"",function(n){
                      eliminateUserFile(n);
                    });
                    break;
                }
                msg.reply("Todo listo.");
              } else {
                msg.reply("No tienes permiso para manipular usuarios.");
              }
              break;
            case "recordar":
              if(permiso<=2){
                if(command.length<3){
                  msg.reply("El comando necesita que ingreses: El mensaje a recordar y la hora (hora del juego), y el dia de la semana (1/7, usar 0 para todos los dias y -1 para que solo se ejecute una vez)\nEjemplo: +recordar 'Fiesta de Pokemons' 17:51 3");
                }
                var dia=-1;
                if(!isNaN(command[3])){
                  dia=command[3];
                }
                if(dia==0 && permiso >=2){
                  msg.reply("No tienes permiso para activar un recordatorio diario.");
                } else {
                  guardarEvento(
                    {
                      "text":command[1],
                      "time":command[2],
                      "last":"",
                      "when":dia
                    }
                  );
                }
              } else {
                sendMp(msg.author,"No tienes permisos para usar este comando.");
              }
              break;
            case "wiki":
              switch(command[1]){
                case "agregar":
                case "borrar":
                  if(permiso<=2){
                    if(command[2]=="equipo"){
                      if(command.length!=6){
                        msg.reply("Se deben ingresar 3 pokemons")
                      } else {
                        if(command[1]=="borrar"){
                          borrarEquipo(msg.author.username+"#"+msg.author.discriminator,command[3],command[4],command[5])
                        } else {
                          guardarEquipo(msg.author.username+"#"+msg.author.discriminator,command[3],command[4],command[5])
                        }
                      }
                    } else if(command[2]=="pokemon"){
                      if(command[1]=="borrar"){
                        borrarPokemon(msg.author.username+"#"+msg.author.discriminator,command[3],command[4],command[5])
                      } else {
                        guardarPokemon(msg.author.username+"#"+msg.author.discriminator,command[3],command[4])
                      }
                    }
                  } else {
                    sendMp(msg.author,"No tienes permisos para usar este comando.");
                  }
                  break;
                default:
                  obtenerPokemon(command[1],function(data){
                    msg.reply(data.replace(/:pokeball:/g,client.emojis.find("name", "pokeball")));
                  });
                  break;
              }
              break;
            case "guerra":
              console.log("exec guerra function")
              guerra(msg,permiso,command);
              break;
            case "encontrar":
              var type="";
              if(command.length>=3){
                type=command[2];
              }
              findCloserMatch(command[1],type,function(a){
                msg.reply(a)
              });
              break;
            case "hora":
              msg.reply('Hora del servidor: '+moment().tz(PetDexTimeZone).format("HH:mm"));
              break;
            case "tutoriales":
              switch(command[1]){
                case "agregar":
                  readFile(__dirname+"/data/tutoriales.json",function(c,f){
                    var dic=JSON.parse(c);
                    dic[command[2]]=command[3];
                    writeFile(__dirname+"/data/tutoriales.json",JSON.stringify(dic));
                  });
                  break;
                default:
                  readFile(__dirname+"/data/tutoriales.json",function(c,f){
                    var mensaje="\n";
                    var dic=JSON.parse(c);
                    for(var key in dic){
                      mensaje+=key + ": "+dic[key]+"\n";
                    }
                    msg.reply(mensaje);
                  });
                break;
              }
              break;
            default:
              if(msg.channel.id == ChannelIds["participacion"]){
                sendMp(msg.author,'El comando no existe')
              } else {
                msg.reply('El comando no existe');
              }
              break;
          }
        }
        if(msg.author.id != "428954422941319190" && msg.channel.id == ChannelIds["participacion"]){
          msg.delete();
        }
        break;

    }
  } catch(e){
    console.log(e);
  }
});

function editWarMessage(dic){
  client.channels.get(ChannelIds["participacion"]).fetchMessage(MessagesId["listaGuerra"])
      .then(function(message){
        var realMessage="\n\n:map:️\t\tMAPAS\t"+moment().tz(PetDexTimeZone).format("DD/MM/YYYY")+"\t\t:map:️\n";
        for(var key in dic){
          realMessage+="\n:round_pushpin:\t\t"+key+"\t\t:round_pushpin:\n";
          for(var i=0;i<dic[key].length;i++){
            realMessage+="\t"+dic[key][i]+"\n";
          }
        }
        message.edit(realMessage);
      })
      .catch(console.error);
}

client.login('NDI4OTU0NDIyOTQxMzE5MTkw.DZ6mdA.eKp8yO_kQCVAWeGRZP94uJrRto4');
