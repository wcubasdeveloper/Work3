var dataTableMotivos;
var accion=undefined; // E=Editar ; A=Agregar
var arrayLocalRegistros=new Array();
cargarInicio(function(){
	$("#idNuevo").click(function(){
		nuevoMotivo();
	});
	$("#idEditar").click(function(){
		editarMotivo();
	});
    $("#Eliminar").click(function(){
        eliminarMotivo();
    });
	cargarMotivos();
});
function cargarMotivos(){
	try{
		fancyAlertWait("Cargando");
		webService2("getAllMotivos", "", "cargarTablaMotivos()");

	}catch(err){
        emitirErrorCatch(err, "cargarMotivos"); // emite error
    }
}
function cargarTablaMotivos(){
	try{
		if(dataTableMotivos!=undefined){
            dataTableMotivos.destroy();
            $('#tabla_datos > tbody').html("");
        }
        arrayLocalRegistros=rptaWebservice;
        for(var i=0; i<rptaWebservice.length; i++){
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' onclick='seleccionarFila("+'"'+i+'"'+")' style='height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' >"+
                "<td style='vertical-align: middle; '><center>"+rptaWebservice[i].idMotivo+"</center></td>"+
                "<td style='vertical-align: middle; '>"+rptaWebservice[i].descripcion+"</td>"+
                "</tr>");
        }
        dataTableMotivos=$('#tabla_datos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"305px",
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
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "order": [[ 1, "desc" ]],
            //"bSort": false,
            "columns": [
                { "width": "20%" },
                { "width": "80%" }
            ],
            "fnDrawCallback": ""
        });
        $.fancybox.close();

	}catch(err){
		emitirErrorCatch(err, "cargarTablaMotivos"); // emite error
	}
}
function nuevoMotivo(){
	try{
		accion="A";
		abrirFancyBox(550, 235, "mantenimientomotivo", true);
	}catch(err){
		emitirErrorCatch(err, "nuevoMotivo"); // emite error
	}
}
function editarMotivo(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un motivo");
		}else{
			accion="E";
			abrirFancyBox(550, 235, "mantenimientomotivo", true);		
		}		
	}catch(err){
		emitirErrorCatch(err, "editarMotivo"); // emite error
	}
}
function eliminarMotivo(){
    try{
        if(filaSeleccionada!=undefined){
            fancyConfirm("¿ Desea eliminar el motivo con ID "+arrayLocalRegistros[filaSeleccionada].idMotivo+" ?", function(estado){
                if(estado){
                    fancyAlertWait("Eliminando");
                    parametros="&idMotivo="+arrayLocalRegistros[filaSeleccionada].idMotivo;
                    webService2("eliminarMotivo", parametros, "finEliminarMotivo()");
                }
            });            
        }else{
            fancyAlert("Por favor seleccione un motivo");
        }
    }catch(err){
        emitirErrorCatch(err, "eliminarMotivo");
    }
}
function finEliminarMotivo(){
    try{
        if(rptaWebservice[0]>0){
            fancyAlertFunction("¡¡ Se eliminó el motivo correctamente !!", function(estado){
                if(estado){
                    cargarMotivos();
                }
            });

        }else{
            fancyAlert("No se pudo eliminar el motivo. Comuniquese con el soporte técnico")
        }

    }catch(err){
        emitirErrorCatch(err, "finEliminarMotivo");
    }
}
