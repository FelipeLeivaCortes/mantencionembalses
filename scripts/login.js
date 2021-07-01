let rut;
let password;

let idRut       = 'uname';
let idPassword  = 'psw';
let idRecovery  = "recoveryUname";

//********************************************************* */

window.onload  = function(){
    FocusOn(idRut);
    EventToChangeInput("newRut('" + idRut + "')", idRut);
    EventToChangeInput("newRut('" + idRecovery + "')", idRecovery);
    EventToPressEnter("validateCredentials", "");
};

function validateCredentials(){
    rut         = new Rut(document.getElementById(idRut).value, true);
    password    = document.getElementById(idPassword).value;
    
    if(password == ""){
        delete rut;

        ModalReportEvent("Error", 13, "No se ha ingresado ninguna contraseña");
        return;
    }

    if(rut.isValid(idRut)){
        data   = new FormData();
        data.append("username", rut.username);
        data.append("password", password);

        $.ajax({
            url:            "backend/login.php",
            type:           "POST",
            data:           data,
            processData:    false,
            contentType:    false,
            error:          (error)=>{console.log(error)},
            success:        (response)=>{
                if( response.ERROR === true ){
                    ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                    
                    switch(response.ERRNO){
                        // The password wrong
                        case 14:
                            document.getElementById(idPassword).focus();
                            document.getElementById(idPassword).value    = "";
                            document.getElementById(idPassword).style.borderColor = "red";
                            document.getElementById(idRut).style.borderColor = "white";
                            break;

                        // The user is doesn´t registered
                        case 4:
                            document.getElementById(idRut).value  = "";
                            document.getElementById(idPassword).value    = "";

                            document.getElementById(idRut).focus();
                            document.getElementById(idRut).style.borderColor = "red";
                            document.getElementById(idPassword).style.borderColor = "white";
                            break;
                        
                        // Licence expired
                        case 11 : case 38:
                            try{
                                document.getElementById("bodyModalReportEvent").children[1].remove();
                            }catch(e){
                                console.log(e);
                            }
                            
                            var link        = document.createElement("a");
                            link.innerHTML  = "Para renovar su licencia, haga click aquí"
                            link.setAttribute("style", "color: black;");
                            link.style.textDecoration   = "underline";
                            $(link).on( "click", function() {
                                $('#ModalReportEvent').modal('toggle');
                                $('#renovateLicenceModal').modal('show');

                                try{
                                    document.getElementById("bodyModalReportEvent").children[1].remove();
                                }catch(e){
                                    console.log(e);
                                }
                            });

                            document.getElementById("bodyModalReportEvent").appendChild(link);

                            break;
            
                        case 49:
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            break;
                    }

                }else{
                    sessionStorage.setItem("USERNAME", rut.username);
                    sessionStorage.setItem("NAME", response.name);
                    sessionStorage.setItem("LASTNAME", response.lastname);
                    sessionStorage.setItem("PERMISSIONS", JSON.stringify(response.permissions));
                    sessionStorage.setItem("ID_COMPANY", JSON.stringify(response.idCompany));
                    
                    location.href   = "base.php";
                }
            }
        });

    }
}

function ValidateLicence(){   
    var hash   = document.getElementById("hash").value;

    if(hash.length == 96){
        var rut         = document.getElementById("uname").value;
        var username    = ParseRut(rut);
        var Variables   = "username=" + username + "&hash=" + hash;

        $.post("backend/updateLicence.php", Variables, function(DATA){
            var delay = 1000;

            ShowSpinner(delay);
            setTimeout(function(){
                $('#renovateLicenceModal').modal("toggle");

                if(DATA.ERROR){
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);    
                    document.getElementById("hash").value = "";
                
                }else{
                   
                    ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                }
            }, delay);

        });

    }else{
        ModalReportEvent("Error", 38, "La licencia ingresada no es válida");
    }
}

function RecoveryPass(){
    rut = new Rut(document.getElementById(idRecovery).value, true);
    
    if(rut.isValid(idRecovery)){
        $("#recoveryPass").modal('toggle');

        ShowSpinner();

        let data    = new FormData();
        data.append("username", rut.username);
        
        $.ajax({
            type:           "POST",
            url:            "backend/recoveryPass.php",
            data:           data,
            contentType:    false,
            processData:    false,
            error:          (error)=>{console.log(error)},
            success:        (response)=>{
                setTimeout(()=>{
                    CloseSpinner();

                    if(response.ERROR){
                        ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                        
                    }else{
                        ModalReportEvent("Operación Exitosa", "", response.MESSAGE);
                    }
                }, delay);
            }
        });
    }
}