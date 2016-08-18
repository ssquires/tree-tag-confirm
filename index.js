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
    console.log("Pano: " + pano.getPosition().lat() + " " + pano.getPosition().lng());
    console.log("Heading: " + pano.getPov().heading + " Pitch: " + pano.getPov().pitch);
    console.log("Original tree latlng: " + treeLatLng.lat() + " " + treeLatLng.lng());
    console.log("Corrected tree latlng: " + getTreeCoords());
    var issues = document.getElementById('image_problems_1');
    var issueText = issues.options[issues.selectedIndex].text;
    console.log("Visibility problems: " + issueText);
    if (issueText == "PLEASE SELECT ONE") {
        alert("Please use the dropdown menu to indicate whether there are any visibility problems.")
    } else {
        console.log("Submitting");
    }
}
