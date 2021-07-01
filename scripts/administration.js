let table;

function initAdministration(){
    
    $('#bttnCloseUpdateUser').click(function(){
        $('#SearchResultsForm').modal('toggle');
    });
        
//The arguments are: function, id
    EventToPressEnter("searchUser", "searchUname");
    EventToChangeInput("newRut('addUname')", "addUname");
    EventToChangeInput("newRut('searchUname')", "searchUname");



    GetUsers();
    
    filterPermissions("Add", "change");

    CloseSpinner();
}

function GetUsers(){
    $.ajax({
        url:            "backend/getUsers.php",
        type:           "POST",
        contentType:    false,
        processData:    false,
        error:          (error)=>{console.log(error)},
        success:        (response)=>{
            if( response.ERROR === true ){
                ModalReportEvent("Error", response.ERRNO, response.MESSAGE);
           
            }else{
                let idTable = "ListUsers";
                let types   = ["Text","Text","Text","Text","Text","Text","Text"];

                table   = new Table(
                    idTable,
                    types,
                    types.length,
                    false
                );
                
                let data    = [];

                for(var i=0; i<response.count; i++){
                    let rut     = new Rut(response[i].username, false);
                    rut.generateRut();

                    data    = [ i + 1,
                                rut.rut,
                                GeneratePermission(response[i].permissions),
                                response[i].name,
                                response[i].lastname,
                                response[i].email,
                                response[i].phone
                            ];

                    table.addRow(types, data, "row:" + response[i].username);
                }
                
                table.encapsulate();
            }
        }
    });
}

async function AddUser(){
    $("#AddUserForm").modal("toggle");

    let rut         = new Rut(
        document.getElementById("addUname").value,
        true
    );

    let permission  = areValidPermissions("add");

    let user     = new User(
        sessionStorage.getItem("ID_COMPANY"),
        rut.username,
        permission,
        document.getElementById("addName").value,
        document.getElementById("addLastname").value,
        document.getElementById("addEmail").value,
        document.getElementById("addPhone").value,
        0
    );

    if(!rut.isValid("addUname")){ delete rut, delete user; return }
    if(!user.isValidName("addName")){ delete user; return }
    if(!user.isValidLastname("addLastname")){ delete user; return }
    if(!user.isValidEmail("addEmail")){ delete user; return }
    if(!user.isValidPhone("addPhone")){ delete user; return }

    ShowSpinner();

    user.add();

    setTimeout(()=>{
        if(user.lastOperation){
            let state = false;

            document.getElementById("addAdministrator").disabled    = state;
            document.getElementById("addMechanic").disabled         = state;
            document.getElementById("addElectrician").disabled      = state;
            document.getElementById("addGardener").disabled         = state;

            $('#addUname').val('');
            $('#addName').val('');
            $('#addLastname').val('');
            $('#addEmail').val('');
            $('#addPhone').val('');
            
            $("#addAdministrator").prop("checked", false);
            $("#addMechanic").prop("checked", false);
            $("#addElectrician").prop("checked", false);
            $("#addGardener").prop("checked", false);

            var active = false;

            document.getElementById("addAdministrator").disabled    = active;
            document.getElementById("addMechanic").disabled         = active;
            document.getElementById("addElectrician").disabled      = active;
            document.getElementById("addGardener").disabled         = active;

            table       = new Table("ListUsers", "","", true);

            let phone   = user.phone == "" ? 0 : user.phone; 

            let types   = ["Text","Text","Text","Text","Text","Text","Text"];
            let data    = [ table.rows,
                            rut.rut,
                            GeneratePermission(user.permissions),
                            user.name,
                            user.lastname,
                            user.email,
                            phone
                        ];

            table.addRow(types, data, user.username);
            table.encapsulate();
        }
    }, 5000);
}

function searchUser(Action){
    document.getElementById("searchUname").value    = "";

    sessionStorage.setItem('SearchUser', Action);
    $('#searchUserForm').modal('show');
}

