
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', router);

function revertirString(s) {
  //https://stackoverflow.com/a/959004
  return [...s].reverse().join("");
}

function verificarRut(rut){
  // retorna true, si el digito es valido, false en el caso opuesto
  //algoritmo de modulo 11
  //https://validarutchile.cl/calcular-digito-verificador.php

  const rut_separado = rut.split('-');

  //damos vuelta la cifra antes del rut
  const rut_reversa = revertirString(rut_separado[0]);

  //utilizaremos esta serie para multiplicar
  const serie = [2,3,4,5,6,7];
  let indice_serie = 0; // el numero de la serie por el que se va a multiplicar

  //la suma de los valores que se calculan en el for de abajo
  let suma = 0
  // por cada numero del rut inverso
  for(let i=0; i < rut_reversa.length; i++) {
    const letra = rut_reversa[i];
    const numero = parseInt(letra);
    
    const multiplicacion = numero * serie[indice_serie];
    suma += multiplicacion;

    indice_serie++

    if(indice_serie >= 6) { // iniciamos la serie desde el principio
      indice_serie = 0;
    }
  }

  //console.log(suma);

  // calculamos el digito verificador
  let digito_calculado = (11 - ( suma % 11 )).toString();

  // si nos da 11, el digito verificador es 0
  if(digito_calculado === "11") {
    digito_calculado = "0"
  }

  // caso contrario, si nos da 10, el digito verificador es k
  if(digito_calculado === "10") {
    digito_calculado = 'k';
  }

  // este es el digito que ingresa el usuario
  const digito_entregado = rut_separado[1];

  console.log(`Digito calculado es ${digito_calculado}`);
  console.log(`Digito entregado es ${digito_entregado}`);

  if(digito_calculado == digito_entregado) {
    return true;
  }

  return false;

}

router.post('/digitoverificador/', function(req,res){
  const datos = req.body;
  console.log({datos});
  const rut = datos.rut;

  // si el rut esta escrito con puntos, lo ignoramos
  if(rut.includes('.')) {
    res.status(422).send("Escriba el rut sin puntos y con guion 12345678-9");
    return;
  }

  const es_valido = verificarRut(rut);
  
  if(es_valido) {
    res.send("El Rut Ingresado es Valido")
  } else {
    res.send("El Rut Ingresado NO es Valido")
  }
  
})

function nombrePropio(str) {
  // todo en minúsculas, excepto la inicial
  //https://stackoverflow.com/a/196991

  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}


router.post('/nombrepropio/', function(req,res) {
  const datos = req.body;

  console.log({datos});
  
  const apellido_paterno = nombrePropio(datos["apellido paterno"]);
  const apellido_materno = nombrePropio(datos["apellido materno"]);
  const nombres = nombrePropio(datos["nombres"]);
  const genero = datos["genero"].toLowerCase();

  if(genero === "m") {
    res.send(`Sr. ${nombres} ${apellido_paterno} ${apellido_materno}`);
  } else if(genero === "f") {
    res.send(`Sra. ${nombres} ${apellido_paterno} ${apellido_materno}`);
  } else {
    res.status(422).send("El genero debe ser M o F");
  }

})

app.listen(port,() => {
  console.log("Started on PORT 3000");
})