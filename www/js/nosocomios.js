var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Nosocomio";
var heightMant = 295;
var widthMant = 500;
var idField = "idNosocomio";
var tableDB = "Nosocomio";

cargarInicio(function(){
	$("#btnEditar").click(function(){
		editarAbstracto(modulo.toLowerCase(), idField, heightMant, widthMant, listar);		
	});
	$("#btnNuevo").hide() // oculta el botton nuevo 
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
            {campo:'idNosocomio', alineacion:'center'},
            {campo:'nombre', alineacion:'left'},
			{campo:'direccion', alineacion:'left'},
			{campo:'telefono', alineacion:'center'},
			{campo:'tipoNosocomio', alineacion:'center'},
			{campo:'nombreDistrito', alineacion:'center'},
			{campo:'nombreProvincia', alineacion:'center'}
        ];
		var arrayColumnWidth=[
            { "width": "6%"},
            { "width": "18%" },
			{ "width": "32%" },
			{ "width": "10%" },
			{ "width": "10%" },
			{ "width": "12%" },
			{ "width": "12%" }
        ];
		var orderByColum=[0, "desc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}