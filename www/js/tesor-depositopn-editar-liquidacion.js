var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var idLocal = $_GET("idLocal");
var realizoCambio=false, cargaInicial=true;
var midConcesionario= 0, midLiquidacion=0;  //valores originales
var estadoRegistro="O";
cargarInicio(function(){
	/* CAMPO REQUERIDOS EN EL FORMULARIO */
    $("#cmbConcesionarios").attr("requerido", "Concesionario");
	$("#cmbIDLiquidacion").attr("requerido", "Nro Liquidacion");
	/*************************************/
	$("#btnGuardar").click(guardarDetalle);
    $("#cmbConcesionarios").change(cargarLiquidacionesxConcesionario);
    $("#cmbLiquidaciones").change(cargarDatosLiquidacion);

    //busca todos los concesionarios asociados al Local/Sede/Cono
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getConcesionariosxLocal",parametros, function(results1){
		var campos = {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
		agregarOpcionesToCombo("cmbConcesionarios", results1, campos);
		$("#cmbConcesionarios").select2();
        if(accion=='N'){
        // Nuevo registro de detalle

        }else{ // Editar
            var arrayDetalles = parent.arrayDatosLiq;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    estadoRegistro=arrayDetalles[i].estado;
                    midConcesionario=arrayDetalles[i].idConcesionario; //variables seleccionadas anteriormente
                    midLiquidacion=arrayDetalles[i].idLiquidacion;
                    $("#cmbConcesionarios").val(midConcesionario);
                    $("#cmbConcesionarios").select2();
                    $("#cmbConcesionarios").change(); //recupera todas las liquidaciones de este concesionario
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
//Carga las liquidaciones Pendientes de DEPOSITO/PAGO para un concesionario
var listaTLiquidaciones = [];
var totalLiq=0.0;
function cargarLiquidacionesxConcesionario(){
    try{
        var idConcesionario = $("#cmbConcesionarios").val();
        if(idConcesionario!=null && idConcesionario!="" && idConcesionario!=undefined){
            if (!cargaInicial){realizoCambio=true;} //No se considera en la carga de datos inicial
            //busca todas las liquidaciones NO DEPOSITADAS del concesionario
            var parametros = "&idConcesionario="+idConcesionario;
            DAO.consultarWebServiceGet("getLiquidacionesxConcesionario",parametros, function(results) {
                var campos = {"keyId": 'idLiquidacion', "keyValue": 'descripcion'};
                var listaLiquidaciones=[];
                for(var i=0; i < results.length; i++){
                    var ndato=new Object;
                    ndato.idLiquidacion=results[i].idLiquidacion;
                    ndato.descripcion="("+results[i].idLiquidacion +") / "+results[i].fechaLiquidacion;
                    listaLiquidaciones.push(ndato);
                }
                agregarOpcionesToCombo("cmbLiquidaciones", listaLiquidaciones, campos);
                listaTLiquidaciones=results; //guarda lista general
                $("#cmbLiquidaciones").select2();
                if (accion !='N'){ //modo de Edicion => usa valor cargado previamente
                    //console.log("Modo de Edicion, idLiquidacion: "+midLiquidacion );
                    $("#cmbLiquidaciones").val(midLiquidacion);
                    $("#cmbLiquidaciones").select2();
                    $("#cmbLiquidaciones").change();  //actualiza datos de la liquidacion
                }
                cargaInicial=false; //fin de carga inicial
                $.fancybox.close();
            });
        }else{
            fancyAlertFunction("¡Debe seleccionar un concesionario!", function(){
                $("#cmbConcesionarios").focus();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarConcesionariosXcono");
    }
}
function cargarDatosLiquidacion(){
    try{
        var idLiquidacion = $("#cmbLiquidaciones").val();
        if(idLiquidacion!=null && idLiquidacion!="" && idLiquidacion!=undefined){
            if (!cargaInicial){realizoCambio=true;} //No se considera en la carga de datos inicial
            $("#txtNroPreImpreso").val("");
            $("#txtFechaLiq").val("");
            $("#txtPrecioLiq").val("");
            $("#txtComisionLiq").val("");
            $("#txtTotalLiq").val("");
            for(var i=0; i<listaTLiquidaciones.length; i++){
                if(listaTLiquidaciones[i].idLiquidacion == idLiquidacion){
                    //mostrar datos de la liquidacion encontrada
                    $("#txtNroPreImpreso").val(listaTLiquidaciones[i].nroLiquidacion);
                    $("#txtFechaLiq").val(listaTLiquidaciones[i].fechaLiquidacion);
                    $("#txtPrecioLiq").val("S/." +listaTLiquidaciones[i].precioTotal);
                    $("#txtComisionLiq").val("S/." +listaTLiquidaciones[i].comisionTotal);
                    totalLiq=parseInt(listaTLiquidaciones[i].precioTotal)-parseInt(listaTLiquidaciones[i].comisionTotal);
                    $("#txtTotalLiq").val("S/." + totalLiq);
                    break;
                }
            }
        }else{
            fancyAlertFunction("¡Debe seleccionar una liquidacion, primero!", function(){
                $("#cmbLiquidaciones").focus();
            });
        }
    }catch(err){
        emitirErrorCatch(err, "cargarDatosLiquidacion");
    }
}

function validarLIQS_noRepetidos(){
	try{
		var midLiquidacion = $("#cmbLiquidaciones").val();
		var arrayDetalle = parent.arrayDatosLiq;
		for(var i=0; i<arrayDetalle.length; i++){
			if(arrayDetalle[i].idDetalle!=idDetalle){
				if(arrayDetalle[i].idLiquidacion == midLiquidacion){
					fancyAlert("¡La Liquidacion Nro. "+arrayDetalle[i].idLiquidacion+" ya se ha ingresado !!");
					return false;
				}
			}
		}		
		return true;
	}catch(err){
		emitirErrorCatch(err, "validarLIQS_noRepetidos");
	}
}
function guardarDetalle(){
	try{
        if (realizoCambio){
            if(validarCamposRequeridos("idForm")){
                if(validarLIQS_noRepetidos()){
                    var estadoFinal = 'N';
                    if (accion!='N'){//En modo edicion
                        if (estadoRegistro =='N'){estadoFinal='N'}
                        else {estadoFinal='U'}
                    }
                    var registro = {
                        idDetalle : idDetalle,
                        idLiquidacion : $("#cmbLiquidaciones").val(),
                        fechaLiq:$("#txtFechaLiq").val(),
                        nroPreImpreso:$("#txtNroPreImpreso").val(),
                        nombreConcesionario:$("#cmbConcesionarios :selected").text(),
                        idConcesionario: $("#cmbConcesionarios").val(),
                        total:totalLiq,
                        totalSoles:"S/. "+totalLiq,
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