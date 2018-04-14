const Discord = require('discord.js');
const client = new Discord.Client();
const {loadGuerraClanesData,saveGuerraClanesData,registrar,findCloserMatch,findCloseMatchesDic,getNick} = require(__dirname+"/lib/dataHandler.js");
const {writeFile,readFile,changeFileName,createUserFile,eliminateUserFile} = require(__dirname+"/lib/handleFile.js");
const {eventos,guardarEvento} = require(__dirname+"/lib/eventsHandler.js");
const {guardarPokemon,guardarEquipo,obtenerPokemon,borrarPokemon,borrarEquipo} = require(__dirname+"/lib/wiki.js");
const moment = require('moment-timezone');

const serverName = "Crisis S35";
const botId = "428954422941319190";
const PetDexTimeZone="America/Anguilla";
const serverId="422196601478447105";
const ChannelIds={  "anuncio-eventos" : "427861480264695809",
                    "participacion"   : "429671407061041173",
                    "organizacion"    : "433651760238821397"}
const AutoDeleteChannels=[ChannelIds["participacion"],ChannelIds["organizacion"]];

const RolesIds={  "Miembro":"422199019075272704"  }
const warMaps=[
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



function editSecuence(a,callback){
  if(a.length!=0){
    client.channels
    .get(a[0].split(",")[0])
    .fetchMessage(a[0].split(",")[1])
    .then(function(message){
      message.edit(a[0].split(",")[2])
      a.shift();
      editSecuence(a,callback);
    })
    .catch(console.error);
  } else {
    console.log("done editting");
    callback();
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

function removeSymbols(string){
  return string.replace(/[^\w\s]/gi, '');
}

function separateCommand(command){
  var listCommand=[];
  var tmp="";
  var comillas=false;
  for(var letter in command){
    if(command[letter]==" " || command[letter]=="\n"){
      if(comillas==false){
        listCommand.push(removeSymbols(tmp));
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
  listCommand.push(removeSymbols(tmp));
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

function getEditarWarMensajes(data,mapa,callback){
  loadGuerraClanesData(function(oldData){
    var arrayList=[];
    var change=false;
    var realMessage="\n:round_pushpin:\t\t"+mapa+"\t\t:round_pushpin:\n";
    for(var i=0;i<data[mapa].length;i++){
      if(oldData.length>i && oldData[i] == data[i]){
        continue;
      } else {
        change=true;
        if(data[mapa][i].split(" ")[data[mapa][i].split(" ").length-1]=="no"){
          realMessage+="\t"+data[mapa][i].slice(0,-3)+"\n";
        } else {
          realMessage+="\t"+data[mapa][i].slice(0,-3)+"\t\t\t:white_check_mark:"+"\n";
        }
      }
    }
    if(change){
      arrayList.push(ChannelIds["organizacion"]+","+MessagesId["organizacion"][mapa]+","+realMessage);
      arrayList.push(ChannelIds["participacion"]+","+MessagesId["participacion"][mapa]+","+realMessage);
    }
    callback(arrayList);
  });
}

function saveEditarWarMensajes(data,arrayList){
  saveGuerraClanesData(data);
  editSecuence(arrayList,function(){
    usuarioCreandoGuerra = null;
    estadoCreandoGuerra = 0;
    textoGuerra="";
    throwMensaje(msg,"Tarea completada");
  });
}

function changeParticipation(nick,pos=-1){
  loadGuerraClanesData(function(data){
    var arrayList=[];
    var iMaps=0;
    for(var mapa in data){
      var editado=false;
      for(var i=0;i<data[mapa].length;i++){
        var infoUser=data[mapa][i].split(" ");
        if(data[mapa][i].indexOf(nick)!=-1 && (infoUser[infoUser.length-2]==pos || pos==-1)){
          editado = true;
          if(infoUser[infoUser.length-1]=="no"){
            infoUser[infoUser.length-1]="yes";
          } else {
            infoUser[infoUser.length-1]="no";
          }
          data[mapa][i]=infoUser.join(" ");
        }
      }
      if(editado){
        getEditarWarMensajes(data,mapa,function(arr){
          arrayList.concat(arr);
          iMaps++;
          if(Object.keys(data).length == iMaps){
            saveEditarWarMensajes(data,arrayList);
          }
        })
      } else {
        iMaps++;
        if(Object.keys(data).length == iMaps){
          saveEditarWarMensajes(data,arrayList);
        }
      }
    }
  });
}

var usuarioCreandoGuerra = null;
var estadoCreandoGuerra = 0;
var textoGuerra="";
var estadoEditandoGuerra = 0;
var usuarioEditandoGuerra = null;
var accionesEditandoGuerra=[];

function guerra(msg,command){
    switch(command[0]){
      case "participar":
      case "abandonar":
        var userToChange=msg.author.username+"#"+msg.author.discriminator;
        if(!isNaN(command[1])){
          getNick(userToChange,function(nick){
            changeParticipation(nick,removeSymbols(mensaje[1]));
          })
        } else {
          getNick(userToChange,function(nick){
            changeParticipation(nick);
          })
        }
        break;
    }
}

function organizacionGuerra(msg,command){
  switch(command[0]){
    case "crear":
      if(estadoCreandoGuerra==0){
        usuarioCreandoGuerra=msg.author.id;
        estadoCreandoGuerra=1;
        textoGuerra+=warMaps[estadoCreandoGuerra-1]+"\n";
        throwMensaje(msg,"Debe ingresar: (Numero de grupo) Nick  (Numero de equipo, puede dejarse vacio)\nEjemplo: 1 helmit 1\nPuede ingresarse varios en un solo mensaje separado por enters o ingresar en varios mensajes. Para pasar al siguiente mapa ingrese 'terminar' o 'saltar'\n\nIngrese la lista de usuarios para **"+warMaps[estadoCreandoGuerra-1]+"**");
      } else {
        throwMensaje(msg,"Ya hay una creacion de guerra en proceso.");
      }
      break;
    case "editar":
      if(estadoCreandoGuerra==0 && estadoEditandoGuerra==0){
        usuarioEditandoGuerra=msg.author.id;
        estadoEditandoGuerra=1;
        throwMensaje(msg,"Introduzca: **agregar** o **borrar** para continuar con la edicion");
      } else {
        throwMensaje(msg,"Ya hay una edicion de guerra en proceso.");
      }
      break;
    case "confirmar":
      findCloserMatch(command[1],"",function(w){
        changeParticipation(w);
      })
      break;
  }
}

function endEditingWar(author,data){
  getEditarWarMensajes(data,accionesEditandoGuerra[1],function(arr){
    editSecuence(arr,function(){
      accionesEditandoGuerra=[];
      estadoEditandoGuerra=0;
      usuarioEditandoGuerra=null;
      saveGuerraClanesData(data);
      sendMp(author,"Tarea completada.");
    });
  });
}

function checkPermission(msg,userPermiso,permiso,callback){
  if(userPermiso<=permiso){
    callback();
  } else {
    throwMensaje(msg,"No tienes permisos para usar este comando.");
  }
}

function throwMensaje(msg,mensaje){
  if(AutoDeleteChannels.indexOf(msg.channel.id)!=-1){
    sendMp(msg.author,mensaje);
  } else {
    msg.reply(mensaje);
  }
}

function warCreationHandler(msg){
  if(msg.content=="saltar" || msg.content=="terminar"){
    estadoCreandoGuerra++;
    if(estadoCreandoGuerra<=warMaps.length){
      textoGuerra+=warMaps[estadoCreandoGuerra-1]+"\n";
      throwMensaje(msg,"Ingrese la lista de usuarios para **"+ warMaps[estadoCreandoGuerra-1] + "**");
    } else {
      var enters=textoGuerra.split("\n");
      var vdic={};
      var lastMap="";
      for(var m=0;m<enters.length-1;m++){
        if(warMaps.indexOf(enters[m])!=-1){
          lastMap=enters[m];
          vdic[lastMap]=[];
        } else {
          vdic[lastMap].push(enters[m].trim() + " no");
        }
      }
      findCloseMatchesDic(vdic,function(dic){
        loadGuerraClanesData(function(oldData){
          var realMessage="Esta no es la lista OFICIAL y posiblemente este mal\n\n:map:️\t\tMAPAS\t"+moment().tz(PetDexTimeZone).format("DD/MM/YYYY")+"\t\t:map:️\n";
          var arrayList=[];
          arrayList.push(ChannelIds["organizacion"]+","+MessagesId["organizacion"]["Info"]+","+realMessage);
          arrayList.push(ChannelIds["participacion"]+","+MessagesId["participacion"]["Info"]+","+realMessage);
          for(var bKey in MessagesId){
            for(var key in dic){
              realMessage="\n:round_pushpin:\t\t"+key+"\t\t:round_pushpin:\n";
              for(var i=0;i<dic[key].length;i++){
                realMessage+="\t"+dic[key][i].slice(0,-3)+"\n";
              }
              arrayList.push(ChannelIds[bKey]+","+MessagesId[bKey][key]+","+realMessage);
            }
          }
          throwMensaje(msg,"Comenzando creacion, espere porfavor.");
          editSecuence(arrayList,function(){
            usuarioCreandoGuerra = null;
            estadoCreandoGuerra = 0;
            textoGuerra="";
            saveGuerraClanesData(dic);
            throwMensaje(msg,"Tarea completada");
          });
        });
      })
    }
  } else {
    textoGuerra+=msg+"\n";
  }
}

function warEditionHandler(msg){
  switch(estadoEditandoGuerra){
    case 1:
      //se obtiene accion
      if(msg.content.toLowerCase()=="agregar" || msg.content.toLowerCase()=="borrar"){
        accionesEditandoGuerra.push(msg.content.toLowerCase());
        estadoEditandoGuerra++;
        //imprimir lista de mapas con indices
        var nextMessage="Ingrese el numero de mapa a **"+msg.content.toLowerCase()+"**\n";
        for(var i=0;i<warMaps.length;i++){
          nextMessage+="**"+(i+1)+"** - "+warMaps[i]+"\n";
        }
        throwMensaje(msg,nextMessage);
      } else {
        throwMensaje(msg,"Error: debe ingresar **agregar** o **borrar**");
      }
      break;
    case 2:
      //se obtiene mapa
      var mapNumber = parseInt(msg.content);
      var mapa="";
      if(!isNaN(mapNumber) && mapNumber>0 && mapNumber<=warMaps.length){
        mapNumber--;
        mapa=warMaps[mapNumber];
        accionesEditandoGuerra.push(mapa);
        switch(accionesEditandoGuerra[0]){
          case "borrar":
            //borrar
            loadGuerraClanesData(function(data){
              //imprimir usuarios del mapa con indices
              var nextMessage="Ingrese el numero de usuario a **"+accionesEditandoGuerra[0]+"**\n";
              for(var i=0;i<data[mapa].length;i++){
                nextMessage+="**"+(i+1)+"** - "+data[mapa][i]+"\n";
              }
              throwMensaje(msg,nextMessage);
            })
            break;
          case "agregar":
            //agregar
              //se pide que ingrese (grupo) nick (equipo)
            throwMensaje(msg,"Ingrese: (grupo) nick (equipo)\nEjemplo:\n1 helmit 1");
            break;
        }
        estadoEditandoGuerra++;
      } else {
        throwMensaje(msg,"Debe ingresar un numero entre 1 y "+warMaps.length+" inclusive");
      }
      break;
    case 3:
      //se realiza accion total
      loadGuerraClanesData(function(data){
        switch(accionesEditandoGuerra[0]){
          case "borrar":
            var i=parseInt(msg.content);
            if(!isNaN(i) && i>0 && i <= data[accionesEditandoGuerra[1]].length){
              data[accionesEditandoGuerra[1]].splice(i-1, 1);
              throwMensaje(msg,"Comenzando edicion, espere porfavor.");
              endEditingWar(msg.author,data);
            } else {
              throwMensaje(msg,"Debe ingresar un numero entre 1 y "+data[accionesEditandoGuerra[1]].length+" inclusive");
            }
            break;
          case "agregar":
            var numEquipo = 1;
            var inputPlayerData=msg.content.split(" ");
            if(inputPlayerData.length >=3 && !isNaN(inputPlayerData[2])){
              numEquipo=inputPlayerData[2];
            }
            findCloserMatch(inputPlayerData[1].replace(/©/g,""),"",function(nick){
              var found=false;
              for(var i=0;i<data[accionesEditandoGuerra[1]].length;i++){
                var playerData=data[accionesEditandoGuerra[1]][i].split(" ");
                if(playerData[1] == nick && (playerData.length>=3 && playerData[2] == numEquipo)){
                  found=true;
                }
              }
              if(!found){
                data[accionesEditandoGuerra[1]].push(inputPlayerData[0]+" "+nick+" "+numEquipo+" no");
                throwMensaje(msg,"Comenzando edicion, espere porfavor.");
                endEditingWar(msg.author,data);
              } else {
                throwMensaje(msg,"Este jugador ya esta agregado");
              }
            })
            break;
        }
      })
      //se resetea la edicion
      break;
  }
}

function simpleCommandsHandler(msg,guildMember,permiso,command){
  if (msg.content[0] === '+') {
    switch(command[0]){
      case "registrar":
        if(permiso==4){
          if(command.length<=1){
            throwMensaje(msg,"El comando necesita que ingreses tu nick especifico");
          } /*else if(!command[1].includes("©")){
            throwMensaje(msg,"Debido a las reglas el nick inGame tiene que incluir el caracter ©");
          } */else {
            registrar(msg.author,command[1],function(er,s){
              throwMensaje(msg,er);
              if(s){
                guildMember.addRole(msg.guild.roles.find("name", "Miembro Pendiente"));
              }
            });
          }
        } else if(permiso==3){
          throwMensaje(msg,"Tu aplicacion a Miembros esta en espera, contacta a un administrador");
        } else {
          throwMensaje(msg,"Ya eres Miembro");
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
          throwMensaje(msg,"Todo listo.");
        } else {
          throwMensaje(msg,"No tienes permiso para manipular usuarios.");
        }
        break;
      case "recordar":
        checkPermission(msg,permiso,2,function(){
          if(command.length<3){
            throwMensaje(msg,"El comando necesita que ingreses: El mensaje a recordar y la hora (hora del juego), y el dia de la semana (1/7, usar 0 para todos los dias y -1 para que solo se ejecute una vez)\nEjemplo: +recordar 'Fiesta de Pokemons' 17:51 3");
          }
          var dia=-1;
          if(!isNaN(command[3])){
            dia=command[3];
          }
          if(dia==0 && permiso >=2){
            throwMensaje(msg,"No tienes permiso para activar un recordatorio diario.");
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
        })
        break;
      case "wiki":
        switch(command[1]){
          case "agregar":
          case "borrar":
            checkPermission(msg,permiso,2,function(){
              if(command[2]=="equipo"){
                if(command.length!=6){
                  throwMensaje(msg,"Se deben ingresar 3 pokemons")
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
            });
            break;
          default:
            obtenerPokemon(command[1],function(data){
              throwMensaje(msg,data.replace(/:pokeball:/g,client.emojis.find("name", "pokeball")));
            });
            break;
        }
        break;
      case "encontrar":
        var type="";
        if(command.length>=3){
          type=command[2];
        }
        findCloserMatch(command[1],type,function(a){
          throwMensaje(msg,a)
        });
        break;
      case "hora":
        throwMensaje(msg,'Hora del servidor: '+moment().tz(PetDexTimeZone).format("HH:mm"));
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
              throwMensaje(msg,mensaje);
            });
          break;
        }
        break;
      default:
        /*if(msg.channel.id == ChannelIds["participacion"] || msg.channel.id == ChannelIds["organizacion"]){
          throwMensaje(msg,'El comando no existe')
        } else {
          throwMensaje(msg,'El comando no existe');
        }*/
        break;
    }
  }
}

client.on('message', msg => {
  try{
    switch(msg.channel.type){
      case "dm":
        if(usuarioCreandoGuerra==msg.author.id){
          warCreationHandler(msg);
        } else if(usuarioEditandoGuerra==msg.author.id){
          warEditionHandler(msg);
        }
        break;
      case "text":
        const guildMember = msg.member;
        const permiso=granPermission(guildMember);
        var command = separateCommand(msg.content);
        switch(msg.channel.id){
          case ChannelIds["organizacion"]:
            checkPermission(msg,permiso,1,function(){
              organizacionGuerra(msg,command);
            })
            break;
          case ChannelIds["participacion"]:
            checkPermission(msg,permiso,2,function(){
              guerra(msg,command);
            })
            break;
          default:
            simpleCommandsHandler(msg,guildMember,permiso,command);
            break;
        }
        //Borrar mensajes en canales prohibidos en hablar pero permitidos en enviar comandos
        if(msg.author.id != botId && AutoDeleteChannels.indexOf(msg.channel.id)!=-1){
          msg.delete();
        }
        break;
    }
  } catch(e){
    console.log(e);
  }
});

client.login('NDI4OTU0NDIyOTQxMzE5MTkw.DZ6mdA.eKp8yO_kQCVAWeGRZP94uJrRto4');
