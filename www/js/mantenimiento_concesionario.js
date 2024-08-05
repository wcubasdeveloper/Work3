var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Concesionario";
var heightMant = 340;
var widthMant = 880;
var idField = "idConcesionario";
var tableDB = "Concesionario";
var paginacion = new Paginacion();

cargarInicio(function(){	
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
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false));
	
	$("#btnBuscar").click(function(){
		paginacion.reiniciarPaginacion()
		buscar();
	});
	DAO.consultarWebServiceGet("getListaLocal", "", function(data){
		agregarOpcionesToCombo("idSede", data, {"keyId":"idLocal", "keyValue":"Nombre"});
		//$("#idAlmacen").find("option").eq(0).remove();
		$.fancybox.close();
		$("#idSede").change();
		$("#btnBuscar").click();
	})
})
function buscar(){
	try{
		listar();		
	}catch(err){
		emitirErrorCatch(err, "buscar")
	}
}
function cleanDate(idInput){ // Limpia el string de los campos fechas
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
};
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'idConcesionario', alineacion:'center'},
			{campo:'nombreConcesionario', alineacion:'left'},
			{campo:'estado', alineacion:'center'},
			{campo:'nombreSede', alineacion:'center'},
			{campo:'promotor', alineacion:'left'},
			{campo:'diaSemana', alineacion:'center'}
        ];
		var arrayColumnWidth=[
            { "width": "10%"},
			{ "width": "30%"},
			{ "width": "10%"},
			{ "width": "15%"},
			{ "width": "25%"},
			{ "width": "10%"}
        ];
		var orderByColum=[1, "asc"];
		var height=315;
		var idTabla = "tabla_datos";
		var params = "&idLocal="+$("#idSede").val()+
		"&responsable="+$("#nombreResponsable").val()+
		"&razonSocial="+$("#razonSocial").val()+
		"&fechaInicio="+dateTimeFormat($("#fechaDesde").val())+
		"&fechaFin="+dateTimeFormat($("#fechaHasta").val());
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}