function FormatSerial(id){
    var stringAux   = id.toString();
    var arrayAux    = stringAux.split("");
    var items       = arrayAux.length;
    
    switch(items){
        case 1:
            return '00000' + stringAux;
        case 2:
            return '0000' + stringAux;
        case 3:
            return '000' + stringAux;
        case 4:
            return '00' + stringAux;
        case 5:
            return '0' + stringAux;
        case 6:
            return stringAux;
        default:
            return 'OVERFLOW SERIALS';
    }

}

function validateRecord(id){

    var idCompany   = "empresa" + sessionStorage.getItem('ID_COMPANY');
    var Variables   = "idCompany=" + idCompany + "&id=" + id;

    $.post("backend/updateRecord.php", Variables, function(DATA){
        console.log(DATA);
        if(DATA.ERROR){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

        }else{
            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
        }

        $('#detailsRecordForm').modal('toggle');
        $('#pendingGuidesForm').modal('toggle');

        setTimeout(function(){
            getPendingRecords();
            $('#activities').empty();
            document.getElementById("user").value       = "";
            document.getElementById("dateStart").value  = "";
            document.getElementById("state").value      = "";
        }, 100);

    });
}

function deleteRecord(id){
    $('#rejectMaintanceForm').modal('toggle');
    
    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany + "&id=" + id;

    $.post("backend/deleteRecord.php", Variables, function(DATA){
        if(DATA.ERROR){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
        }else{
            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);

            var table           = document.getElementById("pendingTable");
            var index           = 0;

            for(var i=1; i<table.rows.length; i++){
                var targetId    = parseInt(table.rows[i].cells[1].textContent);

                if(targetId == id){
                    table.rows[i].remove();
                    index = i;
                }
            }

            for(var j=index; j<table.rows.length; j++){
                table.rows[j].cells[0].textContent = j;
            }

            $('#detailsRecordForm').modal('toggle');
        }
        
    });
}
