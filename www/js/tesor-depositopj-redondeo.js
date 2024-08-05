/*
Ingreso de registro que servira para redondear el total a depositar
 */
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var realizoCambio=false, cargaInicial=true;
var miRedondeo= 0;  //valores originales
var estadoRegistro="O";
cargarInicio(function(){
	/* CAMPO REQUERIDOS EN EL FORMULARIO */
    $("#txtValorRedondeo").attr("requerido", "Monto redondeo");
	/*************************************/
	$("#btnGuardar").click(guardarMonto);

	var parametros = "";
        if(accion=='N'){
        // Nuevo registro de detalle

        }else{ // Editar
            var arrayDetalles = parent.arrayDatosContr;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    estadoRegistro=arrayDetalles[i].estado;
                    miRedondeo=arrayDetalles[i].total; //variables seleccionadas anteriormente
                    $("#txtValorRedondeo").val(miRedondeo);
                    break;
                }
            }
        }
        $.fancybox.close();
})

function guardarMonto(){
	try{
            if(validarCamposRequeridos("idForm")){
                if($("#txtValorRedondeo").val() != 0  ){
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
                    var registro = {
                        idDetalle : idDetalle,
                        idEmpresaTransp : 0,
                        idContratoRenovacion : 0,
                        idContrato : 0,
                        nroCuota : 0,
                        fechaContr:"",
                        nombreEmpresa:"",
                        nCuotas: 0,
                        vigenciaCertIni: "",
                        vigenciaCertFin: "",
                        total:$("#txtValorRedondeo").val(),
                        totalSoles:"S/."+$("#txtValorRedondeo").val(),
                        estado: estadoFinal     //New or Update para el registro actual
                    };
                    realizoTarea=true;      //devuelve dato en variable global (:MHBSoftScripts.js
                    rptaCallback = [registro];
                }
            }
        parent.$.fancybox.close(); //solo sale
	}catch(err){
		emitirErrorCatch(err, "guardarMonto")
	}
}