$(document).ready(function(){
// cargar accidentes	
	cargarInicio();
});
var codEvento;
var arrayDistritos=new Array();
var arrayProvincias = new Array();
var idPersonaPropietario;
var idPersonaChofer;
var idPersonaAsociado;
var idAsociado;
var idPropietario;
var idChofer;
var arrayResponsables=new Array();
var objeto;
function cargarInicio(){
	try{
		fancyAlertWait("Cargando");
		$("#fechNac_a").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5}); // cargar datetimepicker
		$("#fecNac_p").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});	
		$("#fecNac_c").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true, step:5});	
		// cargando distritos
        objeto=parent.window.frames[0].arrayEventos[parent.window.frames[0].filaSeleccionada];
		codEvento=objeto.numcentral;
		consultarWebServiceGet("getAllDepartamentos", "", function(data){  /// consulta por todos los departamentos disponibles
			listarDepartamentos(data, "a");
			listarDepartamentos(data, "p");
			listarDepartamentos(data, "c");
			consultarWebServiceGet("getAllProvincias", "", function(datos){
				cargarArrayProvincias(datos);
				consultarWebServiceGet("getAllDistritos", "", function(info){
					cargarArrayDistritos(info)
					cargarEventoChangeCombos("a", arrayProvincias, arrayDistritos); // asociado
					cargarEventoChangeCombos("p", arrayProvincias, arrayDistritos); // asociado
					cargarEventoChangeCombos("c", arrayProvincias, arrayDistritos); // asociado					
					consultarInfo()
				}); // busca los distritos
			})
		});
		$("#tipoPersona_p").change(function(){
			validartipoDePersona("p"); // Propietario
			for(var i=0; i<arrayResponsables.length; i++){
				if(arrayResponsables[i].idPersona==idPersonaPropietario){
					arrayResponsables[i]['tipoPersona']=$("#tipoPersona_p").val();
					break;
				}
			}
		})
		$(":input").keyup(function(){
			var elem=this;
			var id=elem.id;
			convertMayusculas(elem)			
			id=id.split("_");
			var prefijo=id[1];
			var personaComboSeleccionada=$("#idCmbSelecion_"+prefijo).val();
			if(personaComboSeleccionada!=0){
				var field=id[0];
				var idPersona;
				switch(prefijo){
					case 'a':
						idPersona=idPersonaAsociado;
						if(idPersonaAsociado==idPersonaPropietario){
							$("#"+field+"_p").val(elem.value)
						}
						if(idPersonaAsociado==idPersonaChofer){
							$("#"+field+"_c").val(elem.value)
						}
						break;
					case 'p':
						idPersona=idPersonaPropietario;
						if(idPersonaPropietario==idPersonaAsociado){
							$("#"+field+"_a").val(elem.value)
						}
						if(idPersonaPropietario==idPersonaChofer){
							$("#"+field+"_c").val(elem.value)
						}
						break;
					case 'c':
						idPersona=idPersonaChofer;
						if(idPersonaChofer==idPersonaAsociado){
							$("#"+field+"_a").val(elem.value)
						}
						if(idPersonaChofer==idPersonaPropietario){
							$("#"+field+"_p").val(elem.value)
						}
						break;
				}
				for(var i=0; i<arrayResponsables.length; i++){
					if(arrayResponsables[i].idPersona==idPersona){
						arrayResponsables[i][field]=elem.value;
						break;
					}
				}
				cargarComboPersonasResponsables()
			}
		})
		
	}catch(err){
		emitirErrorCatch(err, "cargarInicio"); // emite error
	}
}
/* @validartipoDePersona: Valida los campos requeridos a ingresar segun el tipo de Persona seleccionada (N=Natural / J=Juridica)
	PARAMETROS:
	 - prefijo: prefijo del id del combox "tipoPersona"
*/
function validartipoDePersona(prefijo){
	try{
		var tipoPersona=$("#tipoPersona_"+prefijo).val();
		switch(tipoPersona){
			case 'N': // Natural
				$("#razonSocial_"+prefijo).val("") // Limpia
				$("#razonSocial_"+prefijo).prop("readonly", true) // Bloquea
				$("#nombre_"+prefijo).prop("readonly", false) // desbloquea
				$("#apePat_"+prefijo).prop("readonly", false)
				$("#apeMat_"+prefijo).prop("readonly", false)
				$("#nombre_"+prefijo).focus()
				
				// Desactiva conyugue
				$("#nroDocC_"+prefijo).val("")
				$("#nroDocC_"+prefijo).prop("readonly", true) // desbloquea					
				$("#nombreC_"+prefijo).val("")
				$("#nombreC_"+prefijo).prop("readonly", true) // desbloquea
				$("#apePatC_"+prefijo).val("")
				$("#apePatC_"+prefijo).prop("readonly", true)
				$("#apeMatC_"+prefijo).val("")
				$("#apeMatC_"+prefijo).prop("readonly", true)
				break;
			case 'J':								
				if(idPersonaPropietario!=0 && idPersonaPropietario==idPersonaChofer){
					fancyAlert("No se puede cambiar el Propietario a persona juridica, porque esta seleccionado como chofer (Solo persona natural)")
					$("#tipoPersona_"+prefijo).val("N");

				}else{
					$("#razonSocial_"+prefijo).prop("readonly", false) // Desbloquea
					$("#razonSocial_"+prefijo).focus();
					$("#nombre_"+prefijo).val("")
					$("#nombre_"+prefijo).prop("readonly", true) // desbloquea
					$("#apePat_"+prefijo).val("")
					$("#apePat_"+prefijo).prop("readonly", true)
					$("#apeMat_"+prefijo).val("")
					$("#apeMat_"+prefijo).prop("readonly", true)				
					
					// Desactiva conyugue
					$("#nroDocC_"+prefijo).val("")
					$("#nroDocC_"+prefijo).prop("readonly", true) // desbloquea					
					$("#nombreC_"+prefijo).val("")
					$("#nombreC_"+prefijo).prop("readonly", true) // desbloquea
					$("#apePatC_"+prefijo).val("")
					$("#apePatC_"+prefijo).prop("readonly", true)
					$("#apeMatC_"+prefijo).val("")
					$("#apeMatC_"+prefijo).prop("readonly", true)
				}
				break;
			case 'C':
				$("#razonSocial_"+prefijo).val("") // Limpia
				$("#razonSocial_"+prefijo).prop("readonly", true) // Bloquea
				$("#nombre_"+prefijo).prop("readonly", false) // desbloquea
				$("#apePat_"+prefijo).prop("readonly", false)
				$("#apeMat_"+prefijo).prop("readonly", false)
				$("#nombre_"+prefijo).focus()
				$("#nroDocC_"+prefijo).prop("readonly", false) 
				$("#nombreC_"+prefijo).prop("readonly", false) // desbloquea
				$("#apePatC_"+prefijo).prop("readonly", false)
				$("#apeMatC_"+prefijo).prop("readonly", false)
				break;
		}

	}catch(err){
		emitirErrorCatch(err, "validartipoDePersona")
	}
}
function cargarEventoChangeCombos(prefijo, arrayProvincias, arrayDistritos){
	try{		
		cargarEventoComboDepa(prefijo, arrayProvincias)
		cargarEventoComboProv(prefijo, arrayDistritos)		        
	}catch(err){
		emitirErrorCatch(err, "cargarEventoChangeCombos")
	}
}
function cargarArrayProvincias(data){
	try{
		arrayProvincias=data;
	}catch(err){
		emitirErrorCatch(err, "cargarArrayProvincias")
	}
}
/*function cargarDepartamentos(){ // Carga los departamentos
    try{
        for(var i=0; i<rptaWebservice.length; i++){
            if(rptaWebservice[i].idDepartamento==idDepartamentoDefault){
                $("#idDepartamentoAsociado").append(new Option(rptaWebservice[i].nombreDepartamento, rptaWebservice[i].idDepartamento));
                $("#idDepartamentoPropietario").append(new Option(rptaWebservice[i].nombreDepartamento, rptaWebservice[i].idDepartamento));
                $("#idDepartamentoChofer").append(new Option(rptaWebservice[i].nombreDepartamento, rptaWebservice[i].idDepartamento));
            }
            $("#idDepartamentoAsociado").val(idDepartamentoDefault);
            $("#idDepartamentoAsociado").select2();
            $("#idDepartamentoPropietario").val(idDepartamentoDefault);
            $("#idDepartamentoPropietario").select2();
            $("#idDepartamentoChofer").val(idDepartamentoDefault);
            $("#idDepartamentoChofer").select2();
        }
        cargarProvincias();
    }catch(err){
        emitirErrorCatch(err,"cargarDepartamentos")
    }
}*/
/*function cargarProvincias(){
    try{
        webService2("getAllProvincias", "", "mostrarProvincias()");
    }catch(err){
        emitirErrorCatch(err, "cargarDistritos"); // emite error
    }
}*/

