var realizoTarea=false;
var rptaCallback;
$(document).ready(function(){
	$("#codEvento").val(parent.filtroBusqueda.codEvento)
	$("#nroCAT").val(parent.filtroBusqueda.nroCAT)
	$("#placa").val(parent.filtroBusqueda.placa)
	$("#idTipoEvento").val(parent.filtroBusqueda.idTipoEvento)
	$("#idEstado").val(parent.filtroBusqueda.idEstado)
	$("#fechaDesde").val(parent.filtroBusqueda.fechaDesde)
	$("#fechaHasta").val(parent.filtroBusqueda.fechaHasta);	
	$("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	if(parent.filtroBusqueda.idTipoEvento == 'N'){
		$("#idPanelEstadoRecup").css("display", "none");
	}else{
		$("#idPanelEstadoRecup").css("display", "block");
	}
	$("#idTipoEvento").change(function(){
		switch(this.value){
			case 'S':
				$("#idPanelEstadoRecup").css("display", "block");
				$("#idEstado").val("");
				break;
			case 'N':
				$("#idPanelEstadoRecup").css("display", "none");
				$("#idEstado").val("P");
				break;
		}
	})
});
function buscarEvento(){
	try{
		if($("#codEvento").val()=="" && $("#nroCAT").val()=="" && $("#placa").val()=="" && $("#idTipoEvento").val()=="" && $("#idEstado").val()=="" && $("#fechaDesde").val()==""
			&& $("#fechaHasta").val()==""){
			fancyAlertFunction("Complete al menos un filtro de busqueda", function(estado){ // emite alerta
                if(estado){
                    $("#codEvento").focus();
                }
            });
		}else{
			realizoTarea=true;
			rptaCallback=[{
				codEvento: $("#codEvento").val(), 
				nroCAT: $("#nroCAT").val(),
				placa: $("#placa").val(),
				idTipoEvento: $("#idTipoEvento").val(),
				idEstado : $("#idEstado").val(),
				fechaDesde : $("#fechaDesde").val(),
				fechaHasta : $("#fechaHasta").val()
			}];
			parent.$.fancybox.close();			
		}
	}catch(err){
		
	}
}
function limpiarBusqueda(){
	try{
		$("#codEvento").val("")
		$("#nroCAT").val("")
		$("#placa").val("")
		$("#idTipoEvento").val("S")
		$("#idEstado").val("P")
		$("#fechaDesde").val("")
		$("#fechaHasta").val("")		
	}catch(err){
		
	}
}