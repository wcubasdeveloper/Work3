var maxCategoria=-1;
var arrayOpcionesSeleccionadas=new Array(); // opciones seleccionadas
var arrayOpcionesUsuario=new Array(); // Variable global de el arreglo de las opciones del usuario
var arrayTodasLasOpciones=new Array(); // contiene todas las opciones del menu.xml
var idMenuMax=0; // Obtiene el idMenu MAYOR

/* @cargarMenuOpciones : carga el menu de opciones del sistema en funcion a las opciones permitidas al usuario, segun los perfiles que tenga.
    PARAMETROS:
     - idPerfil1, idPerfil2, idPerfil3 : Perfiles del usuario
*/
function cargarMenuOpciones(idPerfil1, idPerfil2, idPerfil3){
	try{
		// Reinicia todos los arreglos de Opciones
		arrayOpcionesSeleccionadas.length=0;
		arrayOpcionesUsuario.length=0;
		arrayTodasLasOpciones.length=0;

		fancyAlertWait("Cargando menu de opciones");
		buscarOpcionesMenuXML(function(data){
           	guardarOpcionesXML(data); // guarda las opciones de menu.xml en variable Global 'arrayTodasLasOpciones'   
           	consultarMenuUsuario(idPerfil1, idPerfil2, idPerfil3); // consultan las opciones permitidas para el usuario
		})
	}catch(err){
		emitirErrorCatch(err, "cargarMenuOpciones")
	}
}

/* @buscarOpcionesMenuXML: Lee el archivo menu.xml y obtiene todas las opciones del menu.
     PARAMETROS:
       - callback: funcion que se ejecuta despues de leer el archivo XML
*/
function buscarOpcionesMenuXML(callback){
	try{
		// Busca las opciones que estan guardadas en menu.xml y ejecuta un callback
		fancyAlertWait("Cargando menu");
		$.ajax({
            url:"xml/menu.xml", // busca el menu.xml, en el se encuentran las opciones del menu
            dataType:"xml",
            success: function(data){
            	callback(data);
            }
        });
	}catch(err){
		emitirErrorCatch(err, "cargarMenu")
	}
}

/* @guardarOpcionesXML : registra localmente en el array "arrayTodasLasOpciones"; las opciones del menu con todos sus campos.
    PARAMETROS:
     - data: informacion de las opciones del menu obtenida del archivo menu.xml
*/
function guardarOpcionesXML(data){ // despues de haber buscado las opciones del menu.xml se guardan en una variable llamada arrayTodasLasOpciones
	try{
		$(data).find("menu").each( function(){ // busca el tag 'menu' y obtiene sus propiedades
            v_idMenu=$(this).find("idMenu").text(); // Guarda id del menu
            v_nombreMenu=$(this).find("nombreMenu").text(); // guarda nombre del menu
            v_hijo=$(this).find("hijo").text(); // sub menu
            v_padre=$(this).find("padre").text(); // menu de nivel superior
            v_href=$(this).find("href").text(); // direccion href
            v_categoria=$(this).find("categoria").text();
            // guarda en el arreglo:
            arrayTodasLasOpciones[arrayTodasLasOpciones.length]={nombreMenu:v_nombreMenu, idMenu:parseInt(v_idMenu), hijo:v_hijo, padre:v_padre, href:v_href, categoria:v_categoria};
        	if(parseInt(v_idMenu)>idMenuMax){
        		idMenuMax=parseInt(v_idMenu);
        	}
        });
	}catch(err){
		emitirErrorCatch(err, "guardarOpcionesXML")
	}
}

