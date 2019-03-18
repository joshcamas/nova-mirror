var SAMAC = SAMAC || {};

SAMAC.init = function() {

    SAMAC.socket = io();

    function onUserCheck() {
        if (SAMAC.configData.users.length > 0) {
            SAMAC.loadUserOptions(0, onOptionsLoad);
        } else {
            console.warn("No user detected, switching to welcome screen!");
            $("#new-user").show();
            $("#create-user").click(SAMAC.createUser)
        }
    }

    function onOptionsLoad() {

    }
    SAMAC.checkUserExists(onUserCheck)

}

SAMAC.createUser = function() {

    var failed = false;

    if ($("#username").val() == "") {
        $(".form-username").addClass("has-error")
        failed = true;
    }

    if ($("#mirrorname").val() == "") {
        $(".form-mirrorname").addClass("has-error")
        failed = true;
    }

    if (failed) {
        return;
    }

    var username = $("#username").val()
    var mirrorname = $("#mirrorname").val()

    var dat = {username:username,mirrorname:mirrorname}

    SAMAC.socket.emit('createuser', dat);

    /*
    $.ajax({
        url: "/server/makeuser.php",
        type: "POST",dataType  : 'json',
        data: {username: username},
        success: function(data, textStatus, jqXHR) {
            console.log(data)
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }


    });

    return;

    //Create new files
    $.post('server/makeuser.php', {
            username: username
        },
        function(data) {
            console.log(data)
            $.getJSON("user/" + username + "/options.json", function(data) {
                $.post('server/makeuser_modules.php', {
                        username: username,
                        modules: data.modules
                    },
                    function(data) {
                        alert('Directory created');
                    });
            });
        });*/
}

SAMAC.checkUserExists = function(onComplete) {
    $.getJSON("config.json", function(data) {
        SAMAC.configData = data;
        onComplete()
    });
}

SAMAC.loadUserOptions = function(index, onComplete) {
    var userId = SAMAC.configData.users[index];
    SAMAC.currUser = new SAMAC.User()
    SAMAC.currUser.name = userId;
    $.getJSON("user/" + userId + "/options.json", function(data) {
        if (onComplete != null) {
            onComplete(data);
        }
    });
}
