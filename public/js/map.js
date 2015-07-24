var map;
var selectedShape;
var drawingManager;
var geocoder;
var depot;
var directionsService;
var dep_lat = 33.842582;
var dep_lng = -84.207967;
var home_lat = 33.8727043;
var home_lng = -84.47995850000001;
var home_address = "2111 Crestlane Dr SE Smyrna,GA 30080"
var home;
var locations = [];
var trip = [];

function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}

function setSelection(shape) {
  clearSelection();
  selectedShape = shape;
  shape.setEditable(true);
}

function deleteDrawing(deleteDiv,shape){
	var controlUI = document.createElement('div');
	controlUI.className = "waves-effect waves-light btn button"
  controlUI.innerHTML = "Clear Shape";
  deleteDiv.appendChild(controlUI);

  google.maps.event.addDomListener(controlUI,'click',function(){
	  if (selectedShape) {
        selectedShape.setMap(null);
      }
  });
}

function showPanel(showDiv){
  var controlUI = document.createElement('div');
  controlUI.className = "waves-effect waves-light btn button"
  controlUI.innerHTML = '<i class="fa fa-arrow-left"></i> Show';
  showDiv.appendChild(controlUI);

  google.maps.event.addDomListener(controlUI,'click',function(){
    $('#panel').toggle(500);
    $('#show').toggle(500);
  });
}


function addMarker(location,address) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP
  });

  locations.push(marker);
  var index = locations.length - 1;

  var info = '<div class="content">' +
  '<p id=address-' + index + '"">' + address + '</h3>' +
  '</div>';

  var infowindow = new google.maps.InfoWindow({
    content: info
  });

  google.maps.event.addListener(marker,'click', function() {
    if (!isInfoWindowOpen(infowindow)) infowindow.open(map,marker);
    else infowindow.close();
  });

  return index;
}

function clearAllMarkers(){
  for(var i = 0; i < locations.length; i++) {
    locations[i].setMap(null);
  }
  locations = [];
}

function showAllMarkers(){
   for(var i = 0; i < locations.length; i++) {
    locations[i].setMap(map);
  }

}

function isInfoWindowOpen(infowindow){
    var map = infowindow.getMap();
    return (map !== null && typeof map !== "undefined");
}

function removeMarker(marker) {
  locations[marker].setMap(null);
}

function codeAddress() {
  var address = document.getElementById("address").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var loc = results[0].geometry.location;
      map.setCenter(loc);
      var index = addMarker(loc,address);
      $('#addresses').append(appendAddress(address,index));
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function appendAddress(address,index) {
  return '<div class="side-menu" id=location-' 
  + index + '><i class="fa fa-times-circle delete"></i> ' 
  + '<a class ="link">'
  + address + '</a></div>'
}

function setTrip() {
  trip = [];
  for (var i = 0; i < locations.length;  i++) {
    var loc = locations[i]
    var coords = loc.getPosition();
    if (google.maps.geometry.poly.containsLocation(coords,selectedShape) 
      && loc.getMap() && loc != home) trip.push({
        location: coords
      });
  }
  return trip;
}

function calcRoute() {
  trip = setTrip();
  var start = getStart(trip);
  var end = getEnd(trip);

  var request = {
      origin: home,
      destination: home,
      waypoints: trip,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });


}

function getStart(trip){
  return false;

}

function getEnd(trip) {
  return false;

}

function geocodeAddress(address){
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var loc = results[0].geometry.location;
      addMarker(loc,address);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function initialize() {

  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 11,
    center: {lat: dep_lat, lng: dep_lng}
  });

	geocoder = new google.maps.Geocoder;
  depot = new google.maps.LatLng(dep_lat,dep_lng);
  
  // addMarker(depot,"Nature's Garden");
  geocodeAddress(home_address);

  geocoder.geocode( { 'address': home_address}, function(results) {
    home = results[0].geometry.location;
  });


  directionsService = new google.maps.DirectionsService();


  directionsDisplay = new google.maps.DirectionsRenderer({
    draggable:true
  });
  directionsDisplay.setMap(map);

  //routing



  //autocomplete

  var input = document.getElementById('address')
  var bounds = map.getBounds();
  var searchBox = new google.maps.places.SearchBox(input);
  searchBox.setBounds(bounds);

  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
    });

	// Drawing Tools
 	var drawingManager = new google.maps.drawing.DrawingManager({
	  drawingMode: google.maps.drawing.OverlayType.MARKER,
	  drawingControl: true,
	  drawingControlOptions: {
	    position: google.maps.ControlPosition.TOP_CENTER,
	    drawingModes: [
	      google.maps.drawing.OverlayType.CIRCLE,
	      google.maps.drawing.OverlayType.POLYGON,
	      google.maps.drawing.OverlayType.RECTANGLE
	    ],
  	},

    markerOptions: {
      draggable: true
    },

    polylineOptions: {
      editable: true
    },

  });

  drawingManager.setMap(map);
  drawingManager.setDrawingMode(null);

  //event listeners
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (e.type != google.maps.drawing.OverlayType.MARKER) {
      drawingManager.setDrawingMode(null);
      var newShape = e.overlay;
      newShape.type = e.type;
      google.maps.event.addListener(newShape, 'click', function() {
        setSelection(newShape);
      });
    setSelection(newShape);
    }
  });

  $(document).ready(function() {

    $('#location-form').on("submit",function(){
      codeAddress();
      return false;
    });

    $('#add').on("click",function(){
      codeAddress();
      console.log("test");
    })

    $("#clear").on("click", function(){
      $('#location-form').trigger('reset')
    })

    $('#hide').on("click", function() {
      $('#panel').toggle(500);
      $('#show').toggle(500);
    })

    $('clearall').on('click', function(){
      clearAllMarkers();
    })

    $(document).on('click','.delete',function(){
      this.parentElement.remove();
      var index = this.parentElement.id.match(/\d/g).join("");
      removeMarker(index);
    });

    $(document).on('click','.link',function(){
      var index = this.parentElement.id.match(/\d/g).join("");
      var marker = locations[index];
      google.maps.event.trigger(marker, 'click');
    })




  });
      
  //controls
	var deleteDiv = document.createElement('div');
  var showDiv = document.createElement('div');
	var deleteControl = new deleteDrawing(deleteDiv, selectedShape);
  showDiv.id = "show";
  showDiv.style.display = "none";
  showPanel(showDiv);
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(deleteDiv);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(showDiv);
}

$(document).ready(function(){
  google.maps.event.addDomListener(window, 'load', initialize);
})



