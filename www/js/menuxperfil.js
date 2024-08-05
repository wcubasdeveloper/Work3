arrayOpciones=parent.parent.arrayTodasLasOpciones;
var nuevoArrayMenu = new Array();
$(document).ready(function(){	
	cargarMenuXperfil();
});
function cargarMenuXperfil(){
	try{
		fancyAlertWait("Cargando");
		for(var i=0; i<arrayOpciones.length; i++){
            $("#tablaConfig > tbody").append("<tr id='tr_"+i+"' style='font-size: 13.5px; font-weight: bold; background-color: #afcaff; height: 40px;'>" +
                "<td>" +
                "<center><input type='checkbox' name='seleccion'  value='tr_"+arrayOpciones[i].idMenu+"' id='"+arrayOpciones[i].idMenu+"_"+arrayOpciones[i].categoria+"_"+arrayOpciones[i].padre+"' onchange='seleccionarMenuPerfil(this)'>" +
                "</center>" +
                "</td>"+
                "<td id='button0_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button1_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button2_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "</tr>");
            $("#button"+arrayOpciones[i].categoria+"_"+i).html(
                "<input type='text' id='btn_"+arrayOpciones[i].idMenu+"' name='"+arrayOpciones[i].hijo+"' disabled value='"+arrayOpciones[i].nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 150px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
                );
        }
        $('#tablaConfig').dataTable({
        "scrollY":"320px",
        "pagingType": "simple",
        "info":     false,
        "lengthChange": false,
        "scrollCollapse": false,
        "language": {
            "search": "Buscar:",
            "lengthMenu": "Visualizar _MENU_ por pag.",
            "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
            "info": "Pag _PAGE_ de _PAGES_",
            "infoEmpty": "No Disponible",
            "infoFiltered": "(Filtrado de _MAX_ registros)",
            "paginate": {
                "next": "Siguiente",
                "previous": "Anterior"
            }
        },
        "bSort": false,
        "columns": [
            { "width": "13%" },
            { "width": "29%" },
            { "width": "29%" },
            { "width": "29%" },
        ],
        paging:false,
        searching:false
    });
        var parametros="&idPerfil1="+parent.$("#idPerfil").val();
        consultarWebServiceGet("getOpcionesMenu", parametros, cargarOpcionesPerfilTabla); // Busca las opciones asociadas al perfil  
	}catch (err){
        emitirErrorCatch(err, "cargarMenuXperfil")
	}	
}
function cargarOpcionesPerfilTabla(data){
    try{
        for(var i=0; i<data.length; i++){
            checkboxSeleccionado=$("input[type='checkbox'][name='seleccion'][value='tr_"+data[i].idMenu+"']");
            checkboxSeleccionado.prop("checked", true); // Marca con check la opcion 
            trSeleccionada=$(checkboxSeleccionado).parents().get(2); // busca la fila
            $(trSeleccionada).css("background-color", "yellow");  // colorea de color amarillo
        }
        $.fancybox.close();
    }catch (err){
        emitirErrorCatch(err, "cargarOpcionesPerfilTabla")
    }   
}
function seleccionarMenuPerfil(object){ // pinta de color amarillo la fila de la opcion seleccionada 
    try{
        // Obtenemos la fila TR donde se encuentra ubicado el checkbox:
        trSeleccionada=$(object).parents().get(2);//.css("background-color", "yellow");
        // verificamos si se ha seleccionado o no el checkbox
        if($(object).prop('checked')==true){ // se selecciono la opcion
            $(trSeleccionada).css("background-color", "yellow"); // pinta de amarillo la fila de la opcion seleccionada
        }else{
            $(trSeleccionada).css("background-color", "transparent");  // caso contrario la vuelve al color anterior 
        }
    }catch (err){
        emitirErrorCatch(err, "seleccionarMenuPerfil")
    }   
}
function actualizarMenuXperfil(){ // actualiza los cambios efectuados para el perfil
    try{
        fancyConfirm("Estas seguro de actualizar el menu para este perfil", function(estado){
            if(estado){
                fancyAlertWait("Guardando");
                var grabar=true;
                var cont=0;
                cantidadFilasSeleccionadas=$("input:checked").length;
                nuevoArrayMenu.length=0;
                $('#tablaConfig > tbody tr').each(function () { // recorre cada fila de la tabla HTML
                    checkBx = $(this).find("td").eq(0).find("input"); // encuentra el checkbox
                    if(checkBx.prop("checked")==true){ // verifica si se encuentra seleccionado
                        // busca la categoria de la opcion (0,1 o 2), el ID del TR contiene informacion del idMenu y categoria
                        idCheckBx=checkBx.attr("id");
                        // obtenemos idMenu y categoria
                        idCheckBx=idCheckBx.split("_");
                        v_idMenu=idCheckBx[0];
                        v_categoria=idCheckBx[1];
                        v_padre=idCheckBx[2];
                        cajaTextoButton=$(this).find("td").eq(1+parseInt(v_categoria)).find("input");
                        // verifica que la opcion anterior no contenga sub menus
                        if(cont>0){
                            TienSubMenuOpcionAnterior=$("#btn_"+nuevoArrayMenu[cont-1].idMenu).attr("name");
                            if(TienSubMenuOpcionAnterior=="T" && nuevoArrayMenu[cont-1].idMenu!=v_padre){
                                fancyAlertFunction('Tiene que seleccionar sub menu(s) para la opcion "'+$("#btn_"+nuevoArrayMenu[cont-1].idMenu).val()+'"', function(estado){
                                    if(estado){
                                       $("#btn_"+nuevoArrayMenu[cont-1].idMenu).focus();
                                    }
                                });
                                grabar=false;
                                return false;
                            }
                        }
                        if(v_categoria>0){
                            if(cont==0){
                                fancyAlertFunction('La primera opcion del menú, solo puede ser de nivel 1', function(estado){
                                    if(estado){
                                        $(cajaTextoButton).focus();
                                    }
                                });
                                grabar=false;
                                return false;
                            }else{
                                // verificar que no haya vacios
                                estadoPadre=false;
                                for(var y=nuevoArrayMenu.length-1; y>=0; y--){
                                    categoriaAnterior=nuevoArrayMenu[y].categoria;
                                    idMenuAnterior=nuevoArrayMenu[y].idMenu;
                                    if(categoriaAnterior!=v_categoria){
                                        if(v_categoria-categoriaAnterior==1 && idMenuAnterior==v_padre){
                                            estadoPadre=true;
                                            break;
                                            
                                        }
                                    }
                                }
                                if(estadoPadre==false){
                                    fancyAlertFunction('Tiene que seleccionar LA OPCION PRINCIPAL para la opcion "'+$(cajaTextoButton).val()+'" (NO PUEDE HABER VACÍO ENTRE DOS OPCIONES CONSECUTIVAS)', function(estado){
                                        if(estado){
                                            $(cajaTextoButton).focus();
                                        }
                                    });
                                    grabar=false;
                                    return false;
                                }
                            }
                        }
                        if(cantidadFilasSeleccionadas-cont==1){
                            tieneSubMenus=$("#btn_"+v_idMenu).attr("name");
                            if(tieneSubMenus=="T"){
                                fancyAlertFunction('Tiene que seleccionar sub menu(s) para la opcion "'+$("#btn_"+v_idMenu).val()+'"', function(estado){
                                        if(estado){
                                            $(cajaTextoButton).focus();
                                        }
                                    });
                                grabar=false;
                                return false;
                            }
                        }
                        nuevoArrayMenu[cont]={
                            idMenu:v_idMenu,
                            padre:v_padre,
                            categoria:v_categoria
                        };
                        cont++;
                    }
                });
                if(grabar && nuevoArrayMenu.length>0){
                    //$.fancybox.close();
                    //console.log("hecho");
                    var parametros="";
                    for(var i=0; i<nuevoArrayMenu.length; i++){
                        if(i>0){
                            parametros=parametros+";";
                        }
                        parametros=parametros+nuevoArrayMenu[i].idMenu+"-"+nuevoArrayMenu[i].padre+"-"+nuevoArrayMenu[i].categoria;
                    } 
                    $.post("webservice?funcion=actualizarMenuXperfil",
                        {
                            array:parametros,
                            idPerfil: parent.$("#idPerfil").val()
                        },
                        function(data){
                            if(data.length>0){
                                fancyAlertFunction("El menu se actualizo correctamente", function(e){
                                   if(e){
                                    parent.$.fancybox.close();
                                   }     
                               });
                            }
                        }, 'json'
                    ).fail(
                        function(xhr, textStatus, errorThrown) {
                           fancyAlert(xhr.responseText);
                        }
                    );
                }else{
                    if(nuevoArrayMenu.length==0 && grabar){
                        fancyAlert("Debe seleccionar al menos una opción para el perfil");
                    }
                }
            }
        });
    }catch (err){
        emitirErrorCatch(err, "actualizarMenuXperfil")
    }   
}