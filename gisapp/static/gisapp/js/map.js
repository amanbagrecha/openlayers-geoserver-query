var geoserver_ip = 'https://52.90.64.40'
var geoserver_port = '8080'


function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === name + "=") {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

var csrftoken = getCookie("csrftoken");


const layersource = new ol.source.XYZ({
	attributions: ['Powered by Esri',
				   'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
	attributionsCollapsible: false,
	url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	maxZoom: 23
  })

  var maplayer = 	new ol.layer.Tile({
	source: layersource,
	zIndex: 0
  })

  var view = new ol.View({
	projection: 'EPSG:4326',
	center: [-103.32989447589996, 44.18118547387081],
	zoom: 7,
  });
  
  var map = new ol.Map({
	layers: [ maplayer],
	target: 'map',
	view: view,
  });

  var SearchvectorLayerSource =  new ol.source.Vector({
	  
	})
  var SearchvectorLayer = new ol.layer.Vector({
	source:SearchvectorLayerSource
  });
  map.addLayer(SearchvectorLayer);

MyHeaders = {'Content-Type': 'application/json', 'Access-Control-Allow-Credentials' : true,
				'Access-Control-Allow-Origin':'*',
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa('admin:geoserver')}


//####################################_______FETCH WORKSPACE SF FOR ALL LAYERS USING REST________#####################################################//

var layerList = [];
var loginInfo = ["admin", "geoserver"];
var geoserverURL = geoserver_ip + ":" + geoserver_port 

$.ajax({
    url: geoserverURL + '/geoserver/rest/workspaces/sf/layers/',
    type: 'GET',
    dataType: 'json',
    contentType: "application/json",
    beforeSend: function(xhr) {
         xhr.setRequestHeader ("Authorization", "Basic " + btoa(loginInfo[0] + ":" + loginInfo[1]));
    },
    success: function(data){
        for (var i = 0; i < data.layers.layer.length; i++) {
            layerList.push([data.layers.layer[i].name, data.layers.layer[i].href]);
        }
		  var div = document.getElementById('allinputs')
		  var layernamesSelect = document.getElementById("layernames");
		  for (i = 0; i < layerList.length; i++){
				   div.innerHTML +=
					 '  <input type="checkbox" name="" id="" value=' + layerList[i][0] +' onchange="toggleLayer(this)">  <label for="scales">' +
					 layerList[i][0] +
					   '</label> <br>';
			  layernamesSelect.innerHTML +=
				'<option value="' +
				layerList[i][0] +
				'"> ' +
				layerList[i][0] +
				"</option>";
  
		  }
    },
    async: false
});

//####################################_______LOAD ATTRIBUTES FOR THE SELECTED LAYER________#####################################################//

  
function loadprops(layername) {
	  selectedLayer = layername;
	  fetch(
		geoserver_ip+ ':'+geoserver_port+"/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeNames=" + 
		  layername +
		  "&outputFormat=application/json",
		{
		  method: "GET",
		  headers: MyHeaders,
		}
	  )
		.then(function (response) {
		  return response.json();
		})
		.then(function (json) {
			var allprops = json.featureTypes[0].properties;
		  var ColumnnamesSelect = document.getElementById("Columnnames");
			  ColumnnamesSelect.innerHTML = ''
			for (i = 0; i < allprops.length; i++){
				if (allprops[i].name != 'the_geom') {
					ColumnnamesSelect.innerHTML +=
					  '<option value="' +
					  allprops[i].name +
					  '"> ' +
					  allprops[i].name +
					  "</option>";
				}
  
			}
		});
  }
  
var vectorLayer;
 
var image = new ol.style.Circle({
	radius: 7,
	fill: new ol.style.Fill({color: 'black'}),
	stroke: new ol.style.Stroke({
	color: [255,0,0], width: 2
	})
})

//####################################_______SET STYLE BASED ON FEATURE TYPE________#####################################################//

  const styles = {
	'Point': new ol.style.Style({
	  image: image,
	}),
	'LineString': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'orange',
		width: 2,
	  }),
	}),
	'MultiLineString': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'orange',
		width: 2,
	  }),
	}),
	'MultiPoint': new ol.style.Style({
	  image: image,
	}),
	'MultiPolygon': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'yellow',
		width: 1,
	  }),
	  fill: new ol.style.Fill({
		color: 'rgba(255, 255, 0, 0.1)',
	  }),
	}),
	'Polygon': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'blue',
		lineDash: [4],
		width: 3,
	  }),
	  fill: new ol.style.Fill({
		color: 'rgba(0, 0, 255, 0.1)',
	  }),
	}),
	'GeometryCollection': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'magenta',
		width: 2,
	  }),
	  fill: new ol.style.Fill({
		color: 'magenta',
	  }),
	  image: new ol.style.Circle({
		radius: 10,
		fill: null,
		stroke: new ol.style.Stroke({
		  color: 'magenta',
		}),
	  }),
	}),
	'Circle': new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: 'red',
		width: 2,
	  }),
	  fill: new ol.style.Fill({
		color: 'rgba(255,0,0,0.2)',
	  }),
	}),
  };
  const styleFunction = function (feature) {
	return styles[feature.getGeometry().getType()];
  };


