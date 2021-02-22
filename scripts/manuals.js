function ManualsInit(){
    var delay   = 2000;

    ShowSpinner(delay);

    setTimeout(function(){
        document.getElementById("btnUploadDocument").disabled   = true;
    }, delay - 1000);

    document.getElementById('documentToUpload').addEventListener('change', VerifyNameDocument, false);
    document.getElementById('formUploadDocument').addEventListener('submit', function(e){
        e.preventDefault();

        var delay   = 2000;
        ShowSpinner(delay);
        
        setTimeout(function(){
            
            var description = document.getElementById("descriptionDocument").value;
            var file        = document.getElementById("documentToUpload").value;

            if( file != "" ){
                if( description != "" ){
                    var formData    = new FormData(document.getElementById("formUploadDocument"));

                    formData.append('fileName', document.getElementById("documentToUpload").value.slice(12));
                    formData.append('ID_COMPANY', sessionStorage.getItem('ID_COMPANY'));
                    formData.append('description', description);
                    formData.append('username', sessionStorage.getItem('USERNAME'));

                    $.ajax({
                        url: "backend/uploadDocument.php",
                        type: "post",
                        dataType: "html",
                        data: formData,
                        cache: false,
                        contentType: false,
                        processData: false
                    })
                    .done(function(DATA){
                        DATA    = JSON.parse(DATA);

                        if( DATA.ERROR ){
                            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                        }else{
                            ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);

                            $('#uploadDocumentForm').modal('toggle');
                            document.getElementById('documentToUpload').value       = "";
                            document.getElementById("descriptionDocument").value   = "";
                        }
                    });

                }else{
                    ModalReportEvent("Error", 54, "No se ha agregado ninguna descripción al documento");
                }

            }else{
                ModalReportEvent("Error", 56, "No se ha seleccionado ningun documento");
            }
        }, delay);

    });

    getManuals();
}

function VerifyNameDocument(){

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("documentToUpload");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.pdf)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
        document.getElementById("btnUploadDocument").disabled   = false;
            
    }else{
        ModalReportEvent("Error", 53, "El archivo ingresado no es tipo pdf");
        document.getElementById("btnUploadDocument").disabled   = true;
        document.getElementById("documentToUpload").value       = "";
    }
}

function getManuals(){
    var idCompany   = 'empresa' + sessionStorage.getItem('ID_COMPANY');
    var Variables   = 'idCompany=' + idCompany;

    $.post("backend/getManuals.php", Variables, function(DATA){
        console.log(DATA);
        if( DATA.ERROR ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        }else{
            alert("Create a table with the contents");
        }
    });
}