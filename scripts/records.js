function recordInit(){
    getPendingRecords();
}

function getPendingRecords(){

    ClearTable("pendingTable");

    var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany;

    $.post("backend/getPendingRecords.php", Variables, function(DATA){

        // Create the Table´s Body
        var table       = document.getElementById("pendingTable");
        var bodyTable   = document.createElement("tbody");
    
        // Create the rows
        for (var i = 0; i < DATA.count; i++){

            // Here is created every row
            var row             = document.createElement("tr");
    
            // Here is created every cell
            var countCell       = document.createElement("td");
            var numberGuideCell = document.createElement("td");
            var startDateCell   = document.createElement("td");

            // Here is storaged the content into a node
            var count           = document.createTextNode( i + 1 );
            var link            = document.createElement("a");
            var startDate       = document.createTextNode( DATA[i].startDate );

            // Setting the attributes to the link
            link.innerHTML      = FormatSerial(DATA[i].id);
            link.setAttribute("class", "MainNavText");
            link.setAttribute("href", "javascript:getRecord('" + FormatSerial(DATA[i].id) + "')");

            // Here is inserted the content into the cells
            countCell.appendChild(count);
            numberGuideCell.appendChild(link);
            startDateCell.appendChild(startDate);
     
            // Here is inserted the cells into a row
            row.appendChild(countCell);
            row.appendChild(numberGuideCell);
            row.appendChild(startDateCell);
            
            // Here is inserted the row into the table´s body
            bodyTable.appendChild(row);
        }
    
        // Here is inserted the body´s table into the table
        table.appendChild(bodyTable);
    });
}

function getRecord(parameter){
    var id;

    if(parameter == 0){
        id  = document.getElementById("numRecord").value;
    }else{
        id      = parseInt(parameter);
    }

    if(isValidIntegerNumber(id) != 0){
        var error   = false;

        if(parameter != 0){
            if(digits_count(parameter) == 6){
                id = parseInt(parameter);
            
            }else{
                ModalReportEvent("Error", 30, "El N° de registro ingresado tiene una cantidad de dígitos incorrecta");
                error   = true;
            }

        }
       
        if(!error){
            var idCompany   = "empresa" + sessionStorage.getItem("ID_COMPANY");
            var Variables   = "idCompany=" + idCompany + "&id=" + id;
            console.log(Variables);
            $.post("backend/getRecord.php", Variables, function(DATA){

                console.log(DATA);
                if(DATA.ERROR){
                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                    if(parameter == 0){
                        $('#maintancesForm').modal('toggle');
                    }

                }else{
                    if(parameter == 0){
                        $('#maintancesForm').modal('toggle');
                    }

                    document.getElementById("user").value       = DATA.name + " " + DATA.lastname;
                    document.getElementById("dateStart").value  = DATA.dateStart;
                    
                    $('#activities').empty();
                    var activitiesList;
                    var container   = document.getElementById("containerActivities");

                    try{
                        container.children[0].remove()
                    }catch(e){
                        console.log(e);
                    }

		    activitiesList  = document.createElement("select");
		    activitiesList.setAttribute("id", "activities");
		    activitiesList.setAttribute("class", "custom-select");

		    for(var i=0; i<DATA.activities.length; i++){
			var option  = document.createElement("option");
			option.text = DATA.activities[i];
			activitiesList.add(option);
		    }

		    container.appendChild(activitiesList);

                    // If the guide is approve, the person can do anything
                    if(DATA.state){
                        document.getElementById("state").value                      = "Aprobada";

                        document.getElementById("btn-approve").disabled             = true;
                        document.getElementById("btn-approve").style.display        = "none";

                        document.getElementById("btn-openDelete").disabled          = true;
                        document.getElementById("btn-openDelete").style.display     = "none";

                    }else{
                        document.getElementById("state").value                      = "Pendiente";

                        document.getElementById("btn-approve").disabled             = false;
                        document.getElementById("btn-approve").style.display        = "block";

                        document.getElementById("btn-openDelete").disabled          = false;
                        document.getElementById("btn-openDelete").style.display     = "block";

                        document.getElementById("btn-approve").setAttribute("onclick", "javascript:validateRecord(" + DATA.id + ")");
                        document.getElementById("btn-delete").setAttribute("onclick", "javascript:deleteRecord(" + DATA.id + ")");
                    }
                    
                    $('#detailsRecordForm').modal('show');
                }
                
                document.getElementById("numRecord").value = "";
            });
        }
    }
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
