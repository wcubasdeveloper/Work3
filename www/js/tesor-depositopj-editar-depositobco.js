//Detalle de un deposito bancario
//recuperar todas las cuentas usadas y permitir el ingreso o modificacion del deposito
var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var realizoCambio=false, cargaInicial=true;
var estadoRegistro="O";
cargarInicio(function(){
	/* CAMPO REQUERIDOS EN EL FORMULARIO */
    $("#cmbCuentaBancaria").attr("requerido", "Cuenta Bancaria");
	$("#txtFecha").attr("requerido", "Fecha Deposito");
    $("#txtFecha").datetimepicker({lan:'es', format:'d/m/Y',timepicker:false, closeOnDateSelect:true});
    $("#txtFecha").val(convertirAfechaString(new Date(), false)); // muestra la fecha actual en la caja de texto
    $("#txtNroVoucherBanco").attr("requerido", "Nro. Voucher Bancario");
    $("#txtMonto").attr("requerido", "Monto Deposito");
    //si se modifica algun dato...
    $("#cmbCuentaBancaria").change(cambioInformacion);
    $("#txtFecha").change(cambioInformacion);
    $("#txtNroVoucherBanco").change(cambioInformacion);
    $("#txtMonto").change(cambioInformacion);
    $("#cmbTipoDeposito").change(cambioInformacion);
	/*************************************/
	$("#btnGuardar").click(guardarDetalle);

    //busca todas las cuentas bancarias usadas x Autoseguro
	DAO.consultarWebServiceGet("getCuentasBancarias","", function(results){
		var campos = {"keyId":'idCuentaBancaria', "keyValue":'ctaBanco'}
		agregarOpcionesToCombo("cmbCuentaBancaria", results, campos);
		$("#cmbCuentaBancaria").select2();

        if(accion=='N'){
        // Nuevo deposito
        }else{ // Editar
            var arrayDetalles = parent.arrayDatosDep;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    estadoRegistro=arrayDetalles[i].estado;
                    $("#cmbTipoDeposito").val(arrayDetalles[i].tipoDeposito);
                    $("#cmbCuentaBancaria").val(arrayDetalles[i].idCuentaBancaria);
                    $("#cmbCuentaBancaria").select2();
                    $("#txtFecha").val(arrayDetalles[i].fechaDep);
                    $("#txtNroVoucherBanco").val(arrayDetalles[i].nroVoucher);
                    $("#txtMonto").val(arrayDetalles[i].monto);
                    break;
                }
            }
        }
        parent.$(".fancybox-close").unbind("click");
        parent.$(".fancybox-close").click(avisarCambiosEfectuados2);
        $.fancybox.close();
	});
})
function avisarCambiosEfectuados2(){
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
        emitirErrorCatch(err, "avisarCambiosEfectuados2()")
    }
}
function cambioInformacion(){
    realizoCambio = true;
}
var totalLiq=0.0;

function guardarDetalle(){
	try{
        if (realizoCambio) {
            if (validarCamposRequeridos("idForm")) { //id del DIV donde estan todos los campos
                var estadoFinal = 'N';
                if (accion!='N'){//En modo edicion
                    if (estadoRegistro =='N'){estadoFinal='N'}
                    else {estadoFinal='U'}
                }
                var registro = {
                    idDetalle: idDetalle,
                    tipoDeposito: $("#cmbTipoDeposito").val(),
                    idCuentaBancaria: $("#cmbCuentaBancaria").val(),
                    cuentaBanco: $("#cmbCuentaBancaria :selected").text(),
                    fechaDep: $("#txtFecha").val(),
                    nroVoucher: $("#txtNroVoucherBanco").val(),
                    monto: $("#txtMonto").val(),
                    montoSoles: "S/." + $("#txtMonto").val(),
                    estado: estadoFinal     //New or Update para el registro actual
                };
                realizoTarea = true;      //devuelve dato en variable global (:MHBSoftScripts.js
                rptaCallback = [registro];
            }
        }
        parent.$.fancybox.close(); //solo cierra la ventana y sale
	}catch(err){
		emitirErrorCatch(err, "guardarDetalle")
	}
}