
 function AdministrationInit(){
    
    $('#bttnCloseUpdateUser').click(function(){
        $('#SearchResultsForm').modal('toggle');
    });
     
//The arguments are: function, id
    EventToPressEnter("LoadUser", "searchUname");
    EventToPressEnter("SearchUser", "deleteUname");

    FormatRut("addUname");
    FormatRut("searchUname");
    FormatRut("deleteUname");

    GetListUsers();
    filterPermissions("Add", "change");
}

function GetListUsers(){
    
    ClearTable("ListUsers");
    var idCompany   = sessionStorage.getItem("ID_COMPANY");
    var Variables   = "idCompany=" + idCompany;

    $.post("backend/listUsers.php", Variables,function(DATA){

        if( DATA.ERROR === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            CloseModal("#ListUsersForm");
        
        }else{

            // Create the Table´s Body
            var table       = document.getElementById("ListUsers");
            var bodyTable   = document.createElement("tbody");
        
            // Create the rows
            for (var i = 0; i < DATA.count; i++){

                // Here is created every row
                var row             = document.createElement("tr");
        
                // Here is created every cell
                var numUserCell     = document.createElement("td");
                var usernameCell    = document.createElement("td");
                var typeCell	    = document.createElement("td");
                var nameCell	    = document.createElement("td");
                var lastnameCell    = document.createElement("td");
                var emailCell 		= document.createElement("td");
                var phoneCell		= document.createElement("td");
        
                // Here is storaged the content into a node
                var numUser         = document.createTextNode( i + 1 );
                var username		= document.createTextNode( GenerateRut(DATA[i].username) );
                
                // If you need to show more permissions, just delete the next line
                var type            = document.createTextNode( GeneratePermission(DATA[i].permissions) );
                
                var name 			= document.createTextNode( DATA[i].name );
                var lastname 		= document.createTextNode( DATA[i].lastname );
                var email 		    = document.createTextNode( DATA[i].email );
                var phone 			= document.createTextNode( DATA[i].phone );
            
                // Here is inserted the content into the cells
                numUserCell.appendChild(numUser);
                usernameCell.appendChild(username);
                //typeCell.appendChild( GeneratePermissionsList( DATA[i].permissions ) );
                typeCell.appendChild(type);
                nameCell.appendChild(name);
                lastnameCell.appendChild(lastname);
                emailCell.appendChild(email);
                phoneCell.appendChild(phone);
            
                // Here is inserted the cells into a row
                row.appendChild(numUserCell);
                row.appendChild(usernameCell);
                row.appendChild(typeCell);
                row.appendChild(nameCell);
                row.appendChild(lastnameCell);
                row.appendChild(emailCell);
                row.appendChild(phoneCell);
        
                // Here is inserted the row into the table´s body
                bodyTable.appendChild(row);
            }
	 
	  // Here is inserted the body´s table into the table
          table.appendChild(bodyTable);
          $('#ListUsersForm').modal('show');
	}
     });
}

/*
This function was designed to add any person to the platform.
Is mandatory complete the follow fields:
 * Name
 * Lastname
 * Email
The phone field is optional.
*/

function AddUser(){
    var rut     = document.getElementById("addUname").value;
    var status  = isValidRut(rut, "addUname");
    
    if( status === true ){
        var username    = ParseRut(rut);
        var name        = NormalizeString(document.getElementById("addName").value);
        status          = isValidName(name, "nombre");

        if( status === true ){
            var lastname    = NormalizeString(document.getElementById("addLastname").value);
            status          = isValidName(lastname, "apellido");

            if( status === true ){
                var email   = document.getElementById("addEmail").value;
                status      = isValidEmail(email);
                
                if( status === true ){
                    var phone       = document.getElementById("addPhone").value;
                    
                    if(phone != ""){
                        status = isValidPhoneNumber(phone, "addPhone");
                    }

                    if( status === true ){
                        var permissions   = areValidPermissions("add");

                        if( permissions != "0" ){

			    var idCompany 	= sessionStorage.getItem("ID_COMPANY");
                            var Variables   = "idCompany=" + idCompany + "&username=" + username + "&permissions=" + permissions + "&name=" + name + "&lastname=" + lastname + "&email=" + email + "&phone=" + phone;

                            $.post("backend/addUser.php", Variables, function(DATA){

                                if( DATA.ERROR  === true ){
                                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);

                                }else{
                                    ModalReportEvent("Operación exitosa", "", DATA.MESSAGE);
                                    CloseModal('#AddUserForm');
                                    GetListUsers();
                                }

                                $('#addUname').val('');
                                $('#addName').val('');
                                $('#addLastname').val('');
                                $('#addEmail').val('');
                                $('#addPhone').val('');
                                
                                $("#addAdministrator").prop("checked", false);
                                $("#addMechanic").prop("checked", false);
                                $("#addElectrician").prop("checked", false);
                                $("#addGardener").prop("checked", false);

                                var active = true;

                                document.getElementById("addAdministrator").disabled    = active;
                                document.getElementById("addMechanic").disabled         = active;
                                document.getElementById("addElectrician").disabled      = active;
                                document.getElementById("addGardener").disabled         = active;
                            });
                        }
                    }
                }
            }
        }
    }
}

