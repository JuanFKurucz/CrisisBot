const {readFile,writeFile}=require("./lib/handleFile.js");

const wikiFile=__dirname+"/data/wiki.json";

function purifyText(text){
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function guardarPokemon(usuario,nombre,intimidad){
  readFile(wikiFile,function(content){
    var object = JSON.parse(content);
    if(!object["pokemons"].hasOwnProperty(purifyText(nombre))){
      object["pokemons"][purifyText(nombre)]={};
    }
    if(!object["pokemons"][purifyText(nombre)].hasOwnProperty(usuario)){
      object["pokemons"][purifyText(nombre)][usuario]=[];
    }
    if(object["pokemons"][purifyText(nombre)][usuario].indexOf(intimidad)==-1){
      object["pokemons"][purifyText(nombre)][usuario].push(intimidad);
      writeFile(wikiFile,JSON.stringify(object));
    }
  });
}

function guardarEquipo(usuario,n1,n2,n3){
  var list=[purifyText(n1),purifyText(n2),purifyText(n3)];
  list.sort();
  readFile(wikiFile,function(content){
    var object = JSON.parse(content);
    if(!object["equipos"].hasOwnProperty(usuario)){
      object["equipos"][usuario]=[];
    }
    if(object["equipos"][usuario].indexOf(list)==-1){
      object["equipos"][usuario].push(list);
      writeFile(wikiFile,JSON.stringify(object));
    }
  });
}

function getOncePerType(dic){
  var list=[];
  console.log(dic);
  for(var key in dic){
    console.log(dic[key])
    if(list.indexOf(dic[key])==-1){
      list.push(dic[key]);
    }
  }
  return list;
}

function obtenerPokemon(nombre,callback){
  readFile(wikiFile,function(content){
    var object = JSON.parse(content);
    console.log(object["pokemons"][purifyText(nombre)]);
    var mensaje = "Se recomiendan las siguientes intimidades para "+nombre + ": " +getOncePerType(object["pokemons"][purifyText(nombre)]).join(", ");
    callback(mensaje);
  });
}

module.exports = {
    guardarPokemon: guardarPokemon,
    guardarEquipo: guardarEquipo,
    obtenerPokemon: obtenerPokemon
};
