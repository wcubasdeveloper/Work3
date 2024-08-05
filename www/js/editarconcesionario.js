var arrayDistritos=parent.arrayDistritos;
var arrayProvincias=parent.arrayProvincias;
var arrayDepartamentos=parent.arrayDepartamentos;
var objeto=parent.arrayData[parent.filaSeleccionada];
var idDepartamento;
var idProvincia;
var idProvinciaSelect; // provincia seleccionada
var idDepartamentoSelect; 
cargarInicio(function(){
	cargarInfoConcecionario()
	$("#idCmbDistrito").change(
		function(){			
	        var item=$("#idCmbDistrito").val();
	        if(item=='OTRP'){ //Otra Provincia
	            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
	                if(data!=undefined){                   
	                    idProvinciaSelect=data[0].provincia;                    
	                    idDepartamentoSelect=data[0].departamento;
	                    cargarDistritos(data[0].provincia)
	                }else{ 
	                    $("#idCmbDistrito").val("");
	                }
	            });
	        }        
 		}
	);
	$("#idGuardar").click(guardarInfo)
})
function guardarInfo(){
	try{
		var continua=false;
		if($("#idCmbEstado").val()=="0"){ // Deshabilitado
			continua=true;
		}else{
			continua=validarCamposRequeridos("idComponents"); // valida los campos requeridos
		}
		if(continua){
			fancyConfirm("¿Esta seguro de proceder con la actualización del concecionario?", function(estado){
				if(estado){
					var ubicacion=idDepartamentoSelect+''+idProvinciaSelect+''+$("#idCmbDistrito").val();
					var parametros="&idConcesionario="+objeto.idConcesionario
					+"&razonSocial="+reemplazarNullXpuntos($("#idTxtRazon").val())
					+"&direccion="+reemplazarNullXpuntos($("#idTxtDireccion").val())
					+"&referencia="+reemplazarNullXpuntos($("#idTxtReferencia").val())
					+"&telefono="+reemplazarNullXpuntos($("#idTxtTelefono").val())
					+"&celular="+reemplazarNullXpuntos($("#idTxtCelular").val())
					+"&email="+reemplazarNullXpuntos($("#idTxtEmail").val())
					+"&estado="+$("#idCmbEstado").val()
					+"&diavisita="+$("#idDiaVisita").val()
					+"&ubicacion="+ubicacion //Dep-Prov-Dist
					+"&fechaVig="+dateTimeFormat($("#idTxtFechaVigencia").val());
					consultarWebServiceGet2("actualizarConcesionario", parametros, function(datos){
						if(datos[0]>0){
							parent.arrayData[parent.filaSeleccionada].razonSocial=$("#idTxtRazon").val();
							parent.arrayData[parent.filaSeleccionada].direccion=$("#idTxtDireccion").val();
							parent.arrayData[parent.filaSeleccionada].referencia=$("#idTxtReferencia").val();
							parent.arrayData[parent.filaSeleccionada].telefono=$("#idTxtTelefono").val();
							parent.arrayData[parent.filaSeleccionada].celular=$("#idTxtCelular").val();
							parent.arrayData[parent.filaSeleccionada].email=$("#idTxtEmail").val();
							parent.arrayData[parent.filaSeleccionada].estado=$("#idCmbEstado").val();
							parent.arrayData[parent.filaSeleccionada].diavisita=$("#idDiaVisita").val();
							parent.arrayData[parent.filaSeleccionada].zipcode=ubicacion;
							parent.arrayData[parent.filaSeleccionada].fechaVigencia=$("#idTxtFechaVigencia").val();
							parent.mostrarLista(parent.arrayData);
							parent.$.fancybox.close();
						}else{
							fancyAlert("No se pudo actualizar el concesionario");
						}
					});
				}
			});
		}
	}catch(err){
		emitirErrorCatch(err, "guardarInfo")
	}
}
function cargarInfoConcecionario(){
	try{
		$("#idTxtRazon").val(objeto.razonSocial)
		$("#idTxtDireccion").val(objeto.direccion)
		$("#idTxtReferencia").val(objeto.referencia)
		$("#idTxtTelefono").val(objeto.telefono)
		$("#idTxtCelular").val(objeto.celular)
		$("#idTxtEmail").val(objeto.email)
		$("#idCmbEstado").val(objeto.estado)
		$("#idDiaVisita").val(objeto.diavisita)
		$("#idTxtFechaVigencia").val(objeto.fechaVigencia)
        $("#idTxtFechaVigencia").datetimepicker({lan:'es', formatDate:'d/m/Y', format:'d/m/Y', /**minDate:0, **/timepicker:false, closeOnDateSelect:true});
		var depprodist=objeto.zipcode; // contiene Dep - Prov - Distr
		var idDep;
		var idProv;
		var idDist;
		if(depprodist!=null && depprodist!=""){
			depprodist=depprodist.split("");
			idDep = depprodist[0]+''+depprodist[1];
			idProv= depprodist[2]+''+depprodist[3];
			idDist= depprodist[4]+''+depprodist[5];			
		}else{
			idDep='01'; //Elige Lima
			idProv='01';
			idDist='';
		}
		cargarDistritos(idProv);
		$("#idCmbDistrito").val(idDist)	
		idProvinciaSelect=idProv;
		idDepartamentoSelect=idDep;
	}catch(err){
		emitirErrorCatch(err, "cargarInfoConcecionario")
	}
}
function cargarDistritos(idProvince){
	try{		
		$("#idCmbDistrito").html("");
		$("#idCmbDistrito").append(new Option("Seleccione", ""))
		for(var i=0; i<arrayDistritos.length; i++){
			if(arrayDistritos[i].idProvincia==idProvince){
				$("#idCmbDistrito").append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
			}
		}
		$("#idCmbDistrito").append(new Option("Otra provincia", "OTRP"))
	}catch(err){
		emitirErrorCatch(err, "cargarDistritos")
	}
}