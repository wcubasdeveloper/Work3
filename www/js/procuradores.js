var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Procurador";
var heightMant = 470;
var widthMant = 385;
var idField = "idProcurador";
var tableDB = "Procurador";

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
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'idProcurador', alineacion:'center'},
            {campo:'nombreProcurador', alineacion:'left'},
			{campo:'DNI', alineacion:'center'},
			{campo:'usuario', alineacion:'left'},
			{campo:'correo', alineacion:'left'},
        ];
		var arrayColumnWidth=[
            { "width": "8%"},
            { "width": "42%" },
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "20%" }
        ];
		var orderByColum=[1, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}