function getUser(){

    let rut         = new Rut(
        document.getElementById("searchUname").value,
        true,
    );
    
    if(!rut.isValid("searchUname")){ delete rut; return }

    let newUser     = new User(0,0,"","","","",0,0);
    newUser.get(rut.username);
    
    $('#searchUserForm').modal('toggle');
    var Action  = sessionStorage.getItem('SearchUser');
    sessionStorage.removeItem('SearchUser');

    setTimeout(()=>{
        if( Action == 'deleteUser' ){
            document.getElementById("userToDelete").innerHTML   = newUser.name + " " + newUser.lastname;
            $('#deleteUserForm').modal('show');
        
        }else{
            document.getElementById("usernamePrevious").setAttribute('readonly', true);
            document.getElementById("usernamePrevious").setAttribute('disabled', true);
            document.getElementById("usernamePrevious").value   = rut.rut;
            document.getElementById("resultName").value         = newUser.name;
            document.getElementById("resultLastname").value     = newUser.lastname;
            document.getElementById("resultEmail").value        = newUser.email;
            document.getElementById('resultPhone').value        = newUser.phone == 0 ? "" : newUser.phone;
           
            var aux = newUser.permissions.split("");
    
            // We must assign the permissions associated to the uname.

            let permissions = ["editAdministrator", "editMechanic",
                                "editElectrician", "editGardener"];

            for(let i=0; i<permissions.length; i++){
                if(aux[i] == 0){
                    document.getElementById(permissions[i]).disabled    = true;
                    document.getElementById(permissions[i]).checked     = false;

                }else if(aux[i] == 1){
                    document.getElementById(permissions[i]).disabled    = false;
                    document.getElementById(permissions[i]).checked     = true;

                }
            }
    
            filterPermissions("Edit", "change");
    
            $('#editUserForm').modal('show');
            sessionStorage.setItem("idUsername", newUser.id);
        }

    }, 500);

}

async function UpdateUser(){
    $('#editUserForm').modal('toggle');

    let rut         = new Rut(
        document.getElementById("usernamePrevious").value,
        true,
    );

    let permission  = await areValidPermissions("edit");
    if(permission == ""){return}
    
    let user        = new User(
        sessionStorage.getItem("ID_COMPANY"),
        rut.username,
        permission,
        document.getElementById("resultName").value,
        document.getElementById("resultLastname").value,
        document.getElementById("resultEmail").value,
        document.getElementById("resultPhone").value,
        sessionStorage.getItem("idUsername")
    );

    if(!rut.isValid("usernamePrevious")){ delete rut; delete user; return }
    if(!user.isValidName("resultName")){ delete user; return }
    if(!user.isValidLastname("resultLastname")){ delete user; return }
    if(!user.isValidEmail("resultEmail")){ delete user; return }
    if(!user.isValidPhone("resultPhone")){ delete user; return }

    user.update();

    setTimeout(()=>{
        if( user.lastOperation ){
            let state = false;

            document.getElementById("editAdministrator").disabled    = state;
            document.getElementById("editMechanic").disabled         = state;
            document.getElementById("editElectrician").disabled      = state;
            document.getElementById("editGardener").disabled         = state;

            GetUsers();
        }

    }, 1000);
    
}

function DeleteUser(){
    $('#deleteUserForm').modal('toggle');

    let rut         = new Rut(
        document.getElementById("searchUname").value,
        true,
    );

    let user        = new User(sessionStorage.getItem("ID_COMPANY"),rut.username,"","", "","","","");

    if(!rut.isValid("searchUname")){ delete rut; delete user; return }
   
    user.delete();

    setTimeout(()=>{
        if( user.lastOperation ){
            let row     = document.getElementById("row:" + rut.username);
            let parent  = row.parentElement;
            let limit   = parent.children.length;
            let index   = parseInt(row.cells[0].textContent);

            row.remove();

            for(let i=index; i<limit - 1; i++){
                parent.children[i].cells[0].textContent = i;
            }

            if(sessionStorage.getItem("USERNAME") == rut.username){ Logout() }else{ GetUsers() }
        }
    }, (delay * 3));
    
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
