var realizoTarea=false;
var rptaCallback;
$(document).ready(function(){
	$("#codEvento").val(parent.filtroBusqueda.codEvento)
	$("#nroCAT").val(parent.filtroBusqueda.nroCAT)
	$("#placa").val(parent.filtroBusqueda.placa)
	$("#idNotificacion").val(parent.filtroBusqueda.idNotificacion)
	$("#idEstado").val(parent.filtroBusqueda.estado)
	$("#fechaDesde").val(parent.filtroBusqueda.fechaDesde)
	$("#fechaHasta").val(parent.filtroBusqueda.fechaHasta);	
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
});
function buscar(){
	try{
		realizoTarea=true;
		rptaCallback=[{
			codEvento: $("#codEvento").val(), 
			nroCAT: $("#nroCAT").val(),
			placa: $("#placa").val(),
			idNotificacion: $("#idNotificacion").val(),
			estado : $("#idEstado").val(),
			fechaDesde : $("#fechaDesde").val(),
			fechaHasta : $("#fechaHasta").val()
		}];
		parent.$.fancybox.close();	
	}catch(err){
		emitirErrorCatch(err);
	}
}
function limpiarBusqueda(){
	try{
		$("#codEvento").val("")
		$("#nroCAT").val("")
		$("#placa").val("")
		$("#idNotificacion").val("")
		$("#idEstado").val("P")
		$("#fechaDesde").val("")
		$("#fechaHasta").val("")		
	}catch(err){
		emitirErrorCatch(err);
	}
}