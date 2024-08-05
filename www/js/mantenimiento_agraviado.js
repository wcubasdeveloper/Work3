var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Agraviado";
var heightMant = 430;
var widthMant = 880;
var idField = "codAgraviado";
var tableDB = "Agraviado";

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
            {campo:'codAgraviado', alineacion:'center'},
			{campo:'codEvento', alineacion:'center'},
            {campo:'nombre', alineacion:'left'},
			{campo:'DNI', alineacion:'center'},
			{campo:'telefono', alineacion:'center'},
			{campo:'diagnostico', alineacion:'left'},
        ];
		var arrayColumnWidth=[
            { "width": "10%" },
            { "width": "10%" },
			{ "width": "30%" },
			{ "width": "10%" },
			{ "width": "5%" },
			{ "width": "35%" }
        ];
		var orderByColum=[0, "desc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, undefined, false, true);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}