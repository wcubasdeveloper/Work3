var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini"; 
cargarInicio(function(){
	$("#btnGuardar").attr("id", "btnTerminar")
	$("#btnTerminar").click(terminarEvento);
})
function terminarEvento(){
	try{
        fancyConfirm("¿Confirma proceder con la operación?", function(rpta){
              if(rpta){
                  var codEvento = $_GET("codEvento");
                  var idUsuarioUpdate = $_GET("idUsuarioUpdate");
                  var motivo = $("#idMotivo").val();
                  var parametros = "&codEvento="+codEvento+"&idUsuarioUpdate="+idUsuarioUpdate+"&motivo="+motivo;
                  DAO.consultarWebServiceGet("terminarEvento", parametros, function(data){
                      if(data[0]>0){
                          realizoTarea=true;
                          rptaCallback=data;
                          parent.$.fancybox.close();
                      }else{
                          fancyAlert("¡Operación Fallida!")
                      }
                  })
              }
        })
	}catch(err){
		emitirErrorCatch(err, "terminarEvento");
	}
}