/*function mostrarProvincias(){
    try{
        for(var i=0; i<rptaWebservice.length; i++){
            if(rptaWebservice[i].idDepartamento==idDepartamentoDefault){
                $("#idProvinciaAsociado").append(new Option(rptaWebservice[i].nombreProvincia, rptaWebservice[i].idProvincia));
                $("#idProvinciaPropietario").append(new Option(rptaWebservice[i].nombreProvincia, rptaWebservice[i].idProvincia));
                $("#idProvinciaChofer").append(new Option(rptaWebservice[i].nombreProvincia, rptaWebservice[i].idProvincia));
            }
        }
        $("#idProvinciaAsociado").select2();
        $("#idProvinciaPropietario").select2();
        $("#idProvinciaChofer").select2();
        webService2("getAllDistritos", "", "cargarDistritos()");
    }catch(err){
        emitirErrorCatch(err, "mostrarProvincias");
    }
}*/
function cargarArrayDistritos(data){
	try{
		arrayDistritos=data;
		
	}catch(err){
		emitirErrorCatch(err, "cargarDistritos"); // emite error
	}
}
/* @consultarInfo: Busca la informacion de los reponsables del accidente
*/
function consultarInfo(){
	try{
		var parametros="&codEvento="+codEvento;
		consultarWebServiceGet("getActoresXcodEvento", parametros, cargarInfo);
	}catch(err){
		emitirErrorCatch(err, "consultarInfo")
	}
}
var actualizarPropietario=1; //  1=true; 0=false
var actualizarChofer=1; // 1=true;  0 =false

