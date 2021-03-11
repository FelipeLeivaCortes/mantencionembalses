function initRecords(){
    var idCompany   = "empresa" + sessionStorage.getItem('ID_COMPANY');

    $.post("backend/getPendingRecords.php", "idCompany=" + idCompany, function(DATA){
        if( DATA.ERROR ){
            setTimeout(function(){
                CloseSpinner();
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            }, 500);

        }else{
            console.log(DATA);
            var table, divTable, tableId, divId;
            
            tableId     = "pendingRecordTable";
            divId       = "pendingRecordContainer";

            divTable    = document.createElement("div");
            divTable.setAttribute("class", "table-modal table-reponsive-xl");
            divTable.setAttribute("id", divId);
    
            table       = document.createElement("table");
            table.setAttribute("class", "table table-striped");
            table.setAttribute("id", tableId);
    
            var thead                   = document.createElement("thead");

            var rowHead                 = document.createElement("tr");

            var indexHeadCell           = document.createElement("th");
            var idHeadCell              = document.createElement("th");
            var dateStartHeadCell       = document.createElement("th");
            var daysLateHeadCell        = document.createElement("th");

            indexHeadCell.setAttribute("scope", "col");
            idHeadCell.setAttribute("scope", "col");
            dateStartHeadCell.setAttribute("scope", "col3");
            daysLateHeadCell.setAttribute("scope", "col");

            var indexHead       = document.createTextNode("N°");
            var idHead          = document.createTextNode("N° Guía");
            var dateStartHead   = document.createTextNode("Fecha de Inicio");
            var daysLateHead    = document.createTextNode("Días de Atraso");

            indexHeadCell.appendChild(indexHead);
            idHeadCell.appendChild(idHead);
            dateStartHeadCell.appendChild(dateStartHead);
            daysLateHeadCell.appendChild(daysLateHead);

            rowHead.appendChild(indexHeadCell);
            rowHead.appendChild(idHeadCell);
            rowHead.appendChild(dateStartHeadCell);
            rowHead.appendChild(daysLateHeadCell);

            thead.appendChild(rowHead);
            table.appendChild(thead);
        
            var bodyTable   = document.createElement("tbody");

            // Create the rows
            for (var i=0; i<DATA.COUNT; i++){

                // Here is created every row
                var row             = document.createElement("tr");

                // Here is created every cell
                var indexCell	    = document.createElement("td");
                var idCell          = document.createElement("td");
                var dateStartCell   = document.createElement("td");
                var daysLateCell    = document.createElement("td");
                
                // Here is storaged the content into a node
                var index           = document.createTextNode( i + 1 );
                var id              = document.createElement( "a" );
                var link            = document.createTextNode( DATA[i].id );
                var dateStart       = document.createTextNode( FormatDate( DATA[i].dateStart ) );
                var daysLate        = document.createTextNode( DATA[i].daysLate );
                
                // Setting the cells to show the details
                id.appendChild(link);
                id.href     = "javascript:getRecord(" + DATA[i].id + ")";

                // Here is inserted the content into the cells
                indexCell.appendChild(index);
                idCell.appendChild(id);
                dateStartCell.appendChild(dateStart);
                daysLateCell.appendChild(daysLate);

                // Here is inserted the cells into a row
                row.appendChild(indexCell);
                row.appendChild(idCell);
                row.appendChild(dateStartCell);
                row.appendChild(daysLateCell);
                
                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }

            // Here is inserted the body´s table into the table
            table.appendChild(bodyTable);
            divTable.appendChild(table);
            document.getElementById("body-container").appendChild(divTable);
                
            setTimeout(() => {
                CloseSpinner();
            }, 500);
        }
    });
}

function configureGettingRecord(idRecord){
    idRecord    = idRecord == -1 ?  document.getElementById("idRecord").value : idRecord;
    getRecord(idRecord);
}

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
