/*
Ingreso/edicion de una cuota de contrato pagada
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var realizoCambio=false, cargaInicial=true;
var midEmpresaTransp= 0, midContratoRenovacion= 0, mnroCuota= 0, midContrato= 0,mnombreCorto='',mtotal=0;  //valores originales
var estadoRegistro="O";
var listaTRenovaciones = [],listaTEmpresas = [];
cargarInicio(function(){
	/* CAMPO REQUERIDOS EN EL FORMULARIO */
    $("#cmbEmpresas").attr("requerido", "EmpresaTransp");
	$("#cmbContratoCuota").attr("requerido", "Nro Contrato/Nro Cuota");
	/*************************************/
	$("#btnGuardar").click(guardarDetalle);
    $("#cmbEmpresas").change(cargarRenovacionesEmpresa);
    $("#cmbContratoCuota").change(cargarRenovacion);

    //busca todos las Empresas de Transporte
	var parametros = "";
	DAO.consultarWebServiceGet("getEmpresasTransp",parametros, function(results1){
		var campos = {"keyId":'idEmpresaTransp', "keyValue":'nombreEmpresa'}
		agregarOpcionesToCombo("cmbEmpresas", results1, campos);
        listaTEmpresas = results1; //incluye idEmpresaTransp, nombreCorto, nombreEmpresa
		$("#cmbEmpresas").select2();
        if(accion=='N'){
        // Nuevo registro de detalle

        }else{ // Editar
            var arrayDetalles = parent.arrayDatosContr;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    estadoRegistro=arrayDetalles[i].estado;
                    midEmpresaTransp=arrayDetalles[i].idEmpresaTransp; //variables seleccionadas anteriormente
                    midContratoRenovacion=arrayDetalles[i].idContratoRenovacion;
                    $("#cmbEmpresas").val(midEmpresaTransp);
                    $("#cmbEmpresas").select2();
                    $("#cmbEmpresas").change(); //recupera todas las renovaciones de contratos para esta empresa
                    break;
                }
            }
        }
        parent.$(".fancybox-close").unbind("click");
        parent.$(".fancybox-close").click(avisarCambiosEfectuados1);
        $.fancybox.close();
	});
})
function avisarCambiosEfectuados1(){
    try{
        if(realizoCambio){
            fancyConfirm("¿Desea salir sin guardar los cambios?", function(rpta){
                if(rpta){
                    parent.$.fancybox.close(); // cierra la ventana
                }
            })
        }else{
            parent.$.fancybox.close();
        }
    }catch(err){
        emitirErrorCatch(err, "avisarCambiosEfectuados1()")
    }
}
//Carga las renovaciones Pendientes de DEPOSITO/PAGO para un concesionario

