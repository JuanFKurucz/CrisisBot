const Discord = require('discord.js');
const client = new Discord.Client();
const {registrar} = require(__dirname+"/lib/dataHandler.js");
const {eventos,guardarEvento} = require(__dirname+"/lib/eventsHandler.js");
const {guardarPokemon,guardarEquipo,obtenerPokemon,borrarPokemon,borrarEquipo} = require(__dirname+"/lib/wiki.js");
const moment = require('moment-timezone');

const PetDexTimeZone="America/Anguilla";
const serverId="422196601478447105";
const ChannelIds={  "anuncio-eventos":"427861480264695809"  }
const RolesIds={  "Miembro":"422199019075272704"  }

function send(msg,m){
  msg.channel.send(m);
}
function tagRole(RoleName){
  return "<@&"+RolesIds[RoleName]+">"
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(function(){
    eventos(
      moment().tz(PetDexTimeZone).format("YYYY/MM/DD"),
      moment().tz(PetDexTimeZone).format("HH:mm"),
      moment().tz(PetDexTimeZone).weekday(),
      function(m){
        client.channels.get(ChannelIds["anuncio-eventos"]).send(tagRole("Miembro")+" "+m);
      }
    )
  },1000);
});


function separateCommand(command){
  var listCommand=[];
  var tmp="";
  var comillas=false;
  for(var letter in command){

    if(command[letter]==" "){
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

client.on('message', msg => {
  try{
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
        case "echar":
          if(permiso<=1){

          } else {
            msg.reply("No tienes permiso para echar usuarios.");
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
            msg.reply("No tienes permisos para usar este comando.");
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
              }
              break;
            default:
              obtenerPokemon(command[1],function(data){
                msg.reply(data.replace(/:pokeball:/g,client.emojis.find("name", "pokeball")));
              });
              break;
          }
          break;
        /*case "info":
          loadData(msg.author,function(data){
            //msg.send('Perfil de '+data.Nombre+":\nNivel:"+data.Nivel+"\nXP:"+data.XP);
          });
          break;*/
        /*case "mapa":
          var a=new Discord.RichEmbed()
            .setTitle("Mapa")
            .setAuthor("Tu",client.user.avatarURL)
            .setColor(0x00AE86)
            .setFooter("@Hello",client.user.avatarURL)
            .setImage("https://orig00.deviantart.net/9bb7/f/2011/309/1/0/foregon_town_my_first_pokemon_map_by_elish_56-d4f5ik0.jpg");
          send(msg,a);
          //send(msg,'123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789');
          break;*/
        case "hora":
          msg.reply('Hora del servidor: '+moment().tz(PetDexTimeZone).format("HH:mm"));
          break;
        default:
          msg.reply('El comando no existe');
          break;
      }
    }
  } catch(e){
    console.log(e);
  }
});

client.login('NDI4OTU0NDIyOTQxMzE5MTkw.DZ6mdA.eKp8yO_kQCVAWeGRZP94uJrRto4');
