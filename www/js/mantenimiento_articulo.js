var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Articulo";
var heightMant = 145;
var widthMant = 500;
var idField = "idArticulo";
var tableDB = "Articulo";

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
            {campo:'idArticulo', alineacion:'center'},
            {campo:'descripcion', alineacion:'left'},
			{campo:'esCAT', alineacion:'center'}
        ];
		var arrayColumnWidth=[
            { "width": "20%"},
            { "width": "60%" },
			{ "width": "20%" }
        ];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}