function cargarRenovacionesEmpresa(){
    try{
        midEmpresaTransp = $("#cmbEmpresas").val();
        if(midEmpresaTransp!=null && midEmpresaTransp!="" && midEmpresaTransp!=undefined){
            $("#txtFechaContrato").val("");
            $("#txtNroCuotas").val("");
            $("#txtFlota").val("");
            $("#txtFechaVigenciaIni").val("");
            $("#txtFechaVigenciaFin").val("");
            $("#txtValorCuota").val("");
            if (!cargaInicial){realizoCambio=true;} //No se considera en la carga de datos inicial
            //busca todas las renovaciones  NO DEPOSITADAS de la Empresa Transp
            var parametros = "&idEmpresaTransp="+midEmpresaTransp;
            DAO.consultarWebServiceGet("getRenovacionesxEmpresaTransp",parametros, function(results) {
                var campos = {"keyId": 'idContratoRenovacion', "keyValue": 'contratoCuota'};
                agregarOpcionesToCombo("cmbContratoCuota", results, campos);
                listaTRenovaciones=results; //guarda lista general
                $("#cmbContratoCuota").select2();
                if (accion !='N' && cargaInicial){ //modo de Edicion => usa valor cargado previamente
                    $("#cmbContratoCuota").val(midContratoRenovacion);
                    $("#cmbContratoCuota").select2();
                    $("#cmbContratoCuota").change();  //actualiza datos de la renovacion
                }
                cargaInicial=false; //fin de carga inicial
                $.fancybox.close();
            });
        }else{
            fancyAlertFunction("¡Debe seleccionar una Empresa de Transportes!", function(){
                $("#cmbEmpresas").focus();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarRenovacionesEmpresa");
    }
}
function cargarRenovacion(){
    try{
        midContratoRenovacion = $("#cmbContratoCuota").val();
        if(midContratoRenovacion!=null && midContratoRenovacion!="" && midContratoRenovacion!=undefined){
            if (!cargaInicial){realizoCambio=true;} //No se considera en la carga de datos inicial
            $("#txtFechaContrato").val("");
            $("#txtNroCuotas").val("");
            $("#txtFlota").val("");
            $("#txtFechaVigenciaIni").val("");
            $("#txtFechaVigenciaFin").val("");
            $("#txtValorCuota").val("");
            for(var i=0; i<listaTRenovaciones.length; i++){
                if(listaTRenovaciones[i].idContratoRenovacion == midContratoRenovacion){
                    //mostrar datos de la renovacion encontrada
                    $("#txtFechaContrato").val(listaTRenovaciones[i].fechaVigenciaContr);
                    $("#txtNroCuotas").val(listaTRenovaciones[i].nCuotas);
                    $("#txtFlota").val(listaTRenovaciones[i].flotaActual);
                    $("#txtFechaVigenciaIni").val(listaTRenovaciones[i].fechaRenovacion);
                    $("#txtFechaVigenciaFin").val(listaTRenovaciones[i].fechaVigenciaFin);
                    $("#txtValorCuota").val(listaTRenovaciones[i].totalCuotaSoles);
                    mnroCuota=listaTRenovaciones[i].nroCuota;
                    midContrato=listaTRenovaciones[i].idContrato;
                    mtotal =listaTRenovaciones[i].totalCuota;
                    break;
                }
            }
        }else{
            fancyAlertFunction("¡Debe seleccionar una renovacion, primero!", function(){
                $("#cmbContratoCuota").focus();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarRenovacion");
    }
}

function validarRENS_noRepetidos(){
	try{
		var midContratoRenovacion = $("#cmbContratoCuota").val();
		var arrayDetalle = parent.arrayDatosContr;
		for(var i=0; i<arrayDetalle.length; i++){
			if(arrayDetalle[i].idDetalle!=idDetalle){
				if(arrayDetalle[i].idContratoRenovacion == midContratoRenovacion){
					fancyAlert("¡La Renovacion Nro. "+arrayDetalle[i].nroCuota+" ya se ha usado !!");
					return false;
				}
			}
		}		
		return true;
	}catch(err){
		emitirErrorCatch(err, "validarRENS_noRepetidos");
	}
}
function guardarDetalle(){
	try{
        if (realizoCambio){
            if(validarCamposRequeridos("idForm")){
                if(validarRENS_noRepetidos()){
                    var estadoFinal = 'N';
                    if (accion!='N'){//En modo edicion
                        if (estadoRegistro =='N'){estadoFinal='N'}
                        else {estadoFinal='U'}
                    }
                    /*
                     {campo:'idContrato'         , alineacion:'left',LPAD:true   },
                     {campo:'fechaContr'         , alineacion:'left'             },
                     {campo:'nombreEmpresa'      , alineacion:'left'             },
                     {campo:'nCuotas'            , alineacion:'left'             },
                     {campo:'nroCuota'           , alineacion:'left'             },
                     {campo:'vigenciaCertIni'   , alineacion:'left'             },
                     {campo:'vigenciaCertFin'   , alineacion:'left'             },
                     {campo:'totalSoles'         , alineacion:'left'             }
                     */
                    for(i=0;i<listaTEmpresas.length;i++){
                        if(listaTEmpresas[i].idEmpresaTransp == midEmpresaTransp){
                            mnombreCorto=listaTEmpresas[i].nombreCorto;
                            break;
                        }
                    }
                    var registro = {
                        idDetalle : idDetalle,
                        idEmpresaTransp : midEmpresaTransp,
                        idContratoRenovacion : midContratoRenovacion,
                        idContrato : midContrato,
                        nroCuota : mnroCuota,
                        fechaContr:$("#txtFechaContrato").val(),
                        nombreEmpresa:mnombreCorto,
                        nCuotas: $("#txtNroCuotas").val(),
                        vigenciaCertIni: $("#txtFechaVigenciaIni").val(),
                        vigenciaCertFin: $("#txtFechaVigenciaFin").val(),
                        total:mtotal,
                        totalSoles:$("#txtValorCuota").val(),
                        estado: estadoFinal     //New or Update para el registro actual
                    };
                    realizoTarea=true;      //devuelve dato en variable global (:MHBSoftScripts.js
                    rptaCallback = [registro];
                }
            }
        }
        parent.$.fancybox.close(); //solo sale
	}catch(err){
		emitirErrorCatch(err, "guardarDetalle")
	}
}