/* @cargarInfo: Carga la informacion de los agraviados en el formulario
*/
function cargarInfo(datos){
	try{
		if(datos.length>0){
			// ASOCIADO
			idAsociado=datos[0].idAsociado;
            var nombreAsociado=datos[0].nombresAsociado+" "+datos[0].apePatAsociado+" "+datos[0].apeMatAsociado;
            if(datos[0].tipoAsociado=="J"){ // Juridico
                nombreAsociado=datos[0].razonAsociado;
            }            
            idPersonaAsociado=datos[0].idPersonaAsociado;
			$("#nombreAsociado").val(quitarEspaciosBlanco(nombreAsociado))
			$("#nroDocAsociado").val(quitarEspaciosBlanco(datos[0].nroDocAsociado))
			$("#fechNacAsociado").val(quitarEspaciosBlanco(datos[0].fechaNacAsociado))
			$("#telfijo_a").val(quitarEspaciosBlanco(datos[0].fijoAsociado))
			$("#telmovil_a").val(quitarEspaciosBlanco(datos[0].movilAsociado))
			$("#calle_a").val(quitarEspaciosBlanco(datos[0].calleAsociado))
			$("#nro_a").val(quitarEspaciosBlanco(datos[0].nroDirecAsociado))
			$("#lote_a").val(quitarEspaciosBlanco(datos[0].mzloteAsociado))
			$("#sector_a").val(quitarEspaciosBlanco(datos[0].sectorAsociado))
			$("#referencia_a").val(quitarEspaciosBlanco(datos[0].referenciaAsociado))
			// Selecciona Departamento, provincia, distrito del ASOCIADO
			if(datos[0].departamentoAsociado==null || datos[0].departamentoAsociado==""){
				datos[0].departamentoAsociado="C01";
			}
			$("#idDepartamento_a").val(datos[0].departamentoAsociado)	
			cargarListaProvincias("a", arrayProvincias)
			if(datos[0].provinciaAsociado==null || datos[0].provinciaAsociado==""){
				datos[0].provinciaAsociado="P01";
			}
			$("#idProvincia_a").val(datos[0].provinciaAsociado)
			cargarListaDistritos("a", arrayDistritos)
			if(validarDistrito(datos[0].distritoAsociado)){
				$("#idDistrito_a").val(datos[0].distritoAsociado)	
			}else{
				$("#idDistrito_a").val("")
			}
			arrayResponsables[0]={
				idPersona:datos[0].idPersonaAsociado,
				nombre:datos[0].nombresAsociado,
				apePat:datos[0].apePatAsociado,
				apeMat:datos[0].apeMatAsociado,
				razonSocial:datos[0].razonAsociado,
				tipoPersona:datos[0].tipoAsociado,
				nroDoc:datos[0].nroDocAsociado,				
				calle:datos[0].calleAsociado,
				nro:datos[0].nroDirecAsociado,
				lote:datos[0].mzloteAsociado,
				sector:datos[0].sectorAsociado,
				referencia:datos[0].referenciaAsociado,
				idDepartamento:datos[0].departamentoAsociado,
				idProvincia:datos[0].provinciaAsociado,
				idDistrito:datos[0].distritoAsociado,
				telfijo:datos[0].fijoAsociado,
				telmovil:datos[0].movilAsociado,
				fecNac:datos[0].fechaNacAsociado,
				tipoResponsable:'a'
			};			
			// PROPIETARIO
			idPropietario=datos[0].idPropietario;
			if(datos[0].idPersonaPropietario==null){
				datos[0].idPersonaPropietario=0;
			}
			idPersonaPropietario=datos[0].idPersonaPropietario;
			if(idPersonaPropietario>0){		
				$("#idOculta_p").css("display", "none");
				
				$("#nombre_p").val(quitarEspaciosBlanco(datos[0].nombresPropietario))
				$("#apePat_p").val(quitarEspaciosBlanco(datos[0].apePatPropietario))
				$("#apeMat_p").val(quitarEspaciosBlanco(datos[0].apeMatPropietario))
				$("#nroDoc_p").val(quitarEspaciosBlanco(datos[0].nroDocPropietario))
				
				$("#nombreC_p").val(quitarEspaciosBlanco(datos[0].conyugeNombresPropietario))
				$("#apePatC_p").val(quitarEspaciosBlanco(datos[0].conyugeApePatPropietario))
				$("#apeMatC_p").val(quitarEspaciosBlanco(datos[0].conyugeApeMatPropietario))
				$("#nroDocC_p").val(quitarEspaciosBlanco(datos[0].conyugeNroDocPropietario))
				
				$("#tipoPersona_p").val(quitarEspaciosBlanco(datos[0].tipoPropietario));				
				$("#razonSocial_p").val(quitarEspaciosBlanco(datos[0].razonPropietario))
				$("#fecNac_p").val(quitarEspaciosBlanco(datos[0].fechaNacPropietario))
				$("#telfijo_p").val(quitarEspaciosBlanco(datos[0].fijoPropietario))
				$("#telmovil_p").val(quitarEspaciosBlanco(datos[0].movilPropietario))
				$("#calle_p").val(quitarEspaciosBlanco(datos[0].callePropietario))
				$("#nro_p").val(quitarEspaciosBlanco(datos[0].nroDirecPropietario))
				$("#lote_p").val(quitarEspaciosBlanco(datos[0].mzlotePropietario))
				$("#sector_p").val(quitarEspaciosBlanco(datos[0].sectorPropietario))
				$("#referencia_p").val(quitarEspaciosBlanco(datos[0].referenciaPropietario))
				// Selecciona Departamento, provincia, distrito del PROPIETARIO
				if(datos[0].departamentoPropietario==null || datos[0].departamentoPropietario==""){
					datos[0].departamentoPropietario="C01";
				}
				$("#idDepartamento_p").val(datos[0].departamentoPropietario)	
				cargarListaProvincias("p", arrayProvincias)
				if(datos[0].provinciaPropietario==null || datos[0].provinciaPropietario==""){
					datos[0].provinciaPropietario="P01";
				}
				$("#idProvincia_p").val(datos[0].provinciaPropietario)
				cargarListaDistritos("p", arrayDistritos)
				if(validarDistrito(datos[0].distritoPropietario)){
					$("#idDistrito_p").val(datos[0].distritoPropietario)
				}else{
					$("#idDistrito_p").val("")
				}
				if(idPersonaPropietario!=idPersonaAsociado){
					arrayResponsables[arrayResponsables.length]={
						idPersona:datos[0].idPersonaPropietario,
						nombre:datos[0].nombresPropietario,
						apePat:datos[0].apePatPropietario,
						apeMat:datos[0].apeMatPropietario,
						razonSocial:datos[0].razonPropietario,
						nombreC:datos[0].conyugeNombresPropietario,
						apePatC:datos[0].conyugeApePatPropietario,
						apeMatC:datos[0].conyugeApeMatPropietario,
						nroDocC:datos[0].conyugeNroDocPropietario,	
						razonSocial:datos[0].razonPropietario,
						tipoPersona:datos[0].tipoPropietario,
						nroDoc:datos[0].nroDocPropietario,				
						calle:datos[0].callePropietario,
						nro:datos[0].nroDirecPropietario,
						lote:datos[0].mzlotePropietario,
						sector:datos[0].sectorPropietario,
						referencia:datos[0].referenciaPropietario,
						idDepartamento:datos[0].departamentoPropietario,
						idProvincia:datos[0].provinciaPropietario,
						idDistrito:datos[0].distritoPropietario,
						telfijo:datos[0].fijoPropietario,
						telmovil:datos[0].movilPropietario,
						fecNac:datos[0].fechaNacPropietario,
						tipoResponsable:'p'
					};
				}				
				
			}
			validartipoDePersona("p");
			if(idPersonaPropietario==idPersonaAsociado){
				var prefijo='p'; // propietario					
				$("#nombre_"+prefijo).prop("readonly", true)
				$("#apePat_"+prefijo).prop("readonly", true)
				$("#apeMat_"+prefijo).prop("readonly", true)
				$("#razonSocial_"+prefijo).prop("readonly", true)
				$("#nroDoc_"+prefijo).prop("readonly", true)
				$("#fecNac_"+prefijo).prop("disabled", true)
				$("#tipoPersona_"+prefijo).prop("disabled", true)
			}
			// CHOFER
			idChofer=datos[0].idChofer;
			if(datos[0].idPersonaChofer==null){
				datos[0].idPersonaChofer=0;
			}
			idPersonaChofer=datos[0].idPersonaChofer;
			if(idPersonaChofer>0){
				// Desbloquea panel y carga chofer
				actualizarChofer=1;
				$("#idOculta_c").css("display", "none");
				$("#nombre_c").val(quitarEspaciosBlanco(datos[0].nombresChofer))
				$("#apePat_c").val(quitarEspaciosBlanco(datos[0].apePatChofer))
				$("#apeMat_c").val(quitarEspaciosBlanco(datos[0].apeMatChofer))
				$("#nroDoc_c").val(quitarEspaciosBlanco(datos[0].nroDocChofer))
				$("#fecNac_c").val(quitarEspaciosBlanco(datos[0].fechaNacChofer))
				$("#telfijo_c").val(quitarEspaciosBlanco(datos[0].fijoChofer))
				$("#telmovil_c").val(quitarEspaciosBlanco(datos[0].movilChofer))
				$("#calle_c").val(quitarEspaciosBlanco(datos[0].calleChofer))
				$("#nro_c").val(quitarEspaciosBlanco(datos[0].nroDirecChofer))
				$("#lote_c").val(quitarEspaciosBlanco(datos[0].mzloteChofer))
				$("#sector_c").val(quitarEspaciosBlanco(datos[0].sectorChofer))
				$("#claseChofer").val(quitarEspaciosBlanco(datos[0].clasechofer));
				$("#licenciaChofer").val(quitarEspaciosBlanco(datos[0].licenciachofer));
				$("#referencia_c").val(quitarEspaciosBlanco(datos[0].referenciaChofer))				
				// Selecciona Departamento, provincia, distrito del CHOFER
				if(datos[0].departamentoChofer==null || datos[0].departamentoChofer==""){
					datos[0].departamentoChofer="C01";
				}
				$("#idDepartamento_c").val(datos[0].departamentoChofer)	
				cargarListaProvincias("c", arrayProvincias)
				if(datos[0].provinciaChofer==null || datos[0].provinciaChofer==""){
					datos[0].provinciaChofer="P01";
				}
				$("#idProvincia_c").val(datos[0].provinciaChofer)
				cargarListaDistritos("c", arrayDistritos)
				if(validarDistrito(datos[0].distritoChofer)){
					$("#idDistrito_c").val(datos[0].distritoChofer)	
				}else{
					$("#idDistrito_c").val("");
				}
				if(idPersonaChofer!=idPersonaAsociado && idPersonaChofer!=idPersonaPropietario){
					arrayResponsables[arrayResponsables.length]={
						idPersona:datos[0].idPersonaChofer,
						nombre:datos[0].nombresChofer,
						apePat:datos[0].apePatChofer,
						apeMat:datos[0].apeMatChofer,
						razonSocial:'',
						tipoPersona:datos[0].tipoChofer, // Natural
						nroDoc:datos[0].nroDocChofer,				
						calle:datos[0].calleChofer,
						nro:datos[0].nroDirecChofer,
						lote:datos[0].mzloteChofer,
						sector:datos[0].sectorChofer,
						referencia:datos[0].referenciaChofer,
						idDepartamento:datos[0].departamentoChofer,
						idProvincia:datos[0].provinciaChofer,
						idDistrito:datos[0].distritoChofer,
						telfijo:datos[0].fijoChofer,
						telmovil:datos[0].movilChofer,
						fecNac:datos[0].fechaNacChofer,
						tipoResponsable:'c',
						clase:datos[0].clasechofer,
						licencia:datos[0].licenciachofer
					};
				}												
			}
			if(idPersonaChofer==idPersonaAsociado){
				var prefijo='c'; // propietario					
				$("#nombre_"+prefijo).prop("readonly", true)
				$("#apePat_"+prefijo).prop("readonly", true)
				$("#apeMat_"+prefijo).prop("readonly", true)
				$("#nroDoc_"+prefijo).prop("readonly", true)
				$("#fecNac_"+prefijo).prop("disabled", true)
			}
			$("#idDepartamento_a").select2()
			$("#idDepartamento_p").select2()
			$("#idDepartamento_c").select2()
			$("#idProvincia_a").select2()
			$("#idProvincia_p").select2()
			$("#idProvincia_c").select2()
			$("#idDistrito_a").select2()
			$("#idDistrito_p").select2()
			$("#idDistrito_c").select2()
			cargarComboPersonasResponsables();
			$.fancybox.close();
		}else{
			fancyAlert("No se encontro ningun registro");
		}
	}catch(err){
		emitirErrorCatch(err, "cargarInfo"); // emite error
	}
}
/* @cargarComboPersonasResponsables: Carga el combobox con los responsables del accidente.
*/
function cargarComboPersonasResponsables(){
	try{
		$("#idCmbSelecion_p").html("");
		$("#idCmbSelecion_c").html("");
		for(var i=0; i<arrayResponsables.length; i++){
			// identifica el tipo de persona:			
			var tipoPersona=arrayResponsables[i].tipoPersona;
			var nombre='';
			switch(tipoPersona){
				case 'N':
					nombre=arrayResponsables[i].nombre+' '+arrayResponsables[i].apePat+' '+arrayResponsables[i].apeMat;
					break;
				case 'J':
					nombre=arrayResponsables[i].razonSocial;				
					break;
				case 'C':
					nombre=arrayResponsables[i].nombre+' '+arrayResponsables[i].apePat+' '+arrayResponsables[i].apeMat+"/"+arrayResponsables[i].nombreC+' '+arrayResponsables[i].apePatC+' '+arrayResponsables[i].apeMatC;
					break;
			}
			$("#idCmbSelecion_p").append(new Option(nombre, arrayResponsables[i].idPersona));
			if(arrayResponsables[i].tipoPersona=='N'){ //Solo si es persona natural se agrega en el combobox del chofer
				$("#idCmbSelecion_c").append(new Option(nombre, arrayResponsables[i].idPersona));
			}			
		}
		$("#idCmbSelecion_p").append(new Option('Nueva Persona', 0));		
		$("#idCmbSelecion_c").append(new Option('Nueva Persona', 0));
		$("#idCmbSelecion_p").val(idPersonaPropietario)
		$("#idCmbSelecion_c").val(idPersonaChofer)
		$("#idCmbSelecion_p").change(function(){
			var idPersona=this.value;
			if(idPersona>0){
				seleccionarPersonaResponsable(idPersona, 'p')	
			}else{
				$("#idOculta_p").css("display", "none");
				limpiarCamposResponsable('p')
			}
			idPersonaPropietario=idPersona;			
		})
		$("#idCmbSelecion_c").change(function(){
			var idPersona=this.value;
			if(idPersona>0){				
				seleccionarPersonaResponsable(idPersona, 'c')
			}else{
				$("#idOculta_c").css("display", "none");
				limpiarCamposResponsable('c')
				// Limpia licencia y categoria
				$("#claseChofer").val("");
				$("#licenciaChofer").val("");
			}
			idPersonaChofer=idPersona;			
		})
	}catch(err){
		emitirErrorCatch(err, "cargarPersonasResponsables")
	}
}

