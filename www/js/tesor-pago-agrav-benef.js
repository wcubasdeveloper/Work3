var personaBeneficiario 
var DAOV = new DAOWebServiceGeT("wbs_ventas") 
var arrayDistritos;
var arrayDepartamentos;
var arrayProvincias;
cargarInicio(function(){
	
	$("#idDistrito_rep").change(function(){
        cargarProvinciasDep("rep", idProvinciaSelect);
    })
	$("#btnGuardar").click(guardar)
	personaBeneficiario = parent.personaBeneficiario
	$("#txtNombreRep").attr("requerido", "Nombres")
	$("#txtApePatRep").attr("requerido", "Apellido Paterno")
	$("#txtApeMatRep").attr("requerido", "Apellido Materno")
	
	if(arrayDistritos.length==0){
		DAOV.consultarWebServiceGet("getAllDistritos", "", function(data){
			parent.arrayDistritos=data; // Guarda los distritos
			DAOV.consultarWebServiceGet("getAllProvincias", "", function(datos){
				parent.arrayProvincias=datos;
				DAOV.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
					parent.arrayDepartamentos=depas;
					cargarInfo()
				})
			})			
		})
	}else{
		cargarInfo()
	}
})
function cargarDistritoBenef(idDistrito){
	try{
		arrayDistritos = parent.arrayDistritos
		arrayDepartamentos = parent.arrayDepartamentos
		arrayProvincias = parent.arrayProvincias
		
		var idProvincia="P01";
        if(idDistrito!=null){
            for(var i=0; i<arrayDistritos.length; i++){
                if(arrayDistritos[i].idDistrito==idDistrito){
                    idProvincia=arrayDistritos[i].idProvincia;
                    break;
                }
            }
        }
		idProvinciaSelect = idProvincia;
        cargarDistritos("rep", idProvincia);		
	}catch(err){
		emitirErrorCatch(err, "cargarDistritoBenef");
	}
}
function cargarInfo(){
	try{
		if(personaBeneficiario.length>0){				
			var persona = personaBeneficiario[0]
			$("#txtDNIRep").val(persona.nroDocumento)
			$("#txtNombreRep").val(persona.nombres)
			$("#txtApePatRep").val(persona.apellidoPaterno)
			$("#txtApeMatRep").val(persona.apellidoMaterno)
			$("#txtTelfRep").val(persona.telefonoMovil)			
			$("#txtDirecRep").val(persona.calle)
			var idDistrito = persona.distritoInicial
			cargarDistritoBenef(idDistrito);
			if(idDistrito!=null && idDistrito!=""){
				$("#idDistrito_rep").val(idDistrito);
				$("#idDistrito_rep").select2();
			}
			$.fancybox.close()
		}else{
			fancyAlertFunction("¡Error, no has ingresado ningun DNI en la busqueda!", function(){
				parent.$.fancybox.close()
			})
		}
	}catch(err){
		emitirErrorCatch(err, "cargarInfo")
	}
}
function guardar(){
	try{
		if(validarCamposRequeridos("pnlRepLegal")){
			var registro = {
				idPersona : personaBeneficiario[0].idPersona,
				nroDocumento : personaBeneficiario[0].nroDocumento,
				nombres:$("#txtNombreRep").val(),
				apellidoPaterno:$("#txtApePatRep").val(),
				apellidoMaterno:$("#txtApeMatRep").val(),
				telefonoMovil:$("#txtTelfRep").val(),
				calle:$("#txtDirecRep").val(),
				distritoInicial:$("#idDistrito_rep").val()
			};
            realizoTarea=true;
            rptaCallback = [registro];
            parent.$.fancybox.close()
		}		
	}catch(err){
		emitirErrorCatch(err, "guardar")
	}
}