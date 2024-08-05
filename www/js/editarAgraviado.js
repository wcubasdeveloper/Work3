$(document).ready(function(){
// cargar accidentes	
	cargarInicio();
});
var objeto;
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var idPersona;
var codEvento;
var codAgraviado;
function cargarInicio(){
	try{
		fancyAlertWait("Cargando");
		if(parent.tipoAccion == 'N'){ // si se registra NUEVO AGRAVIADO
			codEvento = parent.codEvento;
			labelTextWebPlus("idLabelTitulo", "NUEVO AGRAVIADO");
			$("#labelCodAgraviado").css("display", "block");
			$("#txtCodAgraviado").css("display", "block");
			$("#txtCodAgraviado").focus();
			$("#fecNac").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});
			$("#fecIngreso").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});
			consultarWebServiceGet("getAllProvincias", "", function(datos){
				arrayProvincias=datos; //guarda las provincias en array
				consultarWebServiceGet("getAllDistritos", "", function(info){
					arrayDistritos=info;
					cargarEventoComboProv("ag", arrayDistritos); // CREA EVENTO CHANGE PARA CARGAR LOS DISTRITOS DE LA PROVINCIA SELECCIONADA
					cargarListaProvincias("ag", arrayProvincias, idDepartamentoDefault) // carga las provincias segun el departamento
					$("#idProvincia_ag").select2()
					$("#idDistrito_ag").select2()
					$.fancybox.close();
				});
			});
		}else{
			objeto=parent.arrayListaAgraviados[parent.filaSeleccionada];
			consultarWebServiceGet("getAllProvincias", "", function(datos){
				arrayProvincias=datos; //guarda las provincias en array
				consultarWebServiceGet("getAllDistritos", "", function(info){
					arrayDistritos=info;
					cargarEventoComboProv("ag", arrayDistritos); // CREA EVENTO CHANGE PARA CARGAR LOS DISTRITOS DE LA PROVINCIA SELECCIONADA
					cargarInfoAgraviado();
				})
			});	
		}
	}catch(err){
		emitirErrorCatch(err, "cargarInicio"); // emite error
	}
}

/* @cargarInfoAgraviado: Carga la informacion del agraviado seleccionado
*/
function cargarInfoAgraviado(){
	try{
		$("#nombre").val(objeto.nombres);
		$("#apePat").val(objeto.apellidoPaterno);
		$("#apeMat").val(objeto.apellidoMaterno);
		$("#nroDoc").val(objeto.nroDocumento);
		if(objeto.fechaNacimiento=='01/01/1900'){
			objeto.fechaNacimiento='';
		}
		$("#fecNac").val(objeto.fechaNacimiento);
		$("#fecNac").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});	
		$("#telfijo").val(objeto.telefonoFijo);
		$("#telmovil").val(objeto.telefonoMovil);
		$("#calle").val(objeto.calle);
		$("#nro").val(objeto.nro);
		$("#lote").val(objeto.mzLote);
		$("#sector").val(objeto.sector);
		if(objeto.fechaIngreso=='01/01/1900'){
			objeto.fechaIngreso='';
		}
		$("#fecIngreso").val(objeto.fechaIngreso);
		$("#fecIngreso").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});	
		$("#diagnostico").val(objeto.diagnostico);
		$("#tipo").val(objeto.tipo);
		idPersona=objeto.idPersona;
		codEvento=objeto.codEvento;
		codAgraviado=objeto.codAgraviado;
		//******** Selecciona provincia y distrito ******************************************************************************************
		if(objeto.idDepartamento==null){ // si no se asignado departamento para el accidente se toma el departamento x defecto
			objeto.idDepartamento=idDepartamentoDefault;
		}
		cargarListaProvincias("ag", arrayProvincias, objeto.idDepartamento) // carga las provincias segun el departamento
		$("#idProvincia_ag").val(objeto.idProvincia); // selecciona la provincia
		cargarListaDistritos("ag", arrayDistritos); // carga los distritos segun la provincia seleccionada
		$("#idDistrito_ag").val(objeto.idDistrito) // selecciona el distrito		
		if($("#idProvincia_ag").val()==null){ // si no se selecciono ninguna opcion de la lista se asignara la opcion x defecto 'Seleccione cuyo valor es igual a vacio ('')'
			$("#idProvincia_ag").val("")
		}
		if($("#idDistrito_ag").val()==null){
			$("#idDistrito_ag").val("");
		}
		$("#idProvincia_ag").select2()
		$("#idDistrito_ag").select2()
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "cargarInfoAgraviado")
	}
}