/* @seleccionarPersonaResponsable: Busca localmente el registro del responsable seleccionado en lista de responsables.
	PARAMETROS:
	 	1) id: id de la persona Responsable.
	 	2) prefijo: prefijo del id del combobox de los responsables (Lista de responsables)
*/
function seleccionarPersonaResponsable(id, prefijo){
	try{
		for(var i=0; i<arrayResponsables.length; i++){
			if(arrayResponsables[i].idPersona==id){
				var objeto=arrayResponsables[i];
				cargarInfoResponsableSeleccionado(objeto, prefijo)
				break;
			}
		}
	}catch(err){
		emitirErrorCatch(err, "seleccionarPersonaResponsable")
	}
}

/* @cargarInfoResponsableSeleccionado: Carga el responsable seleccionado en el combobox Lista de Responsables
	PARAMETROS:
		1) objeto: datos del responsable seleccionado.
		2) prefijo: prefijo del id del combobox Lista de Responsables.
*/
function cargarInfoResponsableSeleccionado(objeto, prefijo){
	try{
		if(prefijo=='c' && objeto.tipoPersona=='J'){
			fancyAlert("No se puede seleccionar una persona jurídica como chofer");
			$("#idCmbSelecion_"+prefijo).val(0);
			limpiarCamposResponsable("c");
			$("#claseChofer").val("")
			$("#licenciaChofer").val("")
			return;
		}
		$("#nombre_"+prefijo).val(objeto.nombre)
		$("#apePat_"+prefijo).val(objeto.apePat)
		$("#apeMat_"+prefijo).val(objeto.apeMat)
		$("#razonSocial_"+prefijo).val(objeto.razonSocial)
		$("#nroDoc_"+prefijo).val(objeto.nroDoc)
		$("#tipoPersona_"+prefijo).val(objeto.tipoPersona)		
		$("#fecNac_"+prefijo).val(objeto.fecNac)
		$("#calle_"+prefijo).val(objeto.calle)
		$("#nro_"+prefijo).val(objeto.nro)
		$("#lote_"+prefijo).val(objeto.lote)
		$("#sector_"+prefijo).val(objeto.sector)
		$("#referencia_"+prefijo).val(objeto.referencia)
		$("#telfijo_"+prefijo).val(objeto.telfijo)
		$("#telmovil_"+prefijo).val(objeto.telmovil)
		$("#idDepartamento_"+prefijo).val(objeto.idDepartamento)	
		cargarListaProvincias(prefijo, arrayProvincias)
		$("#idProvincia_"+prefijo).val(objeto.idProvincia)
		cargarListaDistritos(prefijo, arrayDistritos)
		if(validarDistrito(objeto.idDistrito)){
			$("#idDistrito_"+prefijo).val(objeto.idDistrito)
		}else{
			$("#idDistrito_"+prefijo).val("")
		}
		$("#idDepartamento_"+prefijo).select2()
		$("#idProvincia_"+prefijo).select2()
		$("#idDistrito_"+prefijo).select2()
		validartipoDePersona(prefijo);
		if(objeto.tipoResponsable=='a'){// si es asociado
			$("#nombre_"+prefijo).prop("readonly", true)
			$("#apePat_"+prefijo).prop("readonly", true)
			$("#apeMat_"+prefijo).prop("readonly", true)
			$("#razonSocial_"+prefijo).prop("readonly", true)
			$("#nroDoc_"+prefijo).prop("readonly", true)
			$("#fecNac_"+prefijo).prop("disabled", true)
			$("#tipoPersona_"+prefijo).prop("disabled", true)
		}else{
			if(objeto.tipoPersona=='N'){
				$("#nombre_"+prefijo).prop("readonly", false)
				$("#apePat_"+prefijo).prop("readonly", false)
				$("#apeMat_"+prefijo).prop("readonly", false)	
				$("#razonSocial_"+prefijo).prop("readonly", true)
			}
			if(objeto.tipoPersona=='J'){
				$("#nombre_"+prefijo).prop("readonly", true)
				$("#apePat_"+prefijo).prop("readonly", true)
				$("#apeMat_"+prefijo).prop("readonly", true)	
				$("#razonSocial_"+prefijo).prop("readonly", false)
			}
			$("#nroDoc_"+prefijo).prop("readonly", false)
			$("#fecNac_"+prefijo).prop("disabled", false)
			$("#tipoPersona_"+prefijo).prop("disabled", false)
		}	
		
		if(prefijo=='c'){ // chofer
			$("#claseChofer").val(objeto.clase)
			$("#licenciaChofer").val(objeto.licencia)		
		}		
	}catch(err){
		emitirErrorCatch(err, "cargarInfoResponsableSeleccionado")
	}
}
function limpiarCamposResponsable(prefijo){
	try{
		$("#nombre_"+prefijo).val("")
		$("#nombre_"+prefijo).prop("readonly", false)
		$("#apePat_"+prefijo).val("")
		$("#apePat_"+prefijo).prop("readonly", false)
		$("#apeMat_"+prefijo).val("")
		$("#apeMat_"+prefijo).prop("readonly", false)
		$("#razonSocial_"+prefijo).val("")
		$("#razonSocial_"+prefijo).prop("readonly", false)
		$("#nroDoc_"+prefijo).val("")
		$("#nroDoc_"+prefijo).prop("readonly", false)
		$("#fecNac_"+prefijo).val("")
		$("#fecNac_"+prefijo).prop("disabled", false)
		$("#tipoPersona_"+prefijo).val("N")
		$("#tipoPersona_"+prefijo).prop("disabled", false)
		validartipoDePersona(prefijo);
		$("#calle_"+prefijo).val("")
		$("#nro_"+prefijo).val("")
		$("#lote_"+prefijo).val("")
		$("#sector_"+prefijo).val("")
		$("#telfijo_"+prefijo).val("")
		$("#telmovil_"+prefijo).val("")
		$("#idDepartamento_"+prefijo).val("C01")	
		cargarListaProvincias(prefijo, arrayProvincias)
		$("#idProvincia_"+prefijo).val("P01")
		$("#idProvincia_"+prefijo).select2()
		cargarListaDistritos(prefijo, arrayDistritos)
	}catch(err){
		emitirErrorCatch(err, "limpiarCamposResponsable")
	}
}
/* @cargarArrayDistritos: Valida si existe el distrito
	PARAMETROS:
		idDist: id del distrito
*/
function validarDistrito(idDist){
	try{
		var estado=false;
		for(var i=0; i<arrayDistritos.length; i++){
			if(arrayDistritos[i].idDistrito==idDist){
				estado=true;
				break;
			}
		}
		return estado;
	}catch(err){
		emitirErrorCatch(err, "validarDistrito"); // emite error
	}
}
function convertMayusculas(element){
	try{
		var valor= element.value;
		valor = valor.toUpperCase();
		if(valor.trim()!=""){
			$(element).val(valor) // devuelve el valor en mayusculas
		}
	}catch(err){
		emitirErrorCatch(err, "convertMayusculas")
	}
}
function quitarEspaciosBlanco(valor){
	try{
		if(valor!=undefined){
			valor=valor.trim()
		}
		return valor;
	}catch(err){
		emitirErrorCatch(err, "quitarEspaciosBlanco")
	}
}

