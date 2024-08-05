var idUsuarioIdentificado=parent.idUsuario;
var dataTableUsuarios=undefined;
var arrayUsuarios = new Array();
cargarInicio(function(){
	buscarUsuarios()
	$("#Eliminar").click(eliminarUsuario)
	$("#idEditar").click(editarUsuario)
	$("#idNuevo").click(nuevoUsuario)
})
function buscarUsuarios(){
	try{
		consultarWebServiceGet("getListaUsuarios", "", listarUsuarios)
	}catch(err){
		emitirErrorCatch(err, "buscarUsuarios")
	}
}
function eliminarUsuario(){
	try{
		if(filaSeleccionada!=undefined){
			var usuario = arrayUsuarios[filaSeleccionada];			
			fancyConfirm("¿Estas seguro de eliminar al Usuario "+usuario.nombreUsuario+"?", function(rpta){
				if(rpta){
					if(usuario.idUsuario!=idUsuarioIdentificado){ // Tiene que verificar que no este en linea
						var parametros="&idUsuario="+usuario.idUsuario;
						consultarWebServiceGet("eliminarUsuario", parametros, function(data){
							if(data[0]>0){ // Si se elimino
								var desc="Se eliminó al Usuario con id : "+usuario.idUsuario; // se registra la acción en la tabla EVENTOSLOG
                                ingresarLog(desc, idUsuarioIdentificado); // guarda log
                                buscarUsuarios(); // vuelve a buscar usuarios
                                $.fancybox.close();
							}
						});
					}else{
						fancyAlert("No se puede eliminar el usuario, porque actualmente se encuentra en linea")
					}
				}
			});
			
		}else{
			fancyAlert("Debe seleccionar un Usuario");
		}
	}catch(err){
		emitirErrorCatch(err, "eliminarUsuario")
	}
}
function editarUsuario(){
	try{
		if(filaSeleccionada!=undefined){
			var usuario = arrayUsuarios[filaSeleccionada];
			var parametros="?idUsuario="+usuario.idUsuario+ //  idUsuario = editar Usuario x su ID
				"&nombres="+usuario.Nombres+
				"&apellidos="+usuario.Apellidos+
				"&DNI="+usuario.DNI+
				"&user="+usuario.UName+
				"&pasx="+usuario.pasx+
				"&perfil1="+usuario.idPerfil1+
				"&perfil2="+usuario.idPerfil2+
				"&perfil3="+usuario.idPerfil3+
				"&area="+usuario.idArea+
				"&idLocal="+usuario.idLocal;
				abrirVentanaFancyBox(437, 440, "nuevousuario"+parametros, true, buscarUsuarios);
		}else{
			fancyAlert("Debe seleccionar un Usuario");
		}
	}catch(err){
		emitirErrorCatch(err, "editarUsuario")
	}
}
function nuevoUsuario(){
	try{
		var parametros="?idUsuario=0"; //  0 = Insertar Nuevo Usuario
		abrirVentanaFancyBox(437, 440, "nuevousuario"+parametros, true, buscarUsuarios);
	}catch(err){
		emitirErrorCatch(err, "")
	}
}
function listarUsuarios(data){
	try{
		var CampoAlineacionArray=[
            {campo:'idUsuario', alineacion:'center'},
            {campo:'nombreUsuario', alineacion:'left'},
            {campo:'UName', alineacion:'left'},
            {campo:'nombreArea', alineacion:'left'}
        ];
        if(dataTableUsuarios!=undefined){
            dataTableUsuarios.destroy(); // elimina
        }
        arrayUsuarios=data;
        crearFilasHTML("tabla_datos", data, CampoAlineacionArray, true, 12);
        var arrayColumnWidth=[
            { "width": "10%"},
            { "width": "40%" },
            { "width": "20%"},
            { "width": "30%"}
        ];
        var orderByColum=[1, "desc"];
        dataTableUsuarios=parseDataTable("tabla_datos", arrayColumnWidth, 270, orderByColum, false, true);
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "listarUsuarios")
	}
}