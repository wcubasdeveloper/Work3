var arrayUsuarios;
cargarInicio(function(){
	consultarWebServiceGet("getListaUsuarios", "", function(data){ // Obtiene todos los usuarios del sistema
		for(var i=0; i<data.length; i++){ 
			// llena los combobox de Usuarios autorizados:
			$("#cmb_autorizado1").append(new Option(data[i].nombreUsuario, data[i].idUsuario));
			$("#cmb_autorizado2").append(new Option(data[i].nombreUsuario, data[i].idUsuario));
			$("#cmb_autorizado3").append(new Option(data[i].nombreUsuario, data[i].idUsuario));
			// Llena los combobox de Usuarios a notificar:
			$("#cmb_anotificar-1").append(new Option(data[i].nombreUsuario, data[i].idUsuario));
			$("#cmb_anotificar-2").append(new Option(data[i].nombreUsuario, data[i].idUsuario));
		}
		arrayUsuarios=data; // almacena la informacion de los usuarios en el arreglo global
		// agrega eventos onchange

		$(".autorizado").change(function(){
			var idCampoCorreo = this.id.split("cmb_autorizado");
			idCampoCorreo = "correo-"+idCampoCorreo[1];
			$("#"+idCampoCorreo).val(""); // reincia el campo de correo del usuario a notificar
			$("#"+idCampoCorreo).prop("disabled", true);
			$("#"+idCampoCorreo).prop("name", "");
			if(this.value!=""){				
				if(validarComboNoRepetido(this)){
					cargarCorreoUsuario(this.id, "correo", "cmb_autorizado");					
				}
			}
		});
		$(".anotificar").change(function(){
			var idCampoCorreo = this.id.split("-");
			idCampoCorreo = "correo2-"+idCampoCorreo[1];
			$("#"+idCampoCorreo).val(""); // reincia el campo de correo del usuario a notificar
			$("#"+idCampoCorreo).prop("disabled", true);
			$("#"+idCampoCorreo).prop("name", "");
			if(this.value!=""){				
				if(validarComboNoRepetido(this)){
					cargarCorreoUsuario(this.id, "correo2", "-");									
				}
			}
		});
		$(".correoUsuario").keyup(function(){
			// obtiene su name
			var name = $(this).prop("name");
			var idElement = $(this).prop("id");
			actualizarCorreo(name, idElement);
		});
		// agrega evento onclick
		$("#btnGuardar").click(guardarCambios)
		$("#horasAnticipa").keypress(function(e){ // permite ingresar numeros mayores de 0
            var valor=this.value;
            return textNumber(e, 0, valor);
        });
		// Ahora buscara todas las variables globales registradas en el sistema
		consultarWebServiceGet("getVariablesGlobales", "", function(data){
			// carga la información de las variables en el formulario
			// Carga información de usuarios autorizados:
			$("#cmb_autorizado1").val(ceroXvacio(data[0].idUsuarioAutorizado1));
			cargarCorreoUsuario("cmb_autorizado1", "correo", "cmb_autorizado");
			$("#cmb_autorizado2").val(ceroXvacio(data[0].idUsuarioAutorizado2));
			cargarCorreoUsuario("cmb_autorizado2", "correo", "cmb_autorizado");
			$("#cmb_autorizado3").val(ceroXvacio(data[0].idUsuarioAutorizado3));
			cargarCorreoUsuario("cmb_autorizado3", "correo", "cmb_autorizado");
			// carga informacion de los usuarios a notificar:
			$("#cmb_anotificar-1").val(ceroXvacio(data[0].idUsuarioNotificar1));
			cargarCorreoUsuario("cmb_anotificar-1", "correo2", "-");
			$("#cmb_anotificar-2").val(ceroXvacio(data[0].idUsuarioNotificar2));
			cargarCorreoUsuario("cmb_anotificar-2", "correo2", "-");
			$("#diasAnticipa").val(data[0].diasAnticipa);
			$("#idTXTAprobacion").val(quitarEspaciosBlanco(data[0].textAPROBADO));
			$("#idTXTObservacion").val(quitarEspaciosBlanco(data[0].textOBSERVADO));
			$.fancybox.close();
		})
	})
});
function actualizarCorreo(name, id){ // actualiza correo si se elige un usuarios como autorizado y a notificar
	try{
		$("input[name='"+name+"']").each(function(){
			var idThisElement=this.id;
			if(idThisElement!=id){
				$(this).val($("#"+id).val())
			}
		});
	}catch(err){
		emitirErrorCatch(err, "actualizarCorreo")
	}
}
function validarComboNoRepetido(elemento){
	try{
		var valorRpta=true;
		var claseElemento = $(elemento).attr("class");
		var valor = elemento.value;
		$("."+claseElemento).each(function(){
			var valorActual = this.value;
			if(valorActual!=""){
				if(valorActual==valor && this.id!=elemento.id){
					valorRpta=false;
					fancyAlertFunction("Este usuario : "+$("#"+elemento.id+" option:selected").text()+" ya fue seleccionado", function(rpta){
						if(rpta){
							$(elemento).focus();
							$(elemento).val("");
						}
					})
					return false;
				}
			}
		})
		return valorRpta;
	}catch(err){
		emitirErrorCatch(err, "validarComboNoRepetido")
	}
}
function cargarCorreoUsuario(idCombo, prefijo, flag){
	try{
		var idUsuario = $("#"+idCombo).val();
		var idCorreo = idCombo.split(flag);
		idCorreo=prefijo+"-"+idCorreo[1];
		for(var i=0; i<arrayUsuarios.length; i++){
			if(arrayUsuarios[i].idUsuario==idUsuario){
				var email = quitarEspaciosBlanco(arrayUsuarios[i].email);
				// obtiene id del campo email				
				$("#"+idCorreo).val(email);
				$("#"+idCorreo).prop("disabled", false);
				$("#"+idCorreo).focus();
				var nameCorreo = "id_"+arrayUsuarios[i].idUsuario; // asigna un nombre al input con el formato id_idUsuario
				$("#"+idCorreo).prop("name", nameCorreo)
				actualizarCorreo(nameCorreo, idCorreo)
				break;
			}
		}

	}catch(err){
		emitirErrorCatch(err, "cargarUsuarioAnotificar")
	}
}
/* @guardarCambios: Actualiza los cambios de las variables globales
*/
function guardarCambios(){
	try{
		if(verificarCampos("autorizado", "correo", "cmb_autorizado", true) && verificarCampos("anotificar", "correo2", "-", true) && validarCamposRequeridos("panelAnticipacion") && validarCamposRequeridos("idPanelTextos")){ //
			fancyConfirm("¿Estas seguro de actualizar las variables globales?", function(rpta){
				if(rpta){
					var parametros="";
					for(var i=1; i<=3; i++){
						parametros=parametros+"&idUsuarioAutorizado"+i+"="+ceroXvacio($("#cmb_autorizado"+i).val());
						parametros=parametros+"&correo"+i+"="+$("#correo-"+i).val();
					}
					for(var i=1; i<=2; i++){
						parametros=parametros+"&idUsuarioNotificar"+i+"="+ceroXvacio($("#cmb_anotificar-"+i).val());						
						parametros=parametros+"&correo"+(3+i)+"="+$("#correo2-"+i).val();
					}
					parametros=parametros+"&diasAnticipacion="+$("#diasAnticipa").val()+
						"&textAprobado="+$("#idTXTAprobacion").val()+
						"&textObservado="+$("#idTXTObservacion").val();
					consultarWebServiceGet("actualizarVariablesGlobales", parametros, function(data){
						if(data[0]>0){
							fancyAlert("¡Se actualizaron las variables correctamente!");
						}
					})
				}
			})			
		}
	}catch(err){
		emitirErrorCatch(err, "guardarCambios")
	}
}
function verificarCampos(claseElemento, prefijo, flag, verfificarEmail){
	try{
		var valorRpta=true;
		var usuariosSeleccionados=0;
		$("."+claseElemento).each(function(){
			if(this.value!=""){ // si se ha llenao un usuario
				if(verfificarEmail==true){	
					var idCampoCorreo=this.id.split(flag);
					idCampoCorreo = prefijo+"-"+idCampoCorreo[1];
					if($("#"+idCampoCorreo).val()==""){
						valorRpta=false; // hace que devuelva un valor false
						fancyAlertFunction("Falta completar correo", function(rpta){
							if(rpta){
								$("#"+idCampoCorreo).focus();
							}
						})
						return false;
					}else{
						usuariosSeleccionados++;
					}
				}else{
					usuariosSeleccionados++;
				}
			}
		})
		if(valorRpta){ // si el valor sigue siendo TRUE, verificara que al menos un usuario se haya seleccionado en el combobox
			if(usuariosSeleccionados==0){ // si no se selecciono ninguno
				switch(claseElemento){
					case 'autorizado':
						fancyAlert("Debe seleccionar al menos un Usuario autorizado");
						break;
					case 'anotificar':
						fancyAlert("Debe seleccionar al menos un Usuario a notificar");
						break;
				}
				valorRpta=false; // cambiara a false
			}
		}
		return valorRpta;
	}catch(err){
		emitirErrorCatch(err, "verificarCampos")
	}
}
function ceroXvacio(valor){ // devuelve un vacio x cero y viceversa, sino devuelve el mismo valor
	try{
		if(valor=="0"){
			return "";
		}
		if(valor==""){
			return 0;
		}
		return valor;
	}catch(err){
		emitirErrorCatch(err, "ceroXvacio")
	}
}