function LoadUser(){
    var rut         = document.getElementById("searchUname").value;
    var status      = isValidRut(rut, "searchUname");
    
    if( status === true ){
        var username    = ParseRut(rut);
        var Variables   = "username=" + username;
        
        $.post("backend/loadUser.php", Variables, function(DATA){

            if( DATA.ERROR === true ){ 
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                $('#searchUname').val('');
            
            }else{
                $('#searchUname').val('');
                $('#usernamePrevious').val(rut);
                
                $('#usernamePrevious').attr('readonly', true);
                $('#usernamePrevious').attr('disabled', true);
                
                $('#resultName').val(DATA.nombre);
                $('#resultLastname').val(DATA.apellido);
                $('#resultEmail').val(DATA.correo);

		if(DATA.telefono == 0 ){
		   document.getElementById('resultPhone').value 	= "";
		}else{
                   $('#resultPhone').val(DATA.telefono);
                }

                var aux = DATA.permisos.split("");

                // We must assign the permissions associated to the uname.
                if(aux[0]==0){
                    document.getElementById("editAdministrator").disabled   = true;
                }else if(aux[0]==1){
                    document.getElementById("editAdministrator").checked    = true;
                }
                
                if(aux[1]==0){
                    document.getElementById("editMechanic").disabled        = true;
                }else if(aux[1]==1){
                    document.getElementById("editMechanic").checked         = true;
                }

                if(aux[2]==0){
                    document.getElementById("editElectrician").disabled     = true;
                }else if(aux[2]==1){
                    document.getElementById("editElectrician").checked      = true;
                }

                if(aux[3]==0){
                    document.getElementById("editGardener").disabled        = true;
                }else if(aux[3]==1){
                    document.getElementById("editGardener").checked         = true;
                }

                filterPermissions("Edit", "change");

                $('#SearchResultsForm').modal('show');
                
                sessionStorage.setItem("idUsername", DATA.id);
            }
        });
    }
}

