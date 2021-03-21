
 window.onload  = StartupConfig;
 
function StartupConfig(){
FocusOn("uname");
FormatRut("uname");
FormatRut("recoveryUname");
EventToPressEnter("Validate", "");

document.getElementById("hash").setAttribute("style", "resize: none;");
}

function Validate(){

    var rut         = document.getElementById("uname").value;
    var status      = isValidRut(rut, "uname");

    if( status === true ){
        var rut         = document.getElementById("uname").value;
        var username    = ParseRut(rut);
        var password    = document.getElementById("psw").value;

        if( password === "" ){
            ModalReportEvent("Error", 13, "No se ha ingresado ninguna contraseña");
            document.getElementById("uname").style.borderColor = "white";
            document.getElementById("psw").style.borderColor = "red";
            document.getElementById("psw").focus();
            
        
        }else{
            var Variables   = "username="+username + "&password="+password;
            $.post("backend/login.php", Variables, function(DATA){
                var delay   = 100;
                
                setTimeout(function(){
                    if( DATA.ERROR === true ){
                        ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                        
                        switch(DATA.ERRNO){
                            // The password wrong
                            case 14:
                                document.getElementById("psw").focus();
                                document.getElementById("psw").value    = "";
                                document.getElementById("psw").style.borderColor = "red";
                                document.getElementById("uname").style.borderColor = "white";
                                break;

                            // The user is doesn´t registered
                            case 4:
                                document.getElementById("uname").value  = "";
                                document.getElementById("psw").value    = "";

                                document.getElementById("uname").focus();
                                document.getElementById("uname").style.borderColor = "red";
                                document.getElementById("psw").style.borderColor = "white";
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
                                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                                break;
                        }

                    }else{
                        sessionStorage.setItem("USERNAME", username);
                        sessionStorage.setItem("NAME", DATA.name);
                        sessionStorage.setItem("LASTNAME", DATA.lastname);
                        sessionStorage.setItem("PERMISSIONS", JSON.stringify(DATA.permissions));
                        sessionStorage.setItem("ID_COMPANY", JSON.stringify(DATA.idCompany));
                        
                        location.href   = "base.php";
                    }
                    
                }, delay);
                
            });
        }    
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