function guardarActores(){
	try{
		var camposAvalidar="calle_a-Calle Asociado";
		// Propietario
		switch($("#tipoPersona_p").val()){
			case 'N':
				camposAvalidar=camposAvalidar+"/nombre_p-Nombre Propietario/apePat_p-Apellido Pat. Propietario/"+
												"apeMat_p-Apellido Mat. Propietario";
				break;
			case 'J':
			camposAvalidar=camposAvalidar+"/razonSocial_p-Razon Social Propietario";
				break;
			case 'C':
			camposAvalidar=camposAvalidar+"/nroDocC_p-Nro Doc. del Conyugue propietario/nombreC_p-Nombre Conyugue propietario/apePatC_p-Apellido Pat. Conyugue propietario/"+
												"apeMatC_p-Apellido Mat. Conyugue propietario";
		}		
		camposAvalidar=camposAvalidar+"/nroDoc_p-Nro Doc. del Propietario/calle_p-Calle Propietario/"+
		"nombre_c-Nombre Chofer/apePat_c-Apellido Pat. Chofer/"+
		"apeMat_c-Apellido Mat. Chofer/nroDoc_c-Nro Doc. del Chofer/"+
		"calle_c-Calle Chofer";
		if(validarInputsValueXid(camposAvalidar)){
			fancyConfirm("¿Esta seguro de actualizar la información de los responsable, del Evento Nº "+codEvento+"?", function(estado){
				if(estado){
					fancyAlertWait("Guardando Informacion");
					//Obtiene parametros
					var parametros="";
					// PROPIETARIO
					parametros=parametros+"&nombrePropietario="+$("#nombre_p").val();
					parametros=parametros+"&apePatPropietario="+$("#apePat_p").val();
					parametros=parametros+"&apeMatPropietario="+$("#apeMat_p").val();
					parametros=parametros+"&nroDocPropietario="+$("#nroDoc_p").val();
					parametros=parametros+"&nombrePropietarioC="+$("#nombreC_p").val();
					parametros=parametros+"&apePatPropietarioC="+$("#apePatC_p").val();
					parametros=parametros+"&apeMatPropietarioC="+$("#apeMatC_p").val();
					parametros=parametros+"&nroDocPropietarioC="+$("#nroDocC_p").val();
					parametros=parametros+"&tipoPropietario="+$("#tipoPersona_p").val();
					parametros=parametros+"&razonSocialPropietario="+$("#razonSocial_p").val();
					/*fechaPropietario=$("#fecNac_p").val();
					if(fechaPropietario!=""){
						fechaPropietario=dateTimeFormat($("#fecNac_p").val());
					}*/
					parametros=parametros+"&fecNacPropietario="//+fechaPropietario;
					parametros=parametros+"&telfijoPropietario="+$("#telfijo_p").val();
					parametros=parametros+"&telmovilPropietario="+$("#telmovil_p").val();
					parametros=parametros+"&callePropietario="+$("#calle_p").val();
					parametros=parametros+"&nroPropietario="+$("#nro_p").val();
					parametros=parametros+"&lotePropietario="+$("#lote_p").val();
					parametros=parametros+"&sectorPropietario="+$("#sector_p").val();
					parametros=parametros+"&referenciaPropietario="+$("#referencia_p").val();
					parametros=parametros+"&idDistritoPropietario="+$("#idDistrito_p").val();
					parametros=parametros+"&idPersonaPropietario="+idPersonaPropietario;
					// CHOFER
					parametros=parametros+"&nombreChofer="+$("#nombre_c").val();
					parametros=parametros+"&apePatChofer="+$("#apePat_c").val();
					parametros=parametros+"&apeMatChofer="+$("#apeMat_c").val();
					parametros=parametros+"&nroDocChofer="+$("#nroDoc_c").val();
					fechaChofer=$("#fecNac_c").val();
					if(fechaChofer!=""){
						fechaChofer=dateTimeFormat($("#fecNac_c").val());
					}
					parametros=parametros+"&fecNacChofer="+fechaChofer;
					parametros=parametros+"&telfijoChofer="+$("#telfijo_c").val();
					parametros=parametros+"&telmovilChofer="+$("#telmovil_c").val();
					parametros=parametros+"&calleChofer="+$("#calle_c").val();
					parametros=parametros+"&nroChofer="+$("#nro_c").val();
					parametros=parametros+"&loteChofer="+$("#lote_c").val();
					parametros=parametros+"&sectorChofer="+$("#sector_c").val();
					parametros=parametros+"&referenciaChofer="+$("#referencia_c").val();
					parametros=parametros+"&claseChofer="+$("#claseChofer").val();
					parametros=parametros+"&licenciaChofer="+$("#licenciaChofer").val();
					parametros=parametros+"&idDistritoChofer="+$("#idDistrito_c").val();
					parametros=parametros+"&idPersonaChofer="+idPersonaChofer;

                    // ASOCIADO
                    parametros=parametros+"&calleAsociado="+$("#calle_a").val();
                    parametros=parametros+"&nroAsociado="+$("#nro_a").val();
                    parametros=parametros+"&loteAsociado="+$("#lote_a").val();
                    parametros=parametros+"&sectorAsociado="+$("#sector_a").val();
                    parametros=parametros+"&referenciaAsociado="+$("#referencia_a").val();
                    parametros=parametros+"&idDistritoAsociado="+$("#idDistrito_a").val();
                    parametros=parametros+"&telfijoAsociado="+$("#telfijo_a").val();
                    parametros=parametros+"&telmovilAsociado="+$("#telmovil_a").val();
                    parametros=parametros+"&idPersonaAsociado="+idPersonaAsociado;
                    
                    // id Responsables:
                    parametros=parametros+"&idAsociado="+idAsociado;
                    parametros=parametros+"&idPropietario="+idPropietario;
                    parametros=parametros+"&idChofer="+idChofer;
                    parametros=parametros+"&codEvento="+codEvento;
                    webService2("guardarDatosActores", parametros, "finalizarActualizacionDeActores()");
				}
			});
		}		
	}catch(err){
		emitirErrorCatch(err, "cargarProvincia"); // emite error
	}
} 
function finalizarActualizacionDeActores(){
	try{
		if(rptaWebservice[0]>0){
			fancyAlertFunction("Se actualizarón los actores del evento "+codEvento, function(estado){
				if(estado){
					parent.window.frames[0].filaSeleccionada=undefined;
					parent.$.fancybox.close();
					parent.window.frames[0].cargarListaDeAccidentes(parent.window.frames[0].filtroBusqueda, parent.window.frames[0].paginacion.registrosXpagina, parent.window.frames[0].paginacion.cantPaginas, parent.window.frames[0].paginacion.paginaActual, parent.window.frames[0].paginacion);
	 			}
			});
		}
	}catch(err){
		emitirErrorCatch(err, "finalizarActualizacionDeActores"); // emite error
	}
}
function clonarDepaProvDist(id){
	try{
		var valor=$("#"+id).val();		
		id=id.split("_");
		var prefijo=id[1];
		var personaComboSeleccionada=$("#idCmbSelecion_"+prefijo).val();
		if(personaComboSeleccionada!=0){
			var field=id[0];
			var idPersona;
			switch(prefijo){
				case 'a':
					idPersona=idPersonaAsociado;
					if(idPersonaAsociado==idPersonaPropietario){
						if(field=='idDepartamento'){
							$("#idDepartamento_p").val(valor)	
							$("#idDepartamento_p").select2();
							cargarListaProvincias("p", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_p").val(valor)
							$("#idProvincia_p").select2()
							cargarListaDistritos("p", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_p").val(valor)	
							}else{
								$("#idDistrito_p").val("");
							}
							$("#idDistrito_p").select2()						
						}			
					}
					if(idPersonaAsociado==idPersonaChofer){
						if(field=='idDepartamento'){
							$("#idDepartamento_c").val(valor)	
							$("#idDepartamento_c").select2()
							cargarListaProvincias("c", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_c").val(valor)
							$("#idProvincia_c").select2()
							cargarListaDistritos("c", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_c").val(valor)	
							}else{
								$("#idDistrito_c").val("");
							}
							$("#idDistrito_c").select2()						
						}	
					}
					break;
				case 'p':
					idPersona=idPersonaPropietario;
					if(idPersonaPropietario==idPersonaAsociado){
						if(field=='idDepartamento'){
							$("#idDepartamento_a").val(valor)	
							$("#idDepartamento_a").select2()
							cargarListaProvincias("a", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_a").val(valor)
							$("#idProvincia_a").select2()
							cargarListaDistritos("a", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_a").val(valor)	
							}else{
								$("#idDistrito_a").val("");
							}
							$("#idDistrito_a").select2();						
						}					
					}
					if(idPersonaPropietario==idPersonaChofer){
						if(field=='idDepartamento'){
							$("#idDepartamento_c").val(valor)	
							$("#idDepartamento_c").select2()
							cargarListaProvincias("c", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_c").val(valor)
							$("#idProvincia_c").select2()
							cargarListaDistritos("c", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_c").val(valor)	
							}else{
								$("#idDistrito_c").val("");
							}
							$("#idDistrito_c").select2()						
						}				
					}
					break;
				case 'c':
					idPersona=idPersonaChofer;
					if(idPersonaChofer==idPersonaAsociado){
						if(field=='idDepartamento'){
							$("#idDepartamento_a").val(valor)	
							$("#idDepartamento_a").select2()
							cargarListaProvincias("a", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_a").val(valor)
							$("#idProvincia_a").select2()
							cargarListaDistritos("a", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_a").val(valor)	
							}else{
								$("#idDistrito_a").val("");
							}
							$("#idDistrito_a").select2()						
						}
					}
					if(idPersonaChofer==idPersonaPropietario){
						if(field=='idDepartamento'){
							$("#idDepartamento_p").val(valor)	
							$("#idDepartamento_p").select2()
							cargarListaProvincias("p", arrayProvincias)
						}
						if(field=='idProvincia'){
							$("#idProvincia_p").val(valor)
							$("#idProvincia_p").select2()
							cargarListaDistritos("p", arrayDistritos)
						}
						if(field=='idDistrito'){
							if(validarDistrito(valor)){
								$("#idDistrito_p").val(valor)	
							}else{
								$("#idDistrito_p").val("");
							}
							$("#idDistrito_p").select2()						
						}
					}
					break;
			}
			for(var i=0; i<arrayResponsables.length; i++){
				if(arrayResponsables[i].idPersona==idPersona){
					arrayResponsables[i][field]=valor;
					if(field=='idProvincia'){
						arrayResponsables[i]['idDistrito']='';
					}				
					break;
				}
			}
			cargarComboPersonasResponsables()
		}
	}catch(err){
		emitirErrorCatch(err, "clonarDepaProvDist")
	}
}