function onDeviceReady() {
    $('body').addClass(device.platform.toLowerCase());

    // Bind events
    $(document).on("resume", onResume);
    $('#do-check').on("click", checkState);

    // iOS settings
    $('#settings').on("click", function(){
        cordova.plugins.diagnostic.switchToSettings(function(){
            console.log("Successfully opened settings");
        }, function(error){
            console.error(error);
        });
    });

    // Android settings
    $('#location-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToLocationSettings();
    });

    $('#mobile-data-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToMobileDataSettings();
    });

    $('#bluetooth-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToBluetoothSettings();
    });

    $('#wifi-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToWifiSettings();
    });

    // Make dummy geolocation request to cause authorization request
    navigator.geolocation.getCurrentPosition(function(){},function(){});

    // Make dummy Bluetooth request to cause authorization request
    bluetoothSerial.isEnabled(
        function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    console.log(JSON.stringify(results));
                },
                function(error) {
                    console.log(JSON.stringify(error));
                }
            );
        },
        function(){
            console.log("Bluetooth is not enabled/supported");
        }
    );

    setTimeout(checkState, 500);
}


function checkState(){
    console.log("Checking state...");

    $('#state li').removeClass('on off');

    cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        $('#state .location').addClass(enabled ? 'on' : 'off');
    }, onError);

    if(device.platform === "iOS"){
        cordova.plugins.diagnostic.isLocationEnabledSetting(function(enabled){
            $('#state .location-setting').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
            $('#state .location-authorization').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
            $('#state .location-authorization-status').find('.value').text(status.toUpperCase());
        }, onError);
    }

    if(device.platform === "Android"){
        cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            $('#state .gps-location').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isNetworkLocationEnabled(function(enabled){
            $('#state .network-location').addClass(enabled ? 'on' : 'off');
        }, onError);
    }

    cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
        $('#state .wifi').addClass(enabled ? 'on' : 'off');
    }, onError);

    cordova.plugins.diagnostic.isCameraEnabled(function(enabled){
        $('#state .camera').addClass(enabled ? 'on' : 'off');
    }, onError);

    cordova.plugins.diagnostic.isBluetoothEnabled(function(enabled){
        $('#state .bluetooth').addClass(enabled ? 'on' : 'off');
    }, onError);
}

function onError(error){
    console.error("An error occurred: "+error);
}

function onResume(){
    checkState();
}


$(document).on("deviceready", onDeviceReady);