
window.onload  = StartupConfig;
 
let session;
let rut;

function StartupConfig(){
    FocusOn("uname");
    EventToChangeInput("newRut('uname')", "uname");
    EventToPressEnter("validateCredentials", "");
}



function validateCredentials(){
    let input2  = document.getElementById("psw").value;
    
    session     = new Session(rut.username, input2);

    if( session.isValid() ){
        data   = new FormData();
        data.append("username", session.username);
        data.append("password", session.password);

        $.ajax({
            url:            "backend/login.php",
            type:           "POST",
            data:           data,
            processData:    false,
            contentType:    false,
            error:          function(response){
                console.log(response);
            },
            success:        function(response){
                if( response.ERROR === true ){
                    ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                    
                    switch(response.ERRNO){
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
                            ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
                            break;
                    }

                }else{
                    sessionStorage.setItem("USERNAME", session.username);
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