/* @consultarMenuUsuario: consulta las opciones permitidas para el usuario identificado, segun los perfiles que tenga.
    PARAMETROS:
     - perfilUsuario1, perfilUsuario2, perfilUsuario3 : Los 3 perfiles del usuario.
*/
function consultarMenuUsuario(perfilUsuario1, perfilUsuario2, perfilUsuario3){
    try{               
        var usuarioMaster=false; // UsuarioMaster es el usuario que tiene todos los privilegios 1 = Administrador ; 2 = Supervisor 
        if(perfilUsuario1==1 || perfilUsuario1==2){ // Busca si es un usuario MASTER (TSIGO o ADMIN)
            usuarioMaster=true;
        }
        if(usuarioMaster==true){ // si es usuario master carga todas las opciones encontradas en el archivo menu.xml
            cargarMenu(arrayTodasLasOpciones) 
        }else{ // caso contrario buscara en la base de datos las opciones permitidas al usuario segundo su perfil 1 , perfil2 y perfil 3
            var parametros="";
                parametros +="&idPerfil1="+perfilUsuario1;
                parametros +="&idPerfil2="+perfilUsuario2;
                parametros +="&idPerfil3="+perfilUsuario3;
            consultarWebServiceGet("getOpcionesMenu", parametros, function(data){
                cargarMenu(data)
            }); // getOpcionesMenu => Buscara todas las opciones permitidas al usuario y despues enviara dicha informacion a la funcion cargarMenu()
        }
    }catch (err){
        emitirErrorCatch(err, "consultarMenuUsuario")
    }
}
/* @cargarMenu: Carga las opciones del menu permitidas al usuario
   PARAMETROS:
    - arrayDeOpcionesUsuario: Opciones del menu permitidas del usuario
*/
function cargarMenu(arrayDeOpcionesUsuario){ // arrayDeOpcionesUsuario = las opciones permitidas al usuario identificado; arrayTodasLasOpciones = Todaslas opciones encontradas en menu.xml
	try{		
		arrayOpcionesSeleccionadas.length=0; // reinicia las opciones que estuvieron seleccionadas (Opciones padres e hijas)
        if(arrayDeOpcionesUsuario.length>0){
            // completa los demas atributos de las opciones del usuario (arrayDeOpcionesUsuario)
            for(var i=0; i<arrayDeOpcionesUsuario.length; i++){
                for(var y=0; y<arrayTodasLasOpciones.length; y++){
                    if(arrayDeOpcionesUsuario[i].idMenu==arrayTodasLasOpciones[y].idMenu){ // encuentra el arreglo
                        arrayDeOpcionesUsuario[i]=arrayTodasLasOpciones[y];
                        arrayDeOpcionesUsuario[i].indiceEnArreglo=i; // guarda el indice del arreglo
                        arrayDeOpcionesUsuario[i].drownMenu=""; // no tiene lista de sub menu
                        break; // sale del for si encuentra
                    }
                }
                if(parseInt(arrayDeOpcionesUsuario[i].categoria)>maxCategoria){
                    maxCategoria=parseInt(arrayDeOpcionesUsuario[i].categoria); // calcula la max categoria que tiene el menu
                }
            }
            arrayOpcionesUsuario=arrayDeOpcionesUsuario; // Guarda en la variable global de arrayOpcionesUsuario
            // Luego carga las opciones segun en nivel de categoria
            for(var nivelCategoria=0; nivelCategoria<=maxCategoria; nivelCategoria++){
                arrayOpcionesSeleccionadas[nivelCategoria]={opcion:""};
                // Busca solo las opciones de la categoria actual
                var arrayOpcionesTemp=new Array(); // guarda las opciones de la categoria
                for(var i=0; i<arrayDeOpcionesUsuario.length; i++){
                    if(arrayDeOpcionesUsuario[i].categoria==nivelCategoria){
                        arrayOpcionesTemp[arrayOpcionesTemp.length]=arrayDeOpcionesUsuario[i];
                    }
                }
                // carga las opciones del nivel seleccionado
                for(var i=0; i<arrayOpcionesTemp.length; i++){
                    // busca si pertenece si es hijo de una opciones superior
                    var elementoAppend=$("#menuGeneral");
                    if(arrayOpcionesTemp[i].padre!=""){ // tiene padre
                        // busca el menu creado
                        for(var y=0; y<arrayDeOpcionesUsuario.length; y++){
                            if(arrayOpcionesTemp[i].padre==arrayDeOpcionesUsuario[y].idMenu){ // lo encuentra
                                // Busca si tiene creado una lista de menu
                                var idUL="ul_"+y;
                                if(arrayDeOpcionesUsuario[y].drownMenu==""){ // no tiene creao una sub lista de menus
                                    $("#"+arrayDeOpcionesUsuario[y].idMenu).append("<ul id='"+idUL+"' class='dropdown-menu'></ul>");
                                    $("#"+arrayDeOpcionesUsuario[y].idMenu).prop("class", "dropdown-submenu right");
                                    arrayDeOpcionesUsuario[y].drownMenu=idUL;
                                }
                                elementoAppend=$("#"+idUL);
                                break;
                            }
                        }
                    }
                    var onclick="";
                    if(arrayOpcionesTemp[i].href!=""){ // se agrego un enlace en la opcion
                        onclick="onclick='cargarPagina("+'"'+arrayOpcionesTemp[i].idMenu+'"'+")'";
                    }
                    elementoAppend.append("<li class='' "+onclick+" id='"+arrayOpcionesTemp[i].idMenu+"'><a>"+arrayOpcionesTemp[i].nombreMenu+"</a></li>");
                }
            }            
            for(var i=0; i<arrayDeOpcionesUsuario.length; i++){
                if(arrayDeOpcionesUsuario[i].href==opcionDefault){
                    cargarPagina(arrayDeOpcionesUsuario[i].idMenu);
                }
            }
            $.fancybox.close();
            //arrayDeOpcionesUsuario=null;
        }else{
        	fancyAlert("Este Usuario no tiene opciones asignadas")
        }
	}catch(err){
		emitirErrorCatch(err, "cargarMenu")
	}
}