function UpdateUser(){
    var id          = sessionStorage.getItem("idUsername");
    var rut         = document.getElementById("usernamePrevious").value;
    var status      = isValidRut(rut, "usernamePrevious");
    
    if( status === true ){
        var username    = ParseRut(rut);
        var permissions = areValidPermissions("edit");
        
        if( permissions != "0" ){
            
            var name        = NormalizeString(document.getElementById("resultName").value);
            status          = isValidName(name, "nombre");
            
            if( status === true ){
                var lastname    = NormalizeString(document.getElementById("resultLastname").value);
                status          = isValidName(lastname, "apellido");
                
                if( status  === true ){
                    var email   = document.getElementById("resultEmail").value;
                    status      = isValidEmail(email);
                    
                    if( status === true ){
                        
                        var phone       = document.getElementById("resultPhone").value;
    
                        if(phone != ""){
                            status = isValidPhoneNumber(phone, "resultPhone");
                        }
    
                        if( status === true ){
                            var Variables   = "id=" + id + "&username=" + username + "&permissions=" + permissions + "&name=" + name + "&lastname=" + lastname + "&email=" + email + "&phone=" + phone;
    
                            $.post("backend/updateUser.php", Variables, function(DATA){
                                
                                if( DATA.ERROR === true ){
                                    ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
    
                                }else{
                                    ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
                                    CloseModal('#LoadUserForm');
                                    CloseModal('#SearchResultsForm');
                                    GetListUsers();
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}

function SearchUser(){
    var rut         = document.getElementById("deleteUname").value;
    let status      = isValidRut(rut, "deleteUname");
     
    if( status ){
        let username    = ParseRut(rut);
        let Variables   = "username=" + username;

        $.post("backend/getUser.php", Variables, function(DATA){
            
            if( DATA.ERROR === true ){
                ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
                $('#deleteUname').val('');
            
            }else{
                document.getElementById("userToDelete").innerHTML   = DATA.name + " " + DATA.lastname;
                $('#ConfirmDeleteUser').modal('show');
            }
        });
    }
}

function DeleteUser(){
    var author      = sessionStorage.getItem("USERNAME");
    var rut         = document.getElementById("deleteUname").value;
    var username    = ParseRut(rut);
    var Variables   = "username=" + username;
    
    $.post("backend/deleteUser.php", Variables, function(DATA){
        
        if( DATA.ERROR === true ){
            ModalReportEvent("Error", DATA.ERRNO, DATA.MESSAGE);
            $('body').children('div:nth-last-child(1)').remove();
            
        }else{
            ModalReportEvent("Operación Exitosa", "", DATA.MESSAGE);
            if(author == rut){
                Logout();
            }else{
                GetListUsers();
            }
        }
        
        CloseModal('#ConfirmDeleteUser');
        CloseModal('#DeleteUserForm');
        $('#deleteUname').val('');
    });
}

function filterPermissions(Parameter, Event){
    var status;
    var admin;
    var mec;
    var elect;
    var gard;

    if(Parameter == "Add"){
        admin   = document.getElementById("addAdministrator");
        mec     = document.getElementById("addMechanic");
        elect   = document.getElementById("addElectrician");
        gard    = document.getElementById("addGardener");

    }else if(Parameter == "Edit"){
        admin   = document.getElementById("editAdministrator");
        mec     = document.getElementById("editMechanic");
        elect   = document.getElementById("editElectrician");
        gard    = document.getElementById("editGardener");
    }

    if(admin != null){
        admin.addEventListener(Event, function(){
            if(this.checked){
                status  = true;
                mec.disabled    = status;
                elect.disabled  = status;
                gard.disabled   = status;
            }else{
                status  = false;
                mec.disabled    = status;
                elect.disabled  = status;
                gard.disabled   = status;
            }
        });
    
        mec.addEventListener(Event, function(){
            if(this.checked){
                status  = true;
                admin.disabled  = status;
                elect.disabled  = status;
                gard.disabled   = status;
            }else{
                status  = false;
                admin.disabled  = status;
                elect.disabled  = status;
                gard.disabled   = status;
            }
        });
    
        elect.addEventListener(Event, function(){
            if(this.checked){
                status  = true;
                admin.disabled  = status;
                mec.disabled    = status;
                gard.disabled   = status;
            }else{
                status  = false;
                admin.disabled  = status;
                mec.disabled    = status;
                gard.disabled   = status;
            }
        });
    
        gard.addEventListener(Event, function(){
            if(this.checked){
                status  = true;
                admin.disabled  = status;
                mec.disabled    = status;
                elect.disabled  = status;
            }else{
                status  = false;
                admin.disabled  = status;
                mec.disabled    = status;
                elect.disabled  = status;
            }
        });
    }
}

function GeneratePermission(permission){

    if( permission == '1000' ){
        return "Administrador";

    }else if( permission == '0100' ){
        return "Mecánico";

    }else if( permission == '0010' ){
        return "Electricista";

    }else if( permission == '0001' ){
        return "Jardinero";
    
    }else{
        return "Error de permisos";
    }

}

 function GeneratePermissionsList(permissions){
     
    var arrayPermissions    = permissions.split("");
    var Select              = document.createElement("select");
        Select.className    = "custom-select";
        
    for( var i=0; i<arrayPermissions.length; i++){
        var option      = document.createElement("option");

        if( i == 0 && arrayPermissions[i] == "1" ){
            option.text = "Administrador";

        }else if( i == 1 && arrayPermissions[i] == "1" ){
            option.text = "Mecánico";

        }else if( i == 2 && arrayPermissions[i] == "1" ){
            option.text = "Electricista";

        }else if( i == 3 && arrayPermissions[i] == "1" ){
            option.text = "Jardinero";

        }

        if( option.text != "" ){
            Select.add(option);
        }
        
    }

    Select.selectedIndex = "0";  
    return Select;
 }
