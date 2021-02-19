function ManualsInit(){
    document.getElementById('documentUploaded').addEventListener('change', handleInputFile, false);   
}

function handleInputFile(){
    var delay = 2000;

    ShowSpinner(delay);

    //Reference the FileUpload element.
    var fileUpload = document.getElementById("documentUploaded");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.pdf)$/;

    if( regex.test(fileUpload.value.toLowerCase()) ){
            
        if( typeof(FileReader) != "undefined" ){
            var reader = new FileReader();

            //For Browsers other than IE.
            if(reader.readAsBinaryString){
                reader.onload = function (e) {
                    ProcessDocument(e.target.result);
                };
              
	        reader.readAsBinaryString(fileUpload.files[0]);

	        //For IE Browser.
            }else{
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                
                    ProcessDocument(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }

            document.getElementById("uploadDocumentBtn").disabled    = false;
            
        }else{
            ModalReportEvent("Error", 40, "Este navegador no soporta HTML5. Comuníquese con el administrador");
        }

    }else{
        ModalReportEvent("Error", 53, "El archivo ingresado no es tipo pdf");
        document.getElementById("documentUploaded").value    = "";
    }
}

function ProcessDocument(data){
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
         type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    sessionStorage.setItem("ACTIVITIES", JSON.stringify(excelRows));
};