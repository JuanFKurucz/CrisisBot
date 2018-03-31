const {readFile,writeFile}=require("./handleFile.js");
const {getAllNicks}=require("./dataHandler.js");
const wikiFile=__dirname+"/../data/wiki.json";

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
    if(!object["pokemons"]["equipos"].hasOwnProperty(usuario)){
      object["pokemons"]["equipos"][usuario]=[];
    }
    if(!checkIfArrayExists(object["pokemons"]["equipos"][usuario],list)){
      object["pokemons"]["equipos"][usuario].push(list);
      writeFile(wikiFile,JSON.stringify(object));
    }
  });
}

function getIntimidades(names,dic,callback){
  var listDic={}; // {Intimidad:[Usuarios...]}
  for(var key in dic){
    for(var i=0;i<dic[key].length;i++){

      if(listDic.hasOwnProperty(dic[key][i])){
          listDic[dic[key][i]].push(names[key]);
      } else {
          listDic[dic[key][i]]=[names[key]];
      }
    }
  }
  var result="";
  for(var key in listDic){
    result+= key +" by "+listDic[key].join(", ") + "\n";
  }
  return result;
}

function getEquipos(names,dic,pokemon){
  var listDic={}; // {Intimidad:[Usuarios...]}
  for(var key in dic){
    for(var i=0;i<dic[key].length;i++){
      if(dic[key][i].indexOf(pokemon)!=-1){
        if(listDic.hasOwnProperty(dic[key][i].join(","))){
            listDic[dic[key][i].join(",")].push(names[key]);
        } else {
            listDic[dic[key][i].join(",")]=[names[key]];
        }
      }
    }
  }

  var result="";
  for(var key in listDic){
    result+= key +" by "+listDic[key].join(", ") + "\n";
  }
  return result;
}

function obtenerPokemon(nombre,callback){
  getAllNicks(function(names){
    readFile(wikiFile,function(content){
      var object = JSON.parse(content);
      var mensaje = "Se recomiendan lo siguiente para "+nombre + ": \n"
                    + ":pokeball: Intimidades: \n"
                    + getIntimidades(names,object["pokemons"][purifyText(nombre)])
                    + ":pokeball: Equipos: \n"
                    + getEquipos(names,object["pokemons"]["equipos"],purifyText(nombre));
      callback(mensaje);
    });
  });
}

function borrarPokemon(usuario,nombre,intimidad){
  readFile(wikiFile,function(content){
    var object = JSON.parse(content);
    if( object["pokemons"].hasOwnProperty(purifyText(nombre)) &&
        object["pokemons"][purifyText(nombre)].hasOwnProperty(usuario) &&
        object["pokemons"][purifyText(nombre)][usuario].indexOf(intimidad)!=-1){
      object["pokemons"][purifyText(nombre)][usuario].splice(object["pokemons"][purifyText(nombre)][usuario].indexOf(intimidad), 1);
      if(object["pokemons"][purifyText(nombre)][usuario].length==0){
        delete object["pokemons"][purifyText(nombre)][usuario];
      }
      writeFile(wikiFile,JSON.stringify(object));
    }
  });
}

function checkIfArrayExists(List,array){
  var searchArray=JSON.stringify(array);
  for(var l=0;l<List.length;l++){
    if(JSON.stringify(List[l])==searchArray){
      return true;
      break;
    }
  }
  return false;
}

function borrarEquipo(usuario,n1,n2,n3){
  var list=[purifyText(n1),purifyText(n2),purifyText(n3)];
  list.sort();
  readFile(wikiFile,function(content){
    var object = JSON.parse(content);
    if( object["pokemons"]["equipos"].hasOwnProperty(usuario) &&
        checkIfArrayExists(object["pokemons"]["equipos"][usuario],list)){
      object["pokemons"]["equipos"][usuario].splice(object["pokemons"]["equipos"][usuario].indexOf(list), 1);
      if(object["pokemons"]["equipos"][usuario].length==0){
        delete object["pokemons"]["equipos"][usuario];
      }
      writeFile(wikiFile,JSON.stringify(object));
    }
  });
}

module.exports = {
    guardarPokemon: guardarPokemon,
    guardarEquipo: guardarEquipo,
    obtenerPokemon: obtenerPokemon,
    borrarPokemon: borrarPokemon,
    borrarEquipo: borrarEquipo
};
