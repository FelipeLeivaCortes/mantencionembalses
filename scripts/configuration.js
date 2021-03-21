function initConfiguration(){
    EventToPressEnter("changePassword", "currentPassword");
    EventToPressEnter("changePassword", "newPassword");
    EventToPressEnter("changePassword", "confirmNewPassword");

    CloseSpinner();
}

function changePassword(){
    var oldPass         = document.getElementById("currentPassword").value;
    var newPass         = document.getElementById("newPassword").value;
    var confirmNewPass  = document.getElementById("confirmNewPassword").value;

    if(oldPass == ""){
        ModalReportEvent("Error", 21,"No se ha ingresado la contraseña actual");
        document.getElementById("currentPassword").focus();

    }else if(newPass == ""){
        ModalReportEvent("Error", 22,"No se ha ingresado la nueva contraseña");
        document.getElementById("newPassword").focus();
    
    }else if(newPass.length < 6){
        ModalReportEvent("Error", 36, "La contraseña tiene menos de 6 caractéres");
        document.getElementById("newPassword").focus();

    }else if(confirmNewPass == ""){
        ModalReportEvent("Error", 23,"No se ha ingresado la confirmación de la nueva contraseña");
        document.getElementById("confirmNewPass").focus();

    }else if( newPass != confirmNewPass ){
        ModalReportEvent("Error", 24,"La nueva contraseña ingresada no coincide con su confirmación");

        document.getElementById("newPassword").value        = "";
        document.getElementById("confirmNewPassword").value = "";
        document.getElementById("confirmNewPassword").focus();

    }else{
        var username    = sessionStorage.getItem("USERNAME");
        var Variables   = "username=" + username + "&oldPassword=" + oldPass + "&newPassword=" + newPass;
              
        $.post("backend/updatePassword.php", Variables, function(DATA){
           
	    if( DATA.ERROR  === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

            }else{
                ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
            }

            document.getElementById("currentPassword").value    = "";
            document.getElementById("newPassword").value        = "";
            document.getElementById("confirmNewPassword").value = "";
        });
    }
}
