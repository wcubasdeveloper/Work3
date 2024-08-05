var arrayDistritos=new Array();
var arrayProvincias = new Array();
var objeto=parent.arrayEventos[parent.filaSeleccionada];
$(document).ready(function(){
	$("#idFecha").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:true, step:5});	
	consultarWebServiceGet("getAllProvincias", "", function(datos){
		arrayProvincias=datos; //guarda las provincias en array
		consultarWebServiceGet("getAllDistritos", "", function(info){
			arrayDistritos=info;
			cargarEventoComboProv("ac", arrayDistritos); // CREA EVENTO CHANGE PARA CARGAR LOS DISTRITOS DE LA PROVINCIA SELECCIONADA
			cargarInfoEvento(); // carga Info de accidente
		});
	});
});
/* @mostrarCausales: Carga la lista de causales.
	PARAMETROS:
		- rptaWebservice: Lista de causales.
*/
function mostrarCausales(rptaWebservice){ // Lista las causales del accidente
	try{        
		for(var i=0; i<rptaWebservice.length; i++){
			$("#idCausal1").append(new Option(rptaWebservice[i].descripcion, rptaWebservice[i].codCausal));
			$("#idCausal2").append(new Option(rptaWebservice[i].descripcion, rptaWebservice[i].codCausal));
		}		
		$("#idCausal1").val(objeto.causal1);
		if($("#idCausal1").val()==null){
			$("#idCausal1").val("");
		}
		$("#idCausal2").val(objeto.causal2);
		if($("#idCausal2").val()==null){
			$("#idCausal2").val("");
		}
		$("#idCausal1").select2();
		$("#idCausal2").select2();        
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "mostrarCausales"); // emite error
	}	
}
/* @cargarInfoEvento: Carga la informacion del accidente en el formulario.
*/
function cargarInfoEvento(){ // Carga información del evento
	try{		
        fancyAlertWait("cargando");
		$("#numEvento").val(objeto.numcentral);
		fecha="";
		if(objeto.fechaevento!=null){
			fecha=fechaFormateada(objeto.fechaevento, true);
		    fecha=fecha.split(".");
		    fecha=fecha[0];
		    fecha=fecha.split(":");
		    fecha=fecha[0]+":"+fecha[1];
		}
        var nombreAsociado=objeto.nombreAsociado+" "+objeto.apePatAsociado+" "+objeto.apeMatAsociado;
        if(objeto.tipoPersonaAsociado=="J"){
            nombreAsociado=objeto.razonSocial;
        }
		$("#idFecha").val(fecha);
		$("#idCAT").val(objeto.cat);
		$("#nombreAsociado").val(nombreAsociado);
		$("#idPlaca").val(objeto.placa);
        $("#idNroDoc").val(objeto.nroDocAsociado);
		$("#idLugar").val(objeto.lugarsiniestro);
		$("#nombreContacto").val(objeto.nombreContacto);
		$("#telfContacto").val(objeto.telefonoContacto);
		$("#comisaria").val(objeto.comisaria);
		$("#NroDenuncia").val(objeto.codigoDenuncia);
		// carga la provincia y distrito donde ocurrio  el evento
		if(objeto.idDepartamento==null){ // si no se asignado departamento para el accidente se toma el departamento x defecto
			objeto.idDepartamento=idDepartamentoDefault;
		}
		cargarListaProvincias("ac", arrayProvincias, objeto.idDepartamento) // carga las provincias segun el departamento
		$("#idProvincia_ac").val(objeto.idProvincia); // selecciona la provincia
		cargarListaDistritos("ac", arrayDistritos); // carga los distritos segun la provincia seleccionada
		$("#idDistrito_ac").val(objeto.idDistrito) // selecciona el distrito		
		if($("#idProvincia_ac").val()==null){ // si no se selecciono ninguna opcion de la lista se asignara la opcion x defecto 'Seleccione cuyo valor es igual a vacio ('')'
			$("#idProvincia_ac").val("")
		}
		if($("#idDistrito_ac").val()==null){
			$("#idDistrito_ac").val("");
		}
		$("#idProvincia_ac").select2()
		$("#idDistrito_ac").select2()
		// busca y muestra las causales del evento
		consultarWebServiceGet("getCausales", "", mostrarCausales);
	}catch(err){
		emitirErrorCatch(err, "seleccionarEvento"); // emite error
	}
}

/* @actualizarInfo: Actualiza los cambios realizados a la informacion del accidente.
*/
function actualizarInfo(){
	try{
		var camposValidar="idFecha-Fecha del Evento/idLugar-Lugar del accidente/idDistrito-Distrito/idCausal1&idCausal2-Una causa del accidente como mínimo";
		if(validarInputsValueXid(camposValidar)){
			if($("#idCausal1").val()!= $("#idCausal2").val()){
					fancyConfirm("¿ Confirma actualizar los datos del accidente ?", function(estado){
						if(estado){
							fancyAlertWait("Guardando");
							var parametros="&fecha="+dateTimeFormat($("#idFecha").val())+
							"&lugar="+$("#idLugar").val()+
							"&nombreContacto="+$("#nombreContacto").val()+
							"&telfContacto="+$("#telfContacto").val()+
							"&comisaria="+$("#comisaria").val()+
							"&idDistrito="+$("#idDistrito_ac").val()+
							"&NroDenuncia="+$("#NroDenuncia").val()+					
							"&codEvento="+parent.arrayEventos[parent.filaSeleccionada].numcentral+
							"&idCausal1="+$("#idCausal1").val()+
							"&idCausal2="+$("#idCausal2").val();
							consultarWebServiceGet("actualizarDatosAccidente", parametros, terminaActualizacion);
						}
					});
			}else{
				fancyAlert("Debe seleccionar causas diferentes para el accidente");
			}
		}
	}catch(err){
		emitirErrorCatch(err, "actualizarInfo"); // emite error
	}
}
function terminaActualizacion(rptaWebservice){
	try{
		if(rptaWebservice[0]>0){
			parent.filaSeleccionada=undefined;
			fancyAlertFunction("Se actualizaron los datos correctamente", function(estado){
				parent.$.fancybox.close();
				parent.cargarListaDeAccidentes(parent.filtroBusqueda, parent.paginacion.registrosXpagina, parent.paginacion.cantPaginas, parent.paginacion.paginaActual, parent.paginacion);
			});
		}

	}catch(err){
		emitirErrorCatch(err, "terminaActualizacion"); // emite error
	}
}