/* @guardarAgraviado: Guarda o actualiza un Agraviado. si tipoAccion = 'N' (Registra nuevo agraviado), caso contrario es 'A' ("Actualiza Agraviado")
*/
function guardarAgraviado(){
	try{
		var camposAvalidar="nombre-Nombre/apePat-Apellido Paterno/apeMat-Apellido Materno";
		if(parent.tipoAccion=='N'){
			camposAvalidar="txtCodAgraviado-codigo Agraviado/"+camposAvalidar;
		}
		if(validarInputsValueXid(camposAvalidar)){
			var tituloConfirm = "¿Estas seguro de actualizar la información del agraviado?";
			if(parent.tipoAccion=='N'){
				tituloConfirm = "¿Estas seguro de proceder con el registro del nuevo Agraviado?"
			}
			fancyConfirm(tituloConfirm, function(e){
				if(e){
					var parametros="";
					parametros=parametros+"&nombre="+$("#nombre").val();
					parametros=parametros+"&apePat="+$("#apePat").val();
					parametros=parametros+"&apeMat="+$("#apeMat").val();
					parametros=parametros+"&nroDoc="+$("#nroDoc").val();
					fecha=$("#fecNac").val();
					if(fecha!=""){
						fecha=dateTimeFormat($("#fecNac").val());
					}
					parametros=parametros+"&fecNac="+fecha;
					parametros=parametros+"&telfijo="+$("#telfijo").val();
					parametros=parametros+"&telmovil="+$("#telmovil").val();
					parametros=parametros+"&calle="+$("#calle").val();
					parametros=parametros+"&nro="+$("#nro").val();
					parametros=parametros+"&lote="+$("#lote").val();
					parametros=parametros+"&sector="+$("#sector").val();
					parametros=parametros+"&idDistrito="+$("#idDistrito_ag").val();
					parametros=parametros+"&idPersona="+idPersona;
					parametros=parametros+"&codEvento="+codEvento;
					fechaIngreso=$("#fecIngreso").val();
					if(fechaIngreso!=""){
						fechaIngreso=dateTimeFormat($("#fecIngreso").val());
					}
					parametros=parametros+"&fecIngreso="+fechaIngreso;
					parametros=parametros+"&diagnostico="+$("#diagnostico").val();
					parametros=parametros+"&tipo="+$("#tipo").val();
					if(parent.tipoAccion=='N'){
						parametros=parametros+"&codAgraviado="+$("#txtCodAgraviado").val();
						consultarWebServiceGet("nuevoAgraviado", parametros,function(){
							fancyAlertFunction("Se insertó el Agraviado correctamente", function(estado){
								if(estado){
									parent.filaSeleccionada=undefined;
									parent.$.fancybox.close();
									parent.cargarListaDeAgraviados();
								}
							});				
						});
					}else{
						webService2("actualizarAgraviado", parametros, "finalizarActualizacionDeAgraviado()");	
					}

				}
			})

		}
	}catch(err){
		emitirErrorCatch(err, "guardarAgraviado"); // emite error
	}
}
function finalizarActualizacionDeAgraviado(){
	try{
		if(rptaWebservice[0]>0){
			fancyAlertFunction("Se actualizarón los datos correctamente", function(estado){
				if(estado){
					parent.filaSeleccionada=undefined;
					parent.$.fancybox.close();
					parent.cargarListaDeAgraviados();
				}
			});
		}
	}catch(err){
		emitirErrorCatch(err, "finalizarActualizacionDeAgraviado"); // emite error
	}
}