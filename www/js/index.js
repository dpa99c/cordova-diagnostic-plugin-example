

function onDeviceReady() {
    $('body').addClass(device.platform.toLowerCase());

    // Bind events
    $(document).on("resume", onResume);
    $('#do-check').on("click", checkState);
    $('#settings #location-settings').on("click", onClickLocationSettings);

    checkState();
}


function checkState(){
    console.log("Checking state...");

    $('#state li').removeClass('on off');

    cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        $('#state .location').addClass(enabled ? 'on' : 'off');
    }, onError);

    cordova.plugins.diagnostic.isLocationEnabledSetting(function(enabled){
        $('#state .location-setting').addClass(enabled ? 'on' : 'off');
    }, onError);

    cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
        $('#state .location-authorisation').addClass(enabled ? 'on' : 'off');
    }, onError);

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

function onClickLocationSettings(){
    cordova.plugins.diagnostic.switchToLocationSettings();
}

function onResume(){
    checkState();
}


$(document).on("deviceready", onDeviceReady);