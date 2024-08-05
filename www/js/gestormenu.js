$(document).ready(function(){
	cargarConfiguracionDelMenu();
    $("#eliminarOpcion").click(eliminarOpcion);
});
var opcionesAgregadasAdicionales=0;
var idMenuMax=parent.idMenuMax; // obtiene el idMenuMax
var arrayOpcionesConfig= new Array(); // arreglo q contiene la configuracion del nuevo menu
var valorRadioSeleccionado=new Array() // array q contiene el valor del radiobutton seleccionado
var filaSeleccionadaAnterior;
var arrayOpcionesUsadasXperfiles=new Array(); // array q contiene las opciones que estan usadas en algunos perfiles
var arrayOpciones = parent.arrayTodasLasOpciones;

function cargarConfiguracionDelMenu(){ // carga las opciones del menu actualmente guardas en el xml
    try{
        //valorRadioSeleccionado.length=0;
        fancyAlertWait("Cargando");
        arrayOpcionesUsadasXperfiles.length=0;
        arrayOpcionesConfig.length=0;
        for(var i=0; i<arrayOpciones.length; i++){
            arrayOpcionesConfig[arrayOpcionesConfig.length]={
                nombreMenu:arrayOpciones[i].nombreMenu, 
                idMenu:arrayOpciones[i].idMenu, 
                hijo:arrayOpciones[i].hijo, 
                padre:arrayOpciones[i].padre, 
                href:arrayOpciones[i].href, 
                categoria:arrayOpciones[i].categoria
            };
            $("#tablaConfig > tbody").append("<tr id='tr_"+arrayOpciones[i].idMenu+"_"+i+"' style='font-size: 13.5px; font-weight: bold; background-color: #afcaff; height: 40px;'>" +
                "<td>" +
                "<center><input type='checkbox' class='seleccion' name='seleccion' value='tr_"+arrayOpciones[i].idMenu+"_"+i+"' onchange='seleccionarMenu(this)'>" +
                "</center>" +
                "</td>"+
                "<td>" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='0' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >1" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='1' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >2" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='2' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >3" +
                "</td>" +
                "<td id='button0_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button1_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button2_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td><center><input type='text' value='"+arrayOpciones[i].href+"'></center></td>" +
                "</tr>");
            $("input[name=seleccionNivel"+i+"][value='"+arrayOpciones[i].categoria+"']").prop("checked",true); // selecciona radio button de la categoria

            $("#button"+arrayOpciones[i].categoria+"_"+i).html(
                "<input type='text' value='"+arrayOpciones[i].nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
                );
            valorRadioSeleccionado[valorRadioSeleccionado.length]=arrayOpciones[i].categoria;
        }
        consultarWebServiceGet("getAllOpcionesUsadas", "", function(data){
            for(var i=0; i<data.length; i++){
                arrayOpcionesUsadasXperfiles[arrayOpcionesUsadasXperfiles.length]={idMenu:rptaWebservice[i].idMenu};
            }
            $.fancybox.close();    
        });
    }catch (err){
        emitirErrorCatch(err, "cargarConfiguracionDelMenu")
    }
}
function getCurrentOptionsInUI(){
	try{
		var arrayTempMenu = new Array();
		$('#tablaConfig > tbody tr').each(function () {
            radio = $(this).find("td").eq(1).find("input").attr("name");
            categoriaDeFila=$("input[type='radio'][name='"+radio+"']:checked").val(); // categoria seleccionada en la fila
            cajaTextoButton=$(this).find("td").eq(2+parseInt(categoriaDeFila)).find("input");
            v_nombreMenu=$(cajaTextoButton).val(); // trae el nombre del menu
            v_idMenu=$(this).find("td").eq(0).find("input").val().split("_");
            v_idMenu=v_idMenu[1];
            v_href=$(this).find("td").eq(5).find("input").val();
            if(v_href==""){
                v_hijo="T"; // TRUE
            }else{
                v_hijo="F"; // FALSE, no tiene sub menusssss
            }
            if(categoriaDeFila==0){
                v_padre="";
            }else{                
                for(var y=arrayTempMenu.length-1; y>=0; y--){
                    categoriaAnterior=arrayTempMenu[y].categoria;
                    if(categoriaDeFila-categoriaAnterior<=1){
                        if(categoriaDeFila-categoriaAnterior==1){
                            v_padre=arrayTempMenu[y].idMenu;
                            estadoPadre=true;
                            break;
                        }
                    }else{
                        break;
                    }
				}
			}
			arrayTempMenu.push({
                nombreMenu:v_nombreMenu,
                idMenu:v_idMenu,
                hijo:v_hijo,
                padre:v_padre,
                href:v_href,
                categoria:categoriaDeFila
            });
               
		});
		return arrayTempMenu;
	}catch(err){
		emitirErrorCatch(err, "getCurrentOptionsInUI");
	}
}
function cambiarNivel(categoria, index){ // permite cambiar el nivel de alguna opcion
    try{
        $("#button"+arrayOpcionesConfig[index].categoria+"_"+index).children().remove();
        $("#button"+categoria+"_"+index).html(
                "<input type='text' value='"+arrayOpcionesConfig[index].nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
        );
		arrayOpcionesConfig[index].categoria=categoria;
    }catch (err){
        emitirErrorCatch(err, "cargarConfiguracionDelMenu")
    }
}
function seleccionarMenu(thes){ // permite seleccionar alguna opcion del perfil
    try{
        trSeleccionada=$(thes).parents().get(2);//.css("background-color", "yellow");
        $(trSeleccionada).css("background-color", "yellow");
        $('input.seleccion').not(thes).prop('checked', false);
        if(filaSeleccionadaAnterior!=undefined){ // existe fila seleccionada anteriormente
            $("#"+filaSeleccionadaAnterior).css("background-color", "#afcaff");
        }
        filaSeleccionadaAnterior=trSeleccionada.id;

    }catch (err){
        emitirErrorCatch(err, "seleccionarMenu")
    }
}
function agregarMenu(){ // agrega una opcion al menu
    try{
        if(validarInputsValueXid("idNombreMenu-Nombre Menu")){
            if($("input[type='radio'][name='nivelSeleccion']:checked").length>0){
                var indexLast=arrayOpcionesConfig.length;
                opcionesAgregadasAdicionales++;
                var idMenuNuevaOpcion=idMenuMax+opcionesAgregadasAdicionales; // Obtiene el nuevo Id del menu que sera agregado
                var nombreMenu = $("#idNombreMenu").val();
                var categoria = $("input[type='radio'][name='nivelSeleccion']:checked").val();
                $("#tablaConfig > tbody").prepend("<tr id='tr_"+idMenuNuevaOpcion+"_"+indexLast+"' style='font-size: 13.5px; font-weight: bold; background-color: #afcaff; height: 40px;'>" +
                    "<td>" +
                    "<center>" +
                    "<input type='checkbox' class='seleccion' name='seleccion' value='tr_"+idMenuNuevaOpcion+"_"+indexLast+"' onchange='seleccionarMenu(this)'>" +
                    "</center>" +
                    "</td>"+
                    "<td>" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='0' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")'>1" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='1' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")' >2" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='2' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")' >3" +
                    "</td>" +
                    "<td id='button0_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td id='button1_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td id='button2_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td><center><input type='text' value=''></center></td>" +
                    "</tr>");

                $("input[name=seleccionNivel"+indexLast+"][value='"+categoria+"']").prop("checked",true); // selecciona radio button de la categoria
                $("#button"+categoria+"_"+indexLast).html(
                        "<input type='text' value='"+nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
                );
                arrayOpcionesConfig[arrayOpcionesConfig.length]={nombreMenu:nombreMenu, idMenu:indexLast, hijo:"", padre:"",  href:"", categoria:categoria};
                // **** limpia texto y selecciones
                $("#idNombreMenu").val("");
                $("input[name=nivelSeleccion]").prop("checked", false);
                valorRadioSeleccionado[indexLast]=categoria;

            }else{
                fancyAlert("falta seleccionar un nivel")
            }
        }

    }catch (err){
        emitirErrorCatch(err, "agregarMenu")
    }
}
function subirBajar(flag){ // permite cambiar de orden a una opcion
    try{
        // busca si existen radios seleccionados
        radioSeleccionado=$("input[type='checkbox'][name='seleccion']:checked");
        if(radioSeleccionado.length>0){
            // guardar toda la variable de la fila TR y eliminarla despues la copiamos
            var filaHMTLtr=$("#"+radioSeleccionado.val())[0].outerHTML;
            switch(flag){
                case '+':
                    // sube la fila:
                    filaAnterior = $("#"+radioSeleccionado.val()).prev('tr');
                    console.log("ant: "+filaAnterior.html());
                    if(filaAnterior.html()!=undefined){
                        $("#"+radioSeleccionado.val()).remove(); // elimina
                        filaAnterior.before(filaHMTLtr);
                    }
                    break;
                case '-':
                    filaPosterior = $("#"+radioSeleccionado.val()).next('tr');
                    console.log("post: "+filaPosterior.html());
                    if(filaPosterior.html()!=undefined){
                        $("#"+radioSeleccionado.val()).remove(); // elimina
                        filaPosterior.after(filaHMTLtr);
                    }
                    break;
            }
            // obtenemos en index:
            getIndex=radioSeleccionado.val().split("_");
            getIndex=getIndex[2];
            $("input[name=seleccionNivel"+getIndex+"][value='"+arrayOpcionesConfig[getIndex].categoria+"']").prop("checked",true);
            $("input[type='checkbox'][name='seleccion'][value='"+radioSeleccionado.val()+"']").prop("checked", true);

        }else{
            fancyAlert("Debe seleccionar una fila para ordenarla");
            return;
        }
    }catch (err){
        emitirErrorCatch(err, "subirBajar")
    }
}
var nuevoArrayMenu=new Array();
function actualizarMenu(){
    try{
        var grabar=true;
        fancyConfirm("Estas seguro de actualizar el menu", function(estado){
            if(estado){
                cantidadFilas=$('#tablaConfig > tbody tr').length; // obtenemos la cantidad de opciones a guardar 
                fancyAlertWait("Guardando");
                nuevoArrayMenu.length=0;
                var cont=0;
                $('#tablaConfig > tbody tr').each(function () {
                    radio = $(this).find("td").eq(1).find("input").attr("name");
                    categoriaDeFila=$("input[type='radio'][name='"+radio+"']:checked").val(); // categoria seleccionada en la fila
                    cajaTextoButton=$(this).find("td").eq(2+parseInt(categoriaDeFila)).find("input");
                    v_nombreMenu=$(cajaTextoButton).val(); // trae el nombre del menu
                    v_idMenu=$(this).find("td").eq(0).find("input").val().split("_");
                    v_idMenu=v_idMenu[1];
                    v_href=$(this).find("td").eq(5).find("input").val();
                    if(cont==0 && categoriaDeFila>0){
                        fancyAlertFunction('La primera opcion del menú llamado: "'+$(cajaTextoButton).val()+'", solo puede ser de nivel 1', function(estado){
                            if(estado){
                                $(cajaTextoButton).focus();
                            }
                        });
                        grabar=false;
                        return false;
                    }
                    if(v_href==""){
                        if(cont+1==cantidadFilas){ // ultima fila
                            fancyAlertFunction('La ultima opción del menú llamado: "'+$(cajaTextoButton).val()+'", debe contener una dirección', function(){
                                if(estado){
                                }
                            });
                            grabar=false;
                            return false;
                        }
                        v_hijo="T"; // TRUE
                    }else{
                        v_hijo="F"; // FALSE, no tiene sub menusssss
                    }
                    if(categoriaDeFila==0){
                        v_padre="";
                    }else{
                        estadoPadre=false;
                        for(var y=nuevoArrayMenu.length-1; y>=0; y--){
                            categoriaAnterior=nuevoArrayMenu[y].categoria;
                            if(categoriaDeFila-categoriaAnterior<=1){
                                if(categoriaDeFila-categoriaAnterior==1){
                                    v_padre=nuevoArrayMenu[y].idMenu;
                                    estadoPadre=true;
                                    break;
                                }
                            }else{
                                break;
                            }
                        }
                        if(estadoPadre==false){
                            fancyAlertFunction('La opcion del menú llamado: "'+$(cajaTextoButton).val()+'", tiene que tener un menu padre (NO PUEDE HABER VACÍO ENTRE DOS OPCIONES CONSECUTIVAS)', function(estado){
                                if(estado){
                                    $(cajaTextoButton).focus();
                                }
                            });
                            grabar=false;
                            return false;
                        }
                    }
                    if(cont>0){
                        if(categoriaDeFila - nuevoArrayMenu[nuevoArrayMenu.length-1].categoria!=1 && nuevoArrayMenu[nuevoArrayMenu.length-1].href==""){
                            fancyAlertFunction('La opcion del menú llamado: "'+nuevoArrayMenu[nuevoArrayMenu.length-1].nombreMenu+'", tiene que tener una direccion', function(estado){
                                if(estado){

                                }
                            });
                            grabar=false;
                            return false;
                        }
                    }
                    for(var i=0; i<arrayOpcionesUsadasXperfiles.length;i++){
                        if(arrayOpcionesUsadasXperfiles[i].idMenu==v_idMenu){
                            for(var y=0; y<arrayOpciones.length; y++){ //Buscamos la opcion dentro del arreglo arrayOpciones
                                if(arrayOpciones[y].idMenu==v_idMenu){
                                    if(arrayOpciones[y].padre!=v_padre || arrayOpciones[y].hijo!=v_hijo){
                                        fancyAlertFunction('No se pueden guardar los cambios de la opcion: "'+$(cajaTextoButton).val()+'", por que existen usuarios que hacen uso de esta opción y podría alterar la funcionalidad de sistema (OPCION USADA EN PERFILES)', function(estado){
                                            if(estado){
                                                $(cajaTextoButton).focus();
                                            }
                                        });
                                        grabar=false;
                                        return false;
                                        break;
                                    }                                    
                                }
                            }                
                        }
                    }
                    nuevoArrayMenu[cont]={
                        nombreMenu:v_nombreMenu,
                        idMenu:v_idMenu,
                        hijo:v_hijo,
                        padre:v_padre,
                        href:v_href,
                        categoria:categoriaDeFila
                    };
                    cont++;
                });
                if(grabar){
                    var parametros="";
                    for(var i=0; i<nuevoArrayMenu.length; i++){
                        if(i>0){
                            parametros=parametros+";";
                        }
                        parametros=parametros+nuevoArrayMenu[i].idMenu+"[/]"+nuevoArrayMenu[i].nombreMenu+"[/]"+
                            nuevoArrayMenu[i].hijo+"[/]"+nuevoArrayMenu[i].padre+"[/]"+nuevoArrayMenu[i].href+"[/]"+nuevoArrayMenu[i].categoria; // separaciones

                    } 
                    $.post("webservice?funcion=actualizarMenuXML",
                        {
                            //array: JSON.stringify(nuevoArrayMenu)
                            array:parametros
                        },
                        function(data){
                            if(data=='T'){
                                fancyAlertFunction("Se actualizo correctamente el menú", function(estado){
                                    if(estado){
                                        parent.arrayTodasLasOpciones.length=0;
                                        parent.$("#menuGeneral").html("");
                                        for(var z=0; z<nuevoArrayMenu.length; z++){
											if(parseInt(nuevoArrayMenu[z].idMenu)>parent.idMenuMax){
												parent.idMenuMax=parseInt(nuevoArrayMenu[z].idMenu);
											}
                                            parent.arrayTodasLasOpciones[parent.arrayTodasLasOpciones.length]=nuevoArrayMenu[z];
                                        }
                                        parent.$("#content").prop("src", "");                                        
                                        // Vuelve a cargar las opciones
                                        var usuarioMaster=false;
                                        if(parent.perfilUsuario1==1 || parent.perfilUsuario1==2){ // Busca si es un usuario MASTER (TSIGO o ADMIN)
                                            usuarioMaster=true;
                                        }
                                        if(usuarioMaster==true){
                                            parent.cargarMenu(parent.arrayTodasLasOpciones)
                                        }else{
                                            parent.cargarMenu(parent.arrayOpcionesUsuario)
                                        }
                                        
                                    }
                                });
                            }
                        }, 'json'
                    ).fail(
                        function(xhr, textStatus, errorThrown) {
                           fancyAlert(xhr.responseText);
                        }
                    );
                }
            }
        });
    }catch (err){
        emitirErrorCatch(err, "actualizarMenu")
    }
}
function getChildrenOptions(idMenu, categoria){ // optiones las opciones hijas que no han sido eliminadas en memoria
	try{
		var childrenOptionList = new Array();
		for(var i=0; i<arrayOpciones.length; i++){
			if(arrayOpciones[i].padre==idMenu && !arrayOpciones[i].deleted){
				if(parseInt(arrayOpciones[i].categoria)==parseInt(categoria)+1)
				childrenOptionList.push(arrayOpciones[i]);				
			}
		}
		return childrenOptionList;
	}catch(err){
		emitirErrorCatch(err, "getChildrenOptions");
	}
}
function eliminarOpcion() { // elimina una opcion
    try{
		nuevoArrayMenu.length=0;
		nuevoArrayMenu = getCurrentOptionsInUI();
        radioSeleccionado=$("input[type='checkbox'][name='seleccion']:checked");
        if(radioSeleccionado.length>0){
            // Busca el id de la opcion
            var idMenu=radioSeleccionado.val().split("_");
            idMenu=idMenu[1];
            for(var i=0; i<nuevoArrayMenu.length; i++){
                if(nuevoArrayMenu[i].idMenu==idMenu){
                    //if(nuevoArrayMenu[i].hijo=="T"){
						if(i+1 < nuevoArrayMenu.length){
							if(parseInt(nuevoArrayMenu[i+1].categoria) == parseInt(nuevoArrayMenu[i].categoria) +1){
								//if(getChildrenOptions(idMenu, arrayOpciones[i].categoria).length>0){
									fancyAlert("No se puede eliminar la opción porque tiene sub menus");
									return;
								//}
							}							
						}
						
                    //}
                }
            }
            for(var i=0; i<arrayOpcionesUsadasXperfiles.length; i++){ // verifica que no se una opcion de perfil
                if(arrayOpcionesUsadasXperfiles[i].idMenu==idMenu){
                    fancyAlert("No se puede eliminar esta opción porque esta siendo usada en un perfil de usuario");
                    return;
                }
            }
            $("#"+radioSeleccionado.val()).remove(); // elimina
            for(var i=0; i<arrayOpciones.length; i++){
				if(arrayOpciones[i].idMenu==idMenu){
					arrayOpciones[i].deleted=true; // elimina en memoria la opcion
					break;
				}
			}
			if(opcionesAgregadasAdicionales>0){
                if(idMenu == idMenuMax+opcionesAgregadasAdicionales){
                    opcionesAgregadasAdicionales--;
                }
            }
        }else{
            fancyAlert("Debe seleccionar la opcion a eliminar")
            return;
        }
    }catch(err){
        emitirErrorCatch(err, "eliminarOpcion")
    }
}