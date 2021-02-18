function ReportError(){
    var topic   = document.getElementById("topicMessage").value;
    var message = document.getElementById("bugMessage").value;

    if(topic == ""){
        ModalReportEvent("Error", 26, "No se ha ingresado el tema para la consulta");
    
    }else if(message == ""){
        ModalReportEvent("Error", 27, "No se ha ingresado ningúna consulta");
    
    }else{
        var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
        var Variables   = "idCompany=" + idCompany + "&topic=" + topic + "&message=" + message;

        $.post("backend/addReport.php", Variables, function(DATA){
            if( DATA.ERROR  === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

            }else{
                ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
            }

            //Deleting the data putted in the inputs
            document.getElementById("topicMessage").value   = "";
            document.getElementById("bugMessage").value     = "";
        });
    }
}