//####################################_______SEARCH BY ATTRIBUTE AND RETUN JSON________#####################################################//

  function fetch_search_call(query_url, selectedLayer){

fetch_result = fetch(query_url, {
	method: "GET",
	headers: MyHeaders,
	})
	.then(function (response) {
	return response.json();
	})
	.then(function (json) {

	SearchvectorLayerSource.clear()
	SearchvectorLayerSource.addFeatures(
	new ol.format.GeoJSON({
	dataProjection: 'EPSG:26713',
	featureProjection:'EPSG:4326'
	}).readFeatures(json)
	);
	if(json.features.length!=0){
	$('#searchModal').modal('toggle');
	}

	SearchvectorLayer.set('name','search_polygon_layer')
	map.getView().fit(SearchvectorLayerSource.getExtent(),  { duration: 1590, size: map.getSize(), 
	padding: [10, 10, 13, 15], maxZoom:16});

	// https://openlayers.org/en/latest/examples/geojson.html
	SearchvectorLayer.setStyle(styleFunction)

		})
		return fetch_result
  }

  function loadcols(value) {
	selectedColumn = value.innerHTML;
	if (value.value == 'string') {
	  
	}
  }


  function toggleLayer(input) {
	  if (input.checked) {
		  console.log("checked")
		  wmsLayer = new ol.layer.Image({
			source: new ol.source.ImageWMS({
			  url: geoserver_ip+ ':'+geoserver_port + "/geoserver/wms",
			  imageLoadFunction: tileLoader,
			  params: { LAYERS: input.value },
			  serverType: "geoserver",
			}),
			name: input.value,
		  });
		  console.log(input.value)
		  	
		map.addLayer(wmsLayer);
					
	  } else {
		  map.getLayers().forEach(layer => {
			  if (layer.get('name') == input.value) {
				 map.removeLayer(layer);
			 }
		 });
	  }
  }



function getValues() {
		if($('#remove_alert').length){

			$('#remove_alert').remove()
		}
		
			column_name = document.getElementById("Columnnames").value;
			query_value = document.getElementById("queryvalue").value;
			CQL_filter = column_name + " = '" + query_value + "'";
			query_url =geoserver_ip+ ':'+geoserver_port + "/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +	
			selectedLayer +	"&CQL_FILTER=" +	CQL_filter +  "&outputFormat=application%2Fjson";
				
			fetch_search_call(query_url, selectedLayer).catch((error) => {
							console.log("TESTING CQL LIKE..")
							CQL_filter = column_name + "%20" + "ILIKE" + "%20%27%25" + query_value + "%25%27";
							var query_url =geoserver_ip+ ':'+geoserver_port + "/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +	selectedLayer +	"&CQL_FILTER=" +	CQL_filter +  "&outputFormat=application%2Fjson";
							fetch_search_call(query_url, selectedLayer).catch((error) => {
									console.log("error in fetch:", error)
								$('#searchModal .modal-body').append( 
									`<div class="alert alert-danger" id= "remove_alert" role="alert">
									Could not find any match!
						</div>`)
								});
	
		});

	}
  
function tileLoader(tile, src) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.open('GET', src);
		xhr.setRequestHeader("Authorization", "Basic " + window.btoa('admin' + ":" + 'geoserver'));
		xhr.onload = function() {
			if (this.response) {
				var objectUrl = URL.createObjectURL(xhr.response);
				tile.getImage().onload = function() {
					URL.revokeObjectURL(objectUrl);
				};
				tile.getImage().src = objectUrl;
			} else {
				tile.setState(3);
			}
		};
		xhr.onerror = function() {
			tile.setState(3);
		};
		xhr.send();
	}

function clearbtn_search(){
		if($('#remove_alert').length){
	
			$('#remove_alert').remove()
		}
		SearchvectorLayerSource.clear();
		SearchvectorLayer.set('name',)
	  }
	
function closebtn_search(){
		if($('#remove_alert').length){
	
			$('#remove_alert').remove()
		}
	  }
	

//####################################_______REGISTER CRS VIA PROJ4________#####################################################//
	  
function setProjection(code, proj4def) {
					
			  const newProjCode = 'EPSG:' + code;
			  proj4.defs(newProjCode, proj4def);
			  ol.proj.proj4.register(proj4);
	  
			}
function search_(query) {
		fetch('https://epsg.io/?format=json&q=' + query)
		  .then(function (response) {
			return response.json();
		  })
		  .then(function (json) {
			const results = json['results'];
			if (results && results.length > 0) {
			  for (let i = 0, ii = results.length; i < ii; i++) {
				const result = results[i];
				if (result) {
				  const code = result['code'];
				  const name = result['name'];
				  const proj4def = result['proj4'];
				  const bbox = result['bbox'];
				  if (
					code &&
					code.length > 0 &&
					proj4def &&
					proj4def.length > 0 &&
					bbox &&
					bbox.length == 4
				  ) {
					setProjection(code, proj4def);
					return;
				  }
				}
			  }
			}
			setProjection(null, null, null, null);
		  });
	  }

/* Register CRS via proj4 since openlayers does not contains this CRS */
search_('26713')