/* @cargarPagina: carga la pagina de la opcion seleccionada
    PARAMETROS:
      - idMenu: id de la Opcion a cargar
*/
function cargarPagina(idMenu){
    try{
        for(var i=0; i<arrayOpcionesUsuario.length; i++){ // Busca los atributos del menu
            if(arrayOpcionesUsuario[i].idMenu==idMenu){
                // despinta las opciones seleccionadas anteriormente
                for(var x=0; x<arrayOpcionesSeleccionadas.length; x++){
                    if(arrayOpcionesSeleccionadas[x].opcion!=""){
                        nuevaClase=$("#"+arrayOpcionesSeleccionadas[x].opcion).prop("class").replace("active", ""); // quita pintado active
                        $("#"+arrayOpcionesSeleccionadas[x].opcion).prop("class", nuevaClase);
                        arrayOpcionesSeleccionadas[x].opcion=""; // quita flag
                    }
                }
                //**** fin de despintado
                var categoriaOpcionSeleccionada=arrayOpcionesUsuario[i].categoria;
                var paginaHref=arrayOpcionesUsuario[i].href;
                var idMenuActual=idMenu;
                var padreOpcion=arrayOpcionesUsuario[i].padre;
                for(var y=categoriaOpcionSeleccionada; y>=0; y--){ // pinta todas las opciones vinculadas
                    $("#"+idMenuActual).prop("class", $("#"+idMenuActual).prop("class")+" active");
                    arrayOpcionesSeleccionadas[y].opcion=idMenuActual;
                    if(padreOpcion!=""){
                        idMenuActual=padreOpcion;
                        padreOpcion="";
                    }else{
                        // se busca la opcion Padre
                        for(var z=0; z<arrayOpcionesUsuario.length; z++){
                            if(arrayOpcionesUsuario[z].idMenu==idMenuActual){
                                idMenuActual=arrayOpcionesUsuario[z].padre; // toma al padre como el siguiente menu a pintar
                                break;
                            }
                        }
                    }
                }
                $("#content").prop("src", paginaHref.trim()); // carga pagina
                break;
            }
        }
        // muestra la opcion seleccionada:
        var espacio="";// sirve para dejar espacios entre las viñetas
        var descripcionOpcionSeleccionada="";
        $("#opcionSeleccionada > tbody").html(""); // Limpia tabla de opcion seleccionada
        if(arrayOpcionesSeleccionadas.length==0){
            descripcionOpcionSeleccionada="<tr style='color:#ffffff; font-size:11px;'>"+
                "<td style='font-weight:bold; text-align:center;'>NINGUNA OPCION SELECCIONADA</td>"+
                "</tr>";
        }else{
            for(var i=0; i<arrayOpcionesSeleccionadas.length; i++){
                if(arrayOpcionesSeleccionadas[i].opcion!=""){             
                    descripcionOpcionSeleccionada=descripcionOpcionSeleccionada+"<tr style='color:#ffffff; font-size:10px; height:18px;'>"+
                        "<td style='font-weight:bold;'>"+espacio+" <img src='images/icono-vineta.png' style='height:9px; width:9px;'/> "+getOpcionMenuXid(arrayOpcionesSeleccionadas[i].opcion)+"</td>"+
                        "</tr>";
                    
                    //descripcionOpcionSeleccionada=descripcionOpcionSeleccionada+getOpcionMenuXid(arrayOpcionesSeleccionadas[i].opcion)
                    espacio=espacio+"&nbsp;&nbsp;&nbsp;&nbsp;";
                }
            }
        }
        //labelTextWebPlus("labelMenu", descripcionOpcionSeleccionada);
        $("#opcionSeleccionada > tbody").append(descripcionOpcionSeleccionada);
    }catch(err){
        emitirErrorCatch(err, "cargarPagina");
    }
}

/* @getOpcionMenuXid: Busca la opcion de menu por su id
    PARAMETROS:
      - id : id de la opcion a buscar
*/
function getOpcionMenuXid(id){
	try{
		var nombreMenu;
	    for(var i=0; i<arrayTodasLasOpciones.length; i++){
	        if(arrayTodasLasOpciones[i].idMenu==id){
	            nombreMenu=arrayTodasLasOpciones[i].nombreMenu;
	            break;
	        }        
	    }
	    return nombreMenu;
	}catch(err){
		emitirErrorCatch(err, "getOpcionMenuXid")
	}        
}

