var dataTable=undefined;
var accion = $_GET('accion');
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDistritos=new Array();
var arrayProvincias=new Array();
var arrayDepartamentos=new Array();
var arrayInfoEvento; 
cargarInicio(function(){
	$("#btnGuardar").click(guardarEvento);
    $("#btnAgregar").click(agregarAgraviado);
    $("#fechaAccidente").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idFechaNotificacion").datetimepicker({lan:'es', format:'d/m/Y H:i',  timepicker:true, closeOnDateSelect:false, step:15});
    $("#idFechaNotificacion").val(convertirAfechaString(new Date(), true, false));
    $("#select_E").change(cargarCombosDepedientes);
	$("#idEventoManual").change(ingresarCodEventoManual)
	$("#idCodEvento").prop("maxlength", 11);
	$("#btnBuscarComisaria").click(buscarComisaria)
	$("#btnBuscarComisaria").css("cursor", "pointer");
	$("#btnBuscarNosocomio").click(function(){
		buscarNosocomio("", false, function(id){
			$("#idNosocomio").select2();
			var cmbNosocomio = $("#idNosocomio").data("select2");
			cmbNosocomio.open();
		})
	});
	$("#btnBuscarNosocomio").css("cursor", "pointer");
    switch(accion){
		case 'N': // Nuevo evento
			cargarTipoAccidentes(function(){
                //cargarNosocomios(function(){
                   //cargarComisarias(function(){
                       $("#btnValidarPoliza").click(validarPoliza);
                       cargarGrillaAgraviadoInicial();
                       $("#idEventoManual").change();
					   // Cargar distritos
                       DAO.consultarWebServiceGet("getAllDistritos", "", function(data){
                           arrayDistritos=data; // Guarda los distritos
                           DAO.consultarWebServiceGet("getAllProvincias", "", function(datos){
                               arrayProvincias=datos;
                               DAO.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
                                   arrayDepartamentos=depas;
                                   cargarComboDistritos();
                                   $("#select_E").change(function(){
                                       cargarProvinciasDep("E", idProvinciaSelect);
                                   })
                                   $("#btnCambiarProv").click(function(){
                                       cargarProvinciasDep("E", idProvinciaSelect, "button");
                                   });
                                   $("#select_E").select2();
                                   parent.$(".fancybox-close").unbind("click");
                                   parent.$(".fancybox-close").click(validarCambiosEfectuados);
                                   $.fancybox.close();
                               })
                           })
                       });
                   //});
                //});
            });
			break;
		case 'E': // Editar evento
			$("#idEventoManual").prop("disabled", true);// Desactiva el ingreso de codigo de evento manual
            arrayInfoEvento = parent.window.frames[0].arrayDatos[parent.window.frames[0].filaSeleccionada];
            cargarTipoAccidentes(function(){
                //cargarNosocomios(function(){
                    //cargarComisarias(function(){
                        DAO.consultarWebServiceGet("getAllDistritos", "", function(data){
                            arrayDistritos=data; // Guarda los distritos
                            DAO.consultarWebServiceGet("getAllProvincias", "", function(datos){
                                arrayProvincias=datos;
                                DAO.consultarWebServiceGet("getAllDepartamentos", "", function(depas){
                                    arrayDepartamentos=depas;
                                    cargarInfoEvento();
                                    parent.$(".fancybox-close").unbind("click");
                                    parent.$(".fancybox-close").click(validarCambiosEfectuados);
                                    $.fancybox.close();
                                })
                            })
                        });
                    //});
                //});
            });
			break;
	}
});
function cargarCombosDepedientes(callback){ // Carga la lista de combobox de nosocomios y comisarias segun el distrito que se haya seleccionado
    try{
        if($("#select_E").val()!=""){
            var distrito = $("#select_E").val();
            var parametros = "&idDistrito="+distrito;
            DAO.consultarWebServiceGet("getListaNosocomios", parametros, function(data){
                agregarOpcionesToCombo("idNosocomio", data, {"keyId":"idNosocomio", "keyValue":"nombre"});
                $("#idNosocomio").select2();
				DAO.consultarWebServiceGet("getListaComisarias", parametros, function(datos){
                    agregarOpcionesToCombo("idComisaria", datos, {"keyId":"idComisaria", "keyValue":"nombre"});
                    $("#idComisaria").select2();
					if(typeof callback == "function"){
                        callback();
                    }else{
                        $.fancybox.close();
                    }
                })
            })
        }
    }catch(err){
        emitirErrorCatch(err, "cargarCombosDepedientes()");
    }
}
var idProvinciaSelect="";
function cargarComboDistritos(){
    try{
        switch (accion){
            case 'N':
                var idProvincia="P01";
                idProvinciaSelect = idProvincia;
                cargarDistritos("E", idProvincia);
                break;
            case 'E':
                var idProvincia="P01";
                var idDistrito = arrayInfoEvento.distritoAccidente;
                if(idDistrito!=null){
                    for(var i=0; i<arrayDistritos.length; i++){
                        if(arrayDistritos[i].idDistrito==idDistrito){
                            idProvincia=arrayDistritos[i].idProvincia;
                            break;
                        }
                    }
                }
                idProvinciaSelect = idProvincia;
                cargarDistritos("E", idProvincia);
                break;
        }
    }catch(err){
        emitirErrorCatch(err, "cargarComboDistritos()")
    }
}
function cargarProvinciasDep(prefijo, idProvincia, button){
    try{
        var item=$("#select_"+prefijo).val();
        if(item=='OTRP' || button=="button"){ //Otra Provincia
            idProvinciaSelect=idProvincia;
            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
                if(data!=undefined){
                    var idProvincia=data[0].provincia;
                    cargarDistritos(prefijo, idProvincia);
                }else{ // No se completo
                    $("select_"+prefijo).val("");
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarProvinciasDep");
    }
}
function cargarDistritos(prefijo, idProvincia){
    try{
        $("#select_"+prefijo).html("");
        $("#select_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayDistritos.length; i++){
            if(arrayDistritos[i].idProvincia==idProvincia){
                $("#select_"+prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
            }
        }
        $("#select_"+prefijo).append("<option value='OTRP'>Otra Provincia</option>"); // OTRP=Otra Provincia
        $("#select_"+prefijo).select2();
        var nombreProvincia = "";
        var nombreDepartamento = "";
        for(var y=0; y<arrayProvincias.length; y++){
            if(arrayProvincias[y].idProvincia==idProvincia){
                nombreProvincia=arrayProvincias[y].nombreProvincia;
                for(var z=0; z<arrayDepartamentos.length;z++){
                    if(arrayDepartamentos[z].idDepartamento==arrayProvincias[y].idDepartamento){
                        nombreDepartamento=arrayDepartamentos[z].nombreDepartamento;
                        break;
                    }
                }
                break;
            }
        }
        labelTextWebPlus("label_"+prefijo, "Dpto: "+nombreDepartamento+", Prov: "+nombreProvincia);
    }catch(err){
        emitirErrorCatch(err, "cargarDistritos")
    }
}
function cargarGrillaAgraviadoInicial(){
    try{
        $('#tabla_datos > tbody').html("<tr style='font-family: Arial; height: 20px; font-size:11px;'>" +
            "<td class='cod_agraviado' style='text-align:center;'><input type='text' style='width: 85px; font-size:12px;' maxlength='11'/></td>"+
			"<td style='text-align: center;'><input maxlength='8' class=''  type='text' style='width: 80px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 200px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 50px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 240px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><a onclick='borrar(this)' style='cursor: pointer; text-decoration: none; font-size:12px;'>Borrar</a> </td>"+
            "</tr>");
        dataTable=$('#tabla_datos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"170px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "NO SE ENCONTRARON REGISTROS",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "bSort": false,
            "columns": [
                { "width": "10%"  },
				{ "width": "10%"  },
                { "width": "30%" },
                { "width": "5%"  },
                { "width": "35%" },
                { "width": "10%" }
            ]
        });
    }catch(err){
        emitirErrorCatch(err, "cargarGrillaAgraviadoInicial")
    }
}
function cargarInfoEvento(){
    try{
        // Info CAT
        $("#nroCAT").val(arrayInfoEvento.polizaAccidente);
        $("#placa").val(arrayInfoEvento.placaAccidente);
        if(arrayInfoEvento.nroCAT!=null){
            switch (arrayInfoEvento.tipoPersona){
                case 'N':
                    $("#asociado").val(arrayInfoEvento.nombreAsociado);
                    break;
                case 'J':
                    $("#asociado").val(arrayInfoEvento.razonSocial);
                    break;
            }
            $("#placaBusqueda").val(arrayInfoEvento.placa);
            $("#marca").val(arrayInfoEvento.marca);
            $("#modelo").val(arrayInfoEvento.modelo);
            $("#vencPoliza").val(arrayInfoEvento.fechaCaducidad);
            $("#anno").val(arrayInfoEvento.anno)
            $("#btnValidarPoliza").val("Cambiar")
            $("#btnValidarPoliza").click(cambiarPoliza);
            $("#nroCAT").prop("disabled", true);
            $("#placa").prop("disabled", true);
        }else{
            $("#btnValidarPoliza").click(validarPoliza);
        }
        // Info Datos del Accidente
        $("#fechaAccidente").val(arrayInfoEvento.fechaAccidente);
        $("#idFechaNotificacion").val(arrayInfoEvento.fechaAviso);
        $("#idTipoAccidente").val(arrayInfoEvento.idTipoAccidente);
        $("#idNombreContacto").val(arrayInfoEvento.nombreContacto);
        $("#idTelefContacto").val(arrayInfoEvento.telefonoContacto);
        // Info Lugar del accidente
        cargarComboDistritos();
        if(arrayInfoEvento.distritoAccidente!=null){
            $("#select_E").val(arrayInfoEvento.distritoAccidente);
            $("#select_E").select2();
            cargarCombosDepedientes(function(){
                $("#idNosocomio").val(arrayInfoEvento.idNosocomio);
                $("#idNosocomio").select2();
				$("#idComisaria").val(arrayInfoEvento.idComisaria);
				$("#idComisaria").select2();
			});
        }
        $("#select_E").change(function(){
            cargarProvinciasDep("E", idProvinciaSelect);
        })
        $("#btnCambiarProv").click(function(){
            cargarProvinciasDep("E", idProvinciaSelect, "button");
        });
        $("#idLugarAccidente").val(arrayInfoEvento.lugarAccidente);
        $("#idReferencia").val(arrayInfoEvento.referenciaAccidente);

        // Info chofer
        $("#dniChofer").val(arrayInfoEvento.DNIChoferAccidente);
        $("#nombreChofer").val(arrayInfoEvento.choferAccidente);

        // Info agraviados
        var parametros = "&codEvento="+arrayInfoEvento.codEvento;
        DAO.consultarWebServiceGet("getAgraviados", parametros, cargarGrillaAgraviados);
    }catch(err){
        emitirErrorCatch(err, "cargarInfoEvento")
    }
}
function cargarGrillaAgraviados(data){
    try{
        for(var i=0; i<data.length; i++){
			data[i].html_codAgraviado = "<input class='codAgraviado' type='text' maxlength='11' style='width:85px; font-size:12px;' value='"+data[i].codAgraviado+"'/>"
            data[i].html_nombreAccidente = "<input type='text' style='width: 200px; font-size:12px;' value='"+data[i].nombreAccidente+"'>";
            data[i].html_edadAccidente = "<input type='text' style='width: 50px; font-size:12px;' value='"+data[i].edadAccidente+"'>";
            data[i].html_dniAccidente = "<input maxlength='8' class='"+data[i].codAgraviado+"' type='text' style='width: 80px; font-size:12px;' value='"+data[i].dniAccidente+"'>";
            data[i].html_diagnosticoAccidente = "<input type='text' style='width: 240px; font-size:12px;' value='"+data[i].diagnosticoAccidente+"'>";
            data[i].html_borrar= "<a onclick='borrar(this, "+'"'+data[i].codAgraviado+'"'+")' style='cursor: pointer; text-decoration: none; font-size:12px;'>Borrar</a>";
        }
        arrayInfoEvento.listaAgraviados=data;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'html_codAgraviado', alineacion:'center'},
			{campo:'html_dniAccidente', alineacion:'center'},
            {campo:'html_nombreAccidente', alineacion:'center'},
            {campo:'html_edadAccidente', alineacion:'center'},
            {campo:'html_diagnosticoAccidente', alineacion:'center'},
            {campo:'html_borrar', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", data, camposAmostrar, false, 11); // crea la tabla HTML
        var columns=[
            { "width": "10%"  },
			{ "width": "10%"  },
            { "width": "30%" },
            { "width": "5%"  },
            { "width": "35%" },
            { "width": "10%" }
        ];
		$(".codAgraviado").each(function(){
			$(this).parent().prop("class", "cod_agraviado");
		})
		$(".cod_agraviado").css("display", "none");
		
        dataTable=parseDataTable("tabla_datos", columns, 170, false, false, false, false);
        var vencimientoPoliza =false;
        if($("#vencPoliza").val()!=""){
            var fechaVencimiento = $("#vencPoliza").val().split("/");
            var DateVencimiento = new Date(fechaVencimiento[2], (parseInt(fechaVencimiento[1])-1), fechaVencimiento[0]);
            var hoy = new Date();
            if(hoy>DateVencimiento){
                vencimientoPoliza=true;
                fancyAlert("¡ El CAT ha caducado !");
            }
        }
        if(!vencimientoPoliza){
            $.fancybox.close();
        }
    }catch(err){
        emitirErrorCatch(err, "cargarGrillaAgraviados");
    }
}
function cargarTipoAccidentes(callback){
    try{
        DAO.consultarWebServiceGet("getListaTipoAccidentes", "", function(data){
            agregarOpcionesToCombo("idTipoAccidente", data, {"keyId":"idTipoAccidente", "keyValue":"descripcion"})
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarTipoAccidentes()")
    }
}
/*function cargarNosocomios(callback){
    try{
        DAO.consultarWebServiceGet("getListaNosocomios", "", function(data){
            agregarOpcionesToCombo("idNosocomio", data, {"keyId":"idNosocomio", "keyValue":"Nombre"})
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarNosocomios()");
    }
}
function cargarComisarias(callback){
    try{
        DAO.consultarWebServiceGet("getListaComisarias", "", function(data){
            agregarOpcionesToCombo("idComisaria", data, {"keyId":"idComisaria", "keyValue":"Nombre"})
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch(err){
        emitirErrorCatch(err, "cargarComisarias()")
    }
}*/
function validarPoliza(){ // Valida el certificado previa busqueda por medio del Nro de CAT y/o Placa
    try{
        var placa = $("#placa").val();
        var nroCAT = $("#nroCAT").val();
        var parametros = "&placa="+placa+
            "&nroCAT="+nroCAT;
        DAO.consultarWebServiceGet("buscarPoliza", parametros, function(data){
            if(data.length==0){
                fancyAlertFunction("No se encontro ningun certificado", function(rpta){
                    if(rpta){
                        $("#nroCAT").focus();
                    }
                })
            }else{
                // verifica fecha de vencimientom del cat
                var vencimientoPoliza =false;
                if(data[0].vencPoliza!=null || data[0].vencPoliza!=""){
                    var fechaVencimiento = data[0].vencPoliza.split("/");
                    var DateVencimiento = new Date(fechaVencimiento[2], (parseInt(fechaVencimiento[1])-1), fechaVencimiento[0]);
                    var hoy = new Date();
                    if(hoy>DateVencimiento){
                        vencimientoPoliza=true;
                        fancyAlert("¡ El CAT ha caducado !");
                    }
                }
                // carga la informacion de la poliza:
                $("#placa").val(data[0].placa);
                $("#nroCAT").val(data[0].nroCAT);
                switch (data[0].tipoPersona){
                    case 'N':
                        data[0].asociado=data[0].nombreAsociado;
                        break;
                    case 'J':
                        data[0].asociado=data[0].razonSocial;
                        break;
                }
                $("#asociado").val(data[0].asociado);
                $("#placaBusqueda").val(data[0].placa);
                $("#marca").val(data[0].marca);
                $("#modelo").val(data[0].modelo);
                $("#vencPoliza").val(data[0].vencPoliza);
                $("#anno").val(data[0].anno);
                // Bloquea el boton de "Validar" y le cambia de nombre a "Cambiar"
                $("#btnValidarPoliza").val("Cambiar");
                $("#btnValidarPoliza").unbind("click");
                $("#btnValidarPoliza").click(cambiarPoliza);
                $("#placa").prop("disabled", true);
                $("#nroCAT").prop("disabled", true);
                if(!vencimientoPoliza){
                    $.fancybox.close();
                }
            }
        })
    }catch(err){
        emitirErrorCatch(err, "validarPoliza");
    }
}
function cambiarPoliza(){ // vuelve a activar la validacion de poliza
    try{
        //Limpia los campos de la poliza y reincia los valores de busqueda
        $("#placa").val("");
        $("#nroCAT").val("");
        $("#asociado").val("");
        $("#placaBusqueda").val("");
        $("#marca").val("");
        $("#modelo").val("");
        $("#vencPoliza").val("");
        $("#anno").val("");
        $("#placa").prop("disabled", false);
        $("#nroCAT").prop("disabled", false);
        $("#btnValidarPoliza").unbind("click");
        $("#btnValidarPoliza").val("Validar");
        $("#btnValidarPoliza").click(validarPoliza)
    }catch(err){
        emitirErrorCatch(err, "cambiarPoliza()")
    }
}
function agregarAgraviado(){
    try{
		var styleDisplay="display:none;";
		var codAgraviadoInicial = "";		
		if($("#idEventoManual").prop("checked")){
			styleDisplay="display:block;";
			if($("#fechaAccidente").val()!=""){
				var fechaAccidente = ($("#fechaAccidente").val().split(" "))[0].split("/");
				var codAgraviadoInicial = "S"+fechaAccidente[2]+fechaAccidente[1]+"____";
			}
		}
        $("#tabla_datos > tbody").append("<tr style='font-family: Arial; height: 20px; font-size:11px;'>" +
            "<td class='cod_agraviado' style='text-align:center;"+styleDisplay+"'><input maxlength='11' type='text' style='width:85px; font-size:12px;' value='"+codAgraviadoInicial+"'/></td>"+
			"<td style='text-align: center;'><input maxlength='8' class='' type='text' style='width: 80px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 200px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 50px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><input type='text' style='width: 240px; font-size:12px;'/></td>"+
            "<td style='text-align: center;'><a onclick='borrar(this)' style='cursor: pointer; text-decoration: none; font-size:12px;'>Borrar</a> </td>"+
            "</tr>");
    }catch(err){
        emitirErrorCatch(err, "agregarAgraviado()")
    }
}
var agraviadosPostEliminacion=[];
function borrar(idCampo, codAgraviado){
    try{
        if(typeof  codAgraviado == 'string'){
            agraviadosPostEliminacion.push("'"+codAgraviado+"'");
        }
        $(idCampo).parent().parent().remove();
    }catch(err){
        emitirErrorCatch(err, "borrar")
    }
}
function guardarEvento(){
    try{		
        if(validarCamposRequeridos("idPanelPrincipal") && validarCamposRequeridos("idPanelAccidente") && validarCamposRequeridos("idPanelChofer")){
            if($("#tabla_datos >tbody >tr").length==0){
                fancyAlert("Debe registrar por lo menos un agraviado");
                return;
            }			
            var codEvento;
            var mensajeConfirm;
            var mensajeRpta;
            var funcionWebservice;
            switch (accion){
                case 'N':
					var codEventoManual="";
					if($("#idEventoManual").prop("checked")){
						codEventoManual = $("#idCodEvento").val();
						if(codEventoManual.split("").length<11){
							fancyAlertFunction("¡El Código de Evento debe contener 11 digitos!", function(){
								$("#idCodEvento").focus();
							})
							return;
						}
						if(codEventoManual.indexOf("_")>=0 || (codEventoManual.lastIndexOf("0000")==8)){
							fancyAlertFunction("¡Debe ingresar un Código de Evento apropiado!", function(){
								$("#idCodEvento").focus();
							})
							return;
						}
					}
                    codEvento=0;
                    mensajeConfirm="¿Registrar la información ingresada?";
                    mensajeRpta="¡Se guardó la información correctamente!";
                    funcionWebservice="registrarEvento";
                    break;
                case 'E':
                    codEvento=arrayInfoEvento.codEvento;
                    mensajeConfirm="¿Guardar los cambios efectuados?";
                    mensajeRpta="¡Se guardarón los cambios correctamente!";
                    funcionWebservice="actualizarEvento";
                    break;
            }
            fancyConfirm(mensajeConfirm, function(rpta){
                if(rpta){
                    var parametrosPOST={
                        codEvento:codEvento,
						codEventoManual:$("#idCodEvento").val(),
                        fechaAccidente:dateTimeFormat($("#fechaAccidente").val()),
                        idTipoAccidente:$("#idTipoAccidente").val(),
                        idNosocomio:$("#idNosocomio").val(),
                        idComisaria:$("#idComisaria").val(),
                        idDistritoAccidente:$("#select_E").val(),
                        lugarAccidente:$("#idLugarAccidente").val(),
                        referencia:$("#idReferencia").val(),
                        dniChofer: $("#dniChofer").val(),
                        nombreChofer: $("#nombreChofer").val(),
                        polizaAccidente:$("#nroCAT").val(),
                        placaAccidente:$("#placa").val(),
                        nombreContacto:$("#idNombreContacto").val(),
                        telfContacto:$("#idTelefContacto").val(),
                        fechaNotificacion:dateTimeFormat($("#idFechaNotificacion").val())
                    }
                    var arrayAgraviados = [];
                    var continuar=true;
                    // Obtiene el resultados de los agraviados
                    $("#tabla_datos > tbody >tr").each(function(){
                        var codAgraviadoInput = $($(this).find("td").eq(0).find("input")).val();
						var codAgraviado = $(this).find("td").eq(1).find("input").attr("class");
                        var dniAgraviado = $($(this).find("td").eq(1).find("input")).val();
                        var nombreAgraviado = $($(this).find("td").eq(2).find("input")).val();
                        var edadAgraviado = $($(this).find("td").eq(3).find("input")).val();
                        var diagnosticoAgraviado = $($(this).find("td").eq(4).find("input")).val();
                        
						if($("#idEventoManual").prop("checked")){ // si el codigo es manual
							if(codAgraviadoInput.split("").length<11){
								celda=$(this).find("td").eq(0).find("input");
								fancyAlertFunction("¡El código del agraviado debe tener 11 digitos!", function(rpta){
									if(rpta){
										$(celda).focus();
									}
								});
								continuar=false;
								return false;
							}
							if(codAgraviadoInput.indexOf("_")>=0){
								celda=$(this).find("td").eq(0).find("input");
								fancyAlertFunction("¡Debe ingresar el código del agraviado correctamente!", function(rpta){
									if(rpta){
										$(celda).focus();
									}
								});
								continuar=false;
								return false;
							}
						}
						
						if(nombreAgraviado==""){
                            celda=$(this).find("td").eq(2).find("input");
                            fancyAlertFunction("Debe ingresar el nombre del agraviado", function(rpta){
                                if(rpta){
                                    $(celda).focus();
                                }
                            });
                            continuar=false;
                            return false;
                        }
                        arrayAgraviados.push({
							codAgraviadoInput:codAgraviadoInput,
                            codAgraviado:codAgraviado,
                            dniAgraviado:dniAgraviado,
                            nombreAgraviado:nombreAgraviado,
                            edadAgraviado:edadAgraviado,
                            diagnosticoAgraviado:diagnosticoAgraviado
                        })
                    });
                    if(continuar){
                        parametrosPOST.listaAgraviados=arrayAgraviados;
                        DAO.consultarWebServicePOST(parametrosPOST, funcionWebservice, function(data){
                            if(data.length>0){
								if(data[0]==false){
									if(data[1]=="Evento"){
										fancyAlertFunction("¡El codigo de Evento: "+$("#idCodEvento").val()+" ya existe!",  function(){
											$("#idCodEvento").focus();
										})
									}else{
										fancyAlert("¡Los códigos de agraviados ("+data[1]+") ya existen!")
									}									
								}else{
									if(data[0]>0){
										fancyAlertFunction(mensajeRpta, function(rpta){
											// Post Eliminacion:
											if(agraviadosPostEliminacion.length>0){
												eliminacionPost();
											}
											rptaCallback=[data[0]];
											realizoTarea=true;
											parent.$.fancybox.close();
										});									
									}else{
										fancyAlert("No se pudo actualizar/registrar el evento");
									}									
								}                                
                            }else{
                                fancyAlert("No se pudo actualizar/registrar el evento");
                            }
                        })
                    }
                }
            });
        }
    }catch(err){
     emitirErrorCatch(err, "guardarEvento()");
    }
}
var celda;
function eliminacionPost(){ // Elimina desde la BD, los agraviados eliminados en la grilla.
    try{
        var parametros = "&codAgraviados="+agraviadosPostEliminacion;
        DAO.consultarWebServiceGet("eliminarAgraviados", parametros, function(){},false);
    }catch(err){
        emitirErrorCatch(err, "eliminacionPost()")
    }
}
function validarCambiosEfectuados(){ // Valida si se ha efectuado cambios en la informacion del evento , o en el caso de ser un evento nuevo; si es que se ingresado al menos un dato
    try{
        var advertirSalida = false;
        switch (accion){
            case 'N': // Registro de un nuevo evento
                $('input, select').each(function(){
                    var campo=$(this).attr("campo");
                    if(campo!=undefined && campo!=""){
                        if($(this).val()!=""){
                            advertirSalida=true;
                            return;
                        }
                    }
                });
                if(!advertirSalida){
                    $("#tabla_datos > tbody >tr").each(function() {
                        var dniAgraviado = $($(this).find("td").eq(0).find("input")).val();
                        var nombreAgraviado = $($(this).find("td").eq(1).find("input")).val();
                        var edadAgraviado = $($(this).find("td").eq(2).find("input")).val();
                        var diagnosticoAgraviado = $($(this).find("td").eq(3).find("input")).val();
                        if(dniAgraviado!=""){
                            advertirSalida=true;
                            return;
                        }
                        if(nombreAgraviado!=""){
                            advertirSalida=true;
                            return;
                        }
                        if(edadAgraviado!=""){
                            advertirSalida=true;
                            return;
                        }
                        if(diagnosticoAgraviado!=""){
                            advertirSalida=true;
                            return;
                        }
                    });
                }
                if(advertirSalida){
                    fancyConfirm("¿Desea salir sin guardar la información?", function(rpta){
                        if(rpta){
                            parent.$.fancybox.close(); // cierra la ventana
                        }
                    })
                }else{
                    parent.$.fancybox.close();
                }
                break;
            case 'E': // edicion de un evento
                $('input, select').each(function(){
                    var campo=$(this).attr("campo");
                    if(campo!=undefined && campo!=""){
                        if($(this).val().toLowerCase()!=(arrayInfoEvento[campo].toString()).toLowerCase()){
                            advertirSalida=true;
                            return;
                        }
                    }
                });
                if(!advertirSalida){ // Valida si hay cambios en los agraviados si no se encontraron cambios en la validacion anterior.
                    // Primero valida por la cantidad de nuevos agraviados
                    var cantidadAgraviadosAnterior = arrayInfoEvento.listaAgraviados.length;
                    var listaAgraviadosActual = $("#tabla_datos > tbody > tr").length;
                    if(cantidadAgraviadosAnterior!=listaAgraviadosActual){
                        advertirSalida=true;
                    }else{
                        // verifica si hay cambios en los datos de agraviados:
                        for(var y=0; y<arrayInfoEvento.listaAgraviados.length; y++){
                            // datos de la grilla
                            var TR_agraviado = $("#tabla_datos > tbody >tr")[y];
                            var codAgraviado_TR = $(TR_agraviado).find("td").eq(1).find("input").attr("class");
                            var dniAgraviado_TR = $($(TR_agraviado).find("td").eq(1).find("input")).val();
                            var nombreAgraviado_TR = $($(TR_agraviado).find("td").eq(2).find("input")).val();
                            var edadAgraviado_TR = $($(TR_agraviado).find("td").eq(3).find("input")).val();
                            var diagnosticoAgraviado_TR = $($(TR_agraviado).find("td").eq(4).find("input")).val();

                            // datos en memoria array:
                            var codAgraviado = arrayInfoEvento.listaAgraviados[y].codAgraviado;
                            var dniAgraviado = arrayInfoEvento.listaAgraviados[y].dniAccidente;
                            var nombreAgraviado = arrayInfoEvento.listaAgraviados[y].nombreAccidente;
                            var edadAgraviado = arrayInfoEvento.listaAgraviados[y].edadAccidente;
                            var diagnosticoAgraviado = arrayInfoEvento.listaAgraviados[y].diagnosticoAccidente;

                            if(codAgraviado_TR!=codAgraviado){
                                advertirSalida=true;
                                break;
                            }
                            if(dniAgraviado_TR.toLowerCase()!=dniAgraviado.toLowerCase()){
                                advertirSalida=true;
                                break;
                            }
                            if(nombreAgraviado_TR.toLowerCase()!=nombreAgraviado.toLowerCase()){
                                advertirSalida=true;
                                break;
                            }
                            if(edadAgraviado_TR.toLowerCase()!=edadAgraviado.toLowerCase()){
                                advertirSalida=true;
                                break;
                            }
                            if(diagnosticoAgraviado_TR.toLowerCase()!=diagnosticoAgraviado.toLowerCase()){
                                advertirSalida=true;
                                break;
                            }
                        }
                    }
                }
                if(advertirSalida){
                    fancyConfirm("¿Desea salir sin guardar los cambios?", function(rpta){
                        if(rpta){
                            parent.$.fancybox.close(); // cierra la ventana
                        }
                    })
                }else{
                    parent.$.fancybox.close();
                }
                break;
        }
    }catch(err){
        emitirErrorCatch(err, "validarCambiosEfectuados()")
    }
}
function ingresarCodEventoManual(){
	try{		
		var codigoManual = $("#idEventoManual").prop("checked");
		if(codigoManual){
			$("#idCodEvento").prop("disabled", false);
			$("#idCodEvento").val("");
			$(".cod_agraviado").css("display", "block");
			$($(".cod_agraviado").find("input")).val("");
			if($("#fechaAccidente").val()!=""){
				var fechaAccidente = ($("#fechaAccidente").val().split(" "))[0].split("/");
				var codEventoManual = "E"+fechaAccidente[2]+fechaAccidente[1]+"____";
				$("#idCodEvento").val(codEventoManual);
				$($(".cod_agraviado").find("input")).val(codEventoManual.replace("E", "S"));
			}
			$("#idCodEvento").focus();
		}else{ // Automatico
			$("#idCodEvento").prop("disabled", true);
			$("#idCodEvento").val("");
			$(".cod_agraviado").css("display", "none");
			$($(".cod_agraviado").find("input")).val("");
		}
		
	}catch(err){
		emitirErrorCatch(err, "ingresarCodEventoManual");
	}
}
function buscarComisaria(){
    try{
        if($("#comisariaBuscar").val()!=""){
            var parametros = "&comisaria="+$("#comisariaBuscar").val();
            DAO.consultarWebServiceGet("getComisariaByNombre", parametros, function(data){
                agregarOpcionesToCombo("idComisaria", data, {"keyId":"idComisaria", "keyValue":"nombre"});                
                $.fancybox.close();				
				$("#idComisaria").select2();
				var cmbComisaria = $("#idComisaria").data("select2");
				cmbComisaria.open();
            });
        }else{
            fancyAlertFunction("¡Debe ingresar la comisaria a buscar!", function(rpta){
                if(rpta){
                    $("#comisariaBuscar").focus();
                }
            })
        }
    }catch(err){
        emitirErrorCatch(err, "abrirBusquedaComisaria()");
    }
}