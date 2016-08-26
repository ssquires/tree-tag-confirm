var pano;
var treeLatLng;

var GOOGLE_CAR_CAMERA_HEIGHT = 3;


/*
 *  Initial setup.
 */
function initialize() {
    var urlParams = getJsonFromUrl();
    var lat = parseFloat(urlParams.lat);
    var lng = parseFloat(urlParams.lng);
    var assignmentId = urlParams.assignmentId;
    $('#assignment_id').val(assignmentId);
    $('#assignment_lat').val(lat);
    $('#assignment_lng').val(lng);
    
    treeLatLng = new google.maps.LatLng(lat, lng);
    findPano();
}


/*
 *  Updates the panorama displayed with the pano image closest to the given coordinates.
 */
function findPano() {
    var panoLatLng;
    
    var service = new google.maps.StreetViewService();
    service.getPanoramaByLocation(treeLatLng, 10, function(result, status) {
        if (status == google.maps.StreetViewStatus.OK) {
           initPano(result.location.latLng); 
        } else {
            service.getPanoramaByLocation(treeLatLng, 20, function(result, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    initPano(result.location.latLng);
                } else {
                    service.getPanoramaByLocation(treeLatLng, 30, function(result, status) {
                    if (status == google.maps.StreetViewStatus.OK) {
                        initPano(result.location.latLng);
                    } else {
                        service.getPanoramaByLocation(treeLatLng, 40, function(result, status) {
                        if (status == google.maps.StreetViewStatus.OK) {
                            initPano(result.location.latLng);
                        } else {
                            console.log("Error: Can't find close enough pano.");
                        }
                    
                    });
                    }
                });
                }                              
            });
        }
     });
}


function initPano(panoLatLng) {
    pano = new google.maps.StreetViewPanorama(document.getElementById("pano_1"), {
        position: panoLatLng,
        pov: {heading: 0, pitch: 0},
        disableDefaultUI: true,
        scrollwheel: false,
    });

    var heading = google.maps.geometry.spherical.computeHeading(
            panoLatLng, treeLatLng);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(panoLatLng, treeLatLng);
    var pitch = - Math.atan(GOOGLE_CAR_CAMERA_HEIGHT / distance) * 180.0 / Math.PI
    console.log(pitch);

    pano.setPov({heading: heading,
                 pitch: pitch});    
}


/*
 *  Parses the URL params into JSON.
 */
function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}


function getTreeCoords() {

    var cameraHeight = GOOGLE_CAR_CAMERA_HEIGHT; 
    var cameraPitch = Math.abs(pano.getPov().pitch) * Math.PI / 180.0;
    var cameraHeading = pano.getPov().heading;
    var cameraLatLng = pano.getLocation().latLng;
    
    var distance = cameraHeight * Math.tan(Math.PI / 2 - cameraPitch);
    var correctedTreeLatLng = google.maps.geometry.spherical.computeOffset(cameraLatLng,
                                                                  distance,
                                                                  cameraHeading);
    return correctedTreeLatLng;
}


function submitTree() {
    // TODO: submit heading, pitch, latlng of pano, as well as original tree latlng, calculated corrected tree latlng and visibility problems
    $("#pano_lat").val(pano.getPosition().lat());
    $("#pano_lng").val(pano.getPosition().lat());
    console.log("Pano: " + pano.getPosition().lat() + " " + pano.getPosition().lng());
    $("#pano_heading").val(pano.getPov().heading);
    $("#pano_pitch").val(pano.getPov().pitch);
    console.log("Heading: " + pano.getPov().heading + " Pitch: " + pano.getPov().pitch);
    $("#original_tree_lat").val(treeLatLng.lat());
    $("#original_tree_lng").val(treeLatLng.lng());
    console.log("Original tree latlng: " + treeLatLng.lat() + " " + treeLatLng.lng());
    $("#corrected_tree_lat").val(getTreeCoords().lat());
    $("#corrected_tree_lng").val(getTreeCoords().lng());
    console.log("Corrected tree latlng: " + getTreeCoords());
    console.log("Not a Tree: " + document.getElementById("not-tree").checked);
    console.log("Tree Blocked: " + document.getElementById("tree-blocked").checked);

    var publicButton = document.getElementById("public");
    var privateButton = document.getElementById("private");
    if (!publicButton.checked && !privateButton.checked) {
        alert("Please indicate whether this is a public or private tree.");
        return false;
    } else {
        console.log("Public: " + publicButton.checked);
        console.log("Submitting");
        return true;
    }
}
