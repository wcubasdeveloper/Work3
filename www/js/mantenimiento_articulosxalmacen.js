var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Articulos_almacen";
var heightMant = 180;
var widthMant = 500;
var idField = "idArticulos_almacen";
var tableDB = "Articulos_almacen";

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
	DAO.consultarWebServiceGet("getListaAlmacen", "", function(data){
		agregarOpcionesToCombo("idAlmacen", data, {"keyId":"idAlmacen", "keyValue":"nombre"});
		$("#idAlmacen").find("option").eq(0).remove();
		$("#idAlmacen").change(listar);
		$.fancybox.close();
		$("#idAlmacen").change();
	})
})
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'articulo', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "100%"}
        ];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";
		var params = "&idAlmacen="+$("#idAlmacen").val();
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}