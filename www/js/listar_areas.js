var idAreaIdentificada=parent.idArea;
var idUsuarioIdentificado = parent.idUsuario;
var dataTableAreas=undefined;
var arrayAreas = new Array();
cargarInicio(function(){
	buscarAreas()
	$("#Eliminar").click(eliminarArea)
	$("#idEditar").click(editarArea)
	$("#idNuevo").click(nuevaArea)
})
function buscarAreas(){
	try{
		consultarWebServiceGet("getAllAreas", "", listarAreas)
	}catch(err){
		emitirErrorCatch(err, "buscarAreas")
	}
}
function eliminarArea(){
	try{
		if(filaSeleccionada!=undefined){
			var area = arrayAreas[filaSeleccionada];			
			fancyConfirm("¿Estas seguro de eliminar el Área "+area.Nombre+"?", function(rpta){
				if(rpta){
					var parametros="&idArea="+area.idArea;
					consultarWebServiceGet("eliminarArea", parametros, function(data){
						if(data[0]>0){ // Si se elimino
							var desc="Se eliminó el Area con id : "+area.idArea; // se registra la acción en la tabla EVENTOSLOG
                            ingresarLog(desc, idUsuarioIdentificado); // guarda log
                            buscarAreas(); // vuelve a buscar usuarios
                            $.fancybox.close();
						}
					});				
				}
			});
			
		}else{
			fancyAlert("Debe seleccionar una área");
		}
	}catch(err){
		emitirErrorCatch(err, "eliminarArea")
	}
}
function editarArea(){
	try{
		if(filaSeleccionada!=undefined){
			var area = arrayAreas[filaSeleccionada];
			var parametros="?idArea="+area.idArea+ //  idUsuario = editar Usuario x su ID
				"&nombre="+area.Nombre;
				abrirVentanaFancyBox(550, 235, "nuevaarea"+parametros, true, buscarAreas);
		}else{
			fancyAlert("Debe seleccionar una área");
		}
	}catch(err){
		emitirErrorCatch(err, "editarArea")
	}
}
function nuevaArea(){
	try{
		var parametros="?idArea=0"; //  0 = Insertar Nueva Area
		abrirVentanaFancyBox(550, 235, "nuevaarea"+parametros, true/*, buscarAreas*/);
	}catch(err){
		emitirErrorCatch(err, "")
	}
}
function listarAreas(data){
	try{
		var CampoAlineacionArray=[
            {campo:'idArea', alineacion:'center'},
            {campo:'Nombre', alineacion:'left'}
        ];
        if(dataTableAreas!=undefined){
            dataTableAreas.destroy(); // elimina
        }
        arrayAreas=data;
        crearFilasHTML("tabla_datos", data, CampoAlineacionArray, true, 12);
        var arrayColumnWidth=[
            { "width": "30%"},
            { "width": "70%" }
        ];
        var orderByColum=[1, "asc"];
        dataTableAreas=parseDataTable("tabla_datos", arrayColumnWidth, 310, orderByColum, false, false);
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listarAreas")
	}
}