var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Asociado";
var heightMant = 340;
var widthMant = 880;
var idField = "idAsociado";
var tableDB = "Asociado";

cargarInicio(function(){
    $("#btnBuscar").click(function(){
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los eventos
    })
	$("#btnEditar").click(function(){
		editarAbstracto(modulo.toLowerCase(), idField, heightMant, widthMant, listar);		
	});
	$("#btnNuevo").click(function(){
		nuevoAbstracto(modulo.toLowerCase(), heightMant, widthMant, listar);		
	});
	$("#btnEliminar").click(function(){
		eliminarAbstracto(DAO, tableDB, idField, function(data){
			if(data[0]>0){
				listar();
			}else{
				fancyAlert("Operación Fallida");
			} 			
		})
	});
	listar();
})
function buscar(){
	try{
		listar();		
	}catch(err){
		emitirErrorCatch(err, "buscar")
	}
}
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'idAsociado', alineacion:'center'},
            {campo:'nombre', alineacion:'left'},
            {campo:'nroDocumento', alineacion:'center'},
            {campo:'calle', alineacion:'left'},
            {campo:'telefonoMovil', alineacion:'center'},
            {campo:'email', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "5%" },
            { "width": "35%" },
            { "width": "10%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "20%" }
        ];
		var orderByColum=[0, "desc"];
		var height=300;
		var idTabla = "tabla_datos";
        var params = "&nombreAsociado="+$("#idBuscarAsociado").val().trim()
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}