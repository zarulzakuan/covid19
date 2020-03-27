var txtFile = new XMLHttpRequest();
var biggestCaseCount = 0;
var totalCases = 0;


txtFile.open("GET", "https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv", true);
txtFile.onreadystatechange = function() {
    var allGeoJSON = new Array();
    var allTable = '<div class="table">';

    if (txtFile.readyState === 4) { // document is ready to parse.
        if (txtFile.status === 200) { // file is found
            allText = txtFile.responseText;
            lines = CSVToArray(allText, ",")
                //find latest datetime
            latestDate = lines[lines.length - 2][0]
            lines.sort(function(a, b) {
                return b[2] - a[2];
            })

            // find biggest case

            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i]
                var line = lines[i]

                if (line[0] === latestDate) {
                    if (typeof line[2] !== "undefined") {
                        if (parseInt(line[2]) > biggestCaseCount) {
                            biggestCaseCount = parseInt(line[2]);
                        }
                        totalCases += parseInt(line[2])
                    }
                }
            };

            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i]
                if (typeof line[1] !== "undefined") {
                    var countryUpper = line[1].toUpperCase();
                    if (typeof country[countryUpper] !== "undefined") {
                        if (line[0] === latestDate) {
                            //console.log("--->" + line[1]);
                            //console.log(country[countryUpper]);

                            //count radius
                            var radius = line[2] / biggestCaseCount * 1000
                            if (radius > 100) {
                                radius = 100
                            }

                            // create geojson
                            var geoJSON = {
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [country[countryUpper].long, country[countryUpper].lat]
                                },
                                "properties": {
                                    "country": "<h2>" + line[1] + "</h2><table><tr><td><b>Cases:</b></td><td>" + line[2] + "</td></tr><tr><td><b>Deaths:</b></td><td>" + line[3] + "</td></tr></table>",
                                    "casecount": line[2],
                                    "deathcount": line[3],
                                    "radius": radius
                                }
                            }

                            allGeoJSON.push(geoJSON);

                            // create table

                            var tablerow = ' \
                            <div class="row"> \
                                <div class="cell"> \
                                    ' + line[1] + ' \
                                </div> \
                                <div class="cell" style="color:red;font-size: 30px;"> \
                                    ' + line[2] + ' \
                                </div> \
                                <div class="cell" style="color:red;font-size: 20px;"> \
                                    ' + line[3] + ' \
                                </div> \
                            </div>';

                            allTable += tablerow
                        }


                    } else {
                        // missing country
                        // console.log("--->" + line[1]);
                    }
                } else {
                    //blank row
                }
            };
            //console.log(allGeoJSON)

            allTable += '</div>'
            topText = '<h1>COVID-19</h1> \
            <h3>Last update: ' + latestDate + '</h3> <strong>Total cases:</strong> <font size="20" color="red">' + totalCases + '</font>';
            var div = document.getElementById('sidewindow');
            var div2 = document.getElementById('topwindow');

            div.innerHTML += allTable
            div2.innerHTML += topText;

            var mapOptions = {
                    minZoom: 2,
                    maxZoom: 99
                }
                // Creating a map object
            var map = new L.map('map', mapOptions).fitWorld();

            map.setView([10, 0], 0);

            var layer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            // Creating a Layer object
            //var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

            // Adding layer to the map
            map.addLayer(layer);
            var Classroomsamount = new L.geoJson(allGeoJSON, {
                pointToLayer: function(feature, latlng) {
                    return new L.CircleMarker([latlng.lat, latlng.lng], {
                        radius: feature.properties.radius,
                        color: "red",
                        border: false,
                        fillOpacity: 0.6,
                        weight: 2
                    });
                },
                onEachFeature: function(feature, layer) {
                    var text = L.tooltip({
                            permanent: true,
                            direction: 'center',
                            className: 'text'
                        })
                        .setContent(feature.properties.casecount)
                        .setLatLng(layer.getLatLng());
                    //text.addTo(map);


                    var text2 = L.tooltip({
                            direction: 'top',
                            className: 'text2'
                        })
                        .setContent(feature.properties.country)
                        .setLatLng(layer.getLatLng());
                    layer.bindTooltip(text2);
                }
            }).addTo(map);

        }
    }
}

txtFile.send(null);

// read report

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
        []
    ];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}


var country = {
    "ANDORRA": {
        "lat": 42.546245,
        "long": 1.601554
    },
    "UNITED ARAB EMIRATES": {
        "lat": 23.424076,
        "long": 53.847818
    },
    "AFGHANISTAN": {
        "lat": 33.93911,
        "long": 67.709953
    },
    "ANTIGUA AND BARBUDA": {
        "lat": 17.060816,
        "long": -61.796428
    },
    "ANGUILLA": {
        "lat": 18.220554,
        "long": -63.068615
    },
    "ALBANIA": {
        "lat": 41.153332,
        "long": 20.168331
    },
    "ARMENIA": {
        "lat": 40.069099,
        "long": 45.038189
    },
    "NETHERLANDS ANTILLES": {
        "lat": 12.226079,
        "long": -69.060087
    },
    "ANGOLA": {
        "lat": -11.202692,
        "long": 17.873887
    },
    "ANTARCTICA": {
        "lat": -75.250973,
        "long": -0.071389
    },
    "ARGENTINA": {
        "lat": -38.416097,
        "long": -63.616672
    },
    "AMERICAN SAMOA": {
        "lat": -14.270972,
        "long": -170.132217
    },
    "AUSTRIA": {
        "lat": 47.516231,
        "long": 14.550072
    },
    "AUSTRALIA": {
        "lat": -25.274398,
        "long": 133.775136
    },
    "ARUBA": {
        "lat": 12.52111,
        "long": -69.968338
    },
    "AZERBAIJAN": {
        "lat": 40.143105,
        "long": 47.576927
    },
    "BOSNIA AND HERZEGOVINA": {
        "lat": 43.915886,
        "long": 17.679076
    },
    "BARBADOS": {
        "lat": 13.193887,
        "long": -59.543198
    },
    "BANGLADESH": {
        "lat": 23.684994,
        "long": 90.356331
    },
    "BELGIUM": {
        "lat": 50.503887,
        "long": 4.469936
    },
    "BURKINA FASO": {
        "lat": 12.238333,
        "long": -1.561593
    },
    "BULGARIA": {
        "lat": 42.733883,
        "long": 25.48583
    },
    "BAHRAIN": {
        "lat": 25.930414,
        "long": 50.637772
    },
    "BURUNDI": {
        "lat": -3.373056,
        "long": 29.918886
    },
    "BENIN": {
        "lat": 9.30769,
        "long": 2.315834
    },
    "BERMUDA": {
        "lat": 32.321384,
        "long": -64.75737
    },
    "BRUNEI": {
        "lat": 4.535277,
        "long": 114.727669
    },
    "BOLIVIA": {
        "lat": -16.290154,
        "long": -63.588653
    },
    "BRAZIL": {
        "lat": -14.235004,
        "long": -51.92528
    },
    "BAHAMAS": {
        "lat": 25.03428,
        "long": -77.39628
    },
    "BHUTAN": {
        "lat": 27.514162,
        "long": 90.433601
    },
    "BOUVET ISLAND": {
        "lat": -54.423199,
        "long": 3.413194
    },
    "BOTSWANA": {
        "lat": -22.328474,
        "long": 24.684866
    },
    "BELARUS": {
        "lat": 53.709807,
        "long": 27.953389
    },
    "BELIZE": {
        "lat": 17.189877,
        "long": -88.49765
    },
    "CANADA": {
        "lat": 56.130366,
        "long": -106.346771
    },
    "COCOS [KEELING] ISLANDS": {
        "lat": -12.164165,
        "long": 96.870956
    },
    "CONGO [DRC]": {
        "lat": -4.038333,
        "long": 21.758664
    },
    "CENTRAL AFRICAN REPUBLIC": {
        "lat": 6.611111,
        "long": 20.939444
    },
    "CONGO [REPUBLIC]": {
        "lat": -0.228021,
        "long": 15.827659
    },
    "SWITZERLAND": {
        "lat": 46.818188,
        "long": 8.227512
    },
    "CÔTE D'IVOIRE": {
        "lat": 7.539989,
        "long": -5.54708
    },
    "COOK ISLANDS": {
        "lat": -21.236736,
        "long": -159.777671
    },
    "CHILE": {
        "lat": -35.675147,
        "long": -71.542969
    },
    "CAMEROON": {
        "lat": 7.369722,
        "long": 12.354722
    },
    "CHINA": {
        "lat": 35.86166,
        "long": 104.195397
    },
    "COLOMBIA": {
        "lat": 4.570868,
        "long": -74.297333
    },
    "COSTA RICA": {
        "lat": 9.748917,
        "long": -83.753428
    },
    "CUBA": {
        "lat": 21.521757,
        "long": -77.781167
    },
    "CAPE VERDE": {
        "lat": 16.002082,
        "long": -24.013197
    },
    "CHRISTMAS ISLAND": {
        "lat": -10.447525,
        "long": 105.690449
    },
    "CYPRUS": {
        "lat": 35.126413,
        "long": 33.429859
    },
    "CZECH REPUBLIC": {
        "lat": 49.817492,
        "long": 15.472962
    },
    "GERMANY": {
        "lat": 51.165691,
        "long": 10.451526
    },
    "DJIBOUTI": {
        "lat": 11.825138,
        "long": 42.590275
    },
    "DENMARK": {
        "lat": 56.26392,
        "long": 9.501785
    },
    "DOMINICA": {
        "lat": 15.414999,
        "long": -61.370976
    },
    "DOMINICAN REPUBLIC": {
        "lat": 18.735693,
        "long": -70.162651
    },
    "ALGERIA": {
        "lat": 28.033886,
        "long": 1.659626
    },
    "ECUADOR": {
        "lat": -1.831239,
        "long": -78.183406
    },
    "ESTONIA": {
        "lat": 58.595272,
        "long": 25.013607
    },
    "EGYPT": {
        "lat": 26.820553,
        "long": 30.802498
    },
    "WESTERN SAHARA": {
        "lat": 24.215527,
        "long": -12.885834
    },
    "ERITREA": {
        "lat": 15.179384,
        "long": 39.782334
    },
    "SPAIN": {
        "lat": 40.463667,
        "long": -3.74922
    },
    "ETHIOPIA": {
        "lat": 9.145,
        "long": 40.489673
    },
    "FINLAND": {
        "lat": 61.92411,
        "long": 25.748151
    },
    "FIJI": {
        "lat": -16.578193,
        "long": 179.414413
    },
    "FALKLAND ISLANDS [ISLAS MALVINAS]": {
        "lat": -51.796253,
        "long": -59.523613
    },
    "MICRONESIA": {
        "lat": 7.425554,
        "long": 150.550812
    },
    "FAROE ISLANDS": {
        "lat": 61.892635,
        "long": -6.911806
    },
    "FRANCE": {
        "lat": 46.227638,
        "long": 2.213749
    },
    "GABON": {
        "lat": -0.803689,
        "long": 11.609444
    },
    "UNITED KINGDOM": {
        "lat": 55.378051,
        "long": -3.435973
    },
    "GRENADA": {
        "lat": 12.262776,
        "long": -61.604171
    },
    "GEORGIA": {
        "lat": 42.315407,
        "long": 43.356892
    },
    "FRENCH GUIANA": {
        "lat": 3.933889,
        "long": -53.125782
    },
    "GUERNSEY": {
        "lat": 49.465691,
        "long": -2.585278
    },
    "GHANA": {
        "lat": 7.946527,
        "long": -1.023194
    },
    "GIBRALTAR": {
        "lat": 36.137741,
        "long": -5.345374
    },
    "GREENLAND": {
        "lat": 71.706936,
        "long": -42.604303
    },
    "GAMBIA": {
        "lat": 13.443182,
        "long": -15.310139
    },
    "GUINEA": {
        "lat": 9.945587,
        "long": -9.696645
    },
    "GUADELOUPE": {
        "lat": 16.995971,
        "long": -62.067641
    },
    "EQUATORIAL GUINEA": {
        "lat": 1.650801,
        "long": 10.267895
    },
    "GREECE": {
        "lat": 39.074208,
        "long": 21.824312
    },
    "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS": {
        "lat": -54.429579,
        "long": -36.587909
    },
    "GUATEMALA": {
        "lat": 15.783471,
        "long": -90.230759
    },
    "GUAM": {
        "lat": 13.444304,
        "long": 144.793731
    },
    "GUINEA-BISSAU": {
        "lat": 11.803749,
        "long": -15.180413
    },
    "GUYANA": {
        "lat": 4.860416,
        "long": -58.93018
    },
    "WEST BANK AND GAZA": {
        "lat": 31.354676,
        "long": 34.308825
    },
    "HONG KONG": {
        "lat": 22.396428,
        "long": 114.109497
    },
    "HEARD ISLAND AND MCDONALD ISLANDS": {
        "lat": -53.08181,
        "long": 73.504158
    },
    "HONDURAS": {
        "lat": 15.199999,
        "long": -86.241905
    },
    "CROATIA": {
        "lat": 45.1,
        "long": 15.2
    },
    "HAITI": {
        "lat": 18.971187,
        "long": -72.285215
    },
    "HUNGARY": {
        "lat": 47.162494,
        "long": 19.503304
    },
    "INDONESIA": {
        "lat": -0.789275,
        "long": 113.921327
    },
    "IRELAND": {
        "lat": 53.41291,
        "long": -8.24389
    },
    "ISRAEL": {
        "lat": 31.046051,
        "long": 34.851612
    },
    "ISLE OF MAN": {
        "lat": 54.236107,
        "long": -4.548056
    },
    "INDIA": {
        "lat": 20.593684,
        "long": 78.96288
    },
    "BRITISH INDIAN OCEAN TERRITORY": {
        "lat": -6.343194,
        "long": 71.876519
    },
    "IRAQ": {
        "lat": 33.223191,
        "long": 43.679291
    },
    "IRAN": {
        "lat": 32.427908,
        "long": 53.688046
    },
    "ICELAND": {
        "lat": 64.963051,
        "long": -19.020835
    },
    "ITALY": {
        "lat": 41.87194,
        "long": 12.56738
    },
    "JERSEY": {
        "lat": 49.214439,
        "long": -2.13125
    },
    "JAMAICA": {
        "lat": 18.109581,
        "long": -77.297508
    },
    "JORDAN": {
        "lat": 30.585164,
        "long": 36.238414
    },
    "JAPAN": {
        "lat": 36.204824,
        "long": 138.252924
    },
    "KENYA": {
        "lat": -0.023559,
        "long": 37.906193
    },
    "KYRGYZSTAN": {
        "lat": 41.20438,
        "long": 74.766098
    },
    "CAMBODIA": {
        "lat": 12.565679,
        "long": 104.990963
    },
    "KIRIBATI": {
        "lat": -3.370417,
        "long": -168.734039
    },
    "COMOROS": {
        "lat": -11.875001,
        "long": 43.872219
    },
    "SAINT KITTS AND NEVIS": {
        "lat": 17.357822,
        "long": -62.782998
    },
    "KOREA, NORTH": {
        "lat": 40.339852,
        "long": 127.510093
    },
    "KOREA, SOUTH": {
        "lat": 35.907757,
        "long": 127.766922
    },
    "KUWAIT": {
        "lat": 29.31166,
        "long": 47.481766
    },
    "CAYMAN ISLANDS": {
        "lat": 19.513469,
        "long": -80.566956
    },
    "KAZAKHSTAN": {
        "lat": 48.019573,
        "long": 66.923684
    },
    "LAOS": {
        "lat": 19.85627,
        "long": 102.495496
    },
    "LEBANON": {
        "lat": 33.854721,
        "long": 35.862285
    },
    "SAINT LUCIA": {
        "lat": 13.909444,
        "long": -60.978893
    },
    "LIECHTENSTEIN": {
        "lat": 47.166,
        "long": 9.555373
    },
    "SRI LANKA": {
        "lat": 7.873054,
        "long": 80.771797
    },
    "LIBERIA": {
        "lat": 6.428055,
        "long": -9.429499
    },
    "LESOTHO": {
        "lat": -29.609988,
        "long": 28.233608
    },
    "LITHUANIA": {
        "lat": 55.169438,
        "long": 23.881275
    },
    "LUXEMBOURG": {
        "lat": 49.815273,
        "long": 6.129583
    },
    "LATVIA": {
        "lat": 56.879635,
        "long": 24.603189
    },
    "LIBYA": {
        "lat": 26.3351,
        "long": 17.228331
    },
    "MOROCCO": {
        "lat": 31.791702,
        "long": -7.09262
    },
    "MONACO": {
        "lat": 43.750298,
        "long": 7.412841
    },
    "MOLDOVA": {
        "lat": 47.411631,
        "long": 28.369885
    },
    "MONTENEGRO": {
        "lat": 42.708678,
        "long": 19.37439
    },
    "MADAGASCAR": {
        "lat": -18.766947,
        "long": 46.869107
    },
    "MARSHALL ISLANDS": {
        "lat": 7.131474,
        "long": 171.184478
    },
    "MACEDONIA [FYROM]": {
        "lat": 41.608635,
        "long": 21.745275
    },
    "MALI": {
        "lat": 17.570692,
        "long": -3.996166
    },
    "MYANMAR [BURMA]": {
        "lat": 21.913965,
        "long": 95.956223
    },
    "MONGOLIA": {
        "lat": 46.862496,
        "long": 103.846656
    },
    "MACAU": {
        "lat": 22.198745,
        "long": 113.543873
    },
    "NORTHERN MARIANA ISLANDS": {
        "lat": 17.33083,
        "long": 145.38469
    },
    "MARTINIQUE": {
        "lat": 14.641528,
        "long": -61.024174
    },
    "MAURITANIA": {
        "lat": 21.00789,
        "long": -10.940835
    },
    "MONTSERRAT": {
        "lat": 16.742498,
        "long": -62.187366
    },
    "MALTA": {
        "lat": 35.937496,
        "long": 14.375416
    },
    "MAURITIUS": {
        "lat": -20.348404,
        "long": 57.552152
    },
    "MALDIVES": {
        "lat": 3.202778,
        "long": 73.22068
    },
    "MALAWI": {
        "lat": -13.254308,
        "long": 34.301525
    },
    "MEXICO": {
        "lat": 23.634501,
        "long": -102.552784
    },
    "MALAYSIA": {
        "lat": 4.210484,
        "long": 101.975766
    },
    "MOZAMBIQUE": {
        "lat": -18.665695,
        "long": 35.529562
    },
    "NAMIBIA": {
        "lat": -22.95764,
        "long": 18.49041
    },
    "NEW CALEDONIA": {
        "lat": -20.904305,
        "long": 165.618042
    },
    "NIGER": {
        "lat": 17.607789,
        "long": 8.081666
    },
    "NORFOLK ISLAND": {
        "lat": -29.040835,
        "long": 167.954712
    },
    "NIGERIA": {
        "lat": 9.081999,
        "long": 8.675277
    },
    "NICARAGUA": {
        "lat": 12.865416,
        "long": -85.207229
    },
    "NETHERLANDS": {
        "lat": 52.132633,
        "long": 5.291266
    },
    "NORWAY": {
        "lat": 60.472024,
        "long": 8.468946
    },
    "NEPAL": {
        "lat": 28.394857,
        "long": 84.124008
    },
    "NAURU": {
        "lat": -0.522778,
        "long": 166.931503
    },
    "NIUE": {
        "lat": -19.054445,
        "long": -169.867233
    },
    "NEW ZEALAND": {
        "lat": -40.900557,
        "long": 174.885971
    },
    "OMAN": {
        "lat": 21.512583,
        "long": 55.923255
    },
    "PANAMA": {
        "lat": 8.537981,
        "long": -80.782127
    },
    "PERU": {
        "lat": -9.189967,
        "long": -75.015152
    },
    "FRENCH POLYNESIA": {
        "lat": -17.679742,
        "long": -149.406843
    },
    "PAPUA NEW GUINEA": {
        "lat": -6.314993,
        "long": 143.95555
    },
    "PHILIPPINES": {
        "lat": 12.879721,
        "long": 121.774017
    },
    "PAKISTAN": {
        "lat": 30.375321,
        "long": 69.345116
    },
    "POLAND": {
        "lat": 51.919438,
        "long": 19.145136
    },
    "SAINT PIERRE AND MIQUELON": {
        "lat": 46.941936,
        "long": -56.27111
    },
    "PITCAIRN ISLANDS": {
        "lat": -24.703615,
        "long": -127.439308
    },
    "PUERTO RICO": {
        "lat": 18.220833,
        "long": -66.590149
    },
    "PALESTINIAN TERRITORIES": {
        "lat": 31.952162,
        "long": 35.233154
    },
    "PORTUGAL": {
        "lat": 39.399872,
        "long": -8.224454
    },
    "PALAU": {
        "lat": 7.51498,
        "long": 134.58252
    },
    "PARAGUAY": {
        "lat": -23.442503,
        "long": -58.443832
    },
    "QATAR": {
        "lat": 25.354826,
        "long": 51.183884
    },
    "RÉUNION": {
        "lat": -21.115141,
        "long": 55.536384
    },
    "ROMANIA": {
        "lat": 45.943161,
        "long": 24.96676
    },
    "SERBIA": {
        "lat": 44.016521,
        "long": 21.005859
    },
    "RUSSIA": {
        "lat": 61.52401,
        "long": 105.318756
    },
    "RWANDA": {
        "lat": -1.940278,
        "long": 29.873888
    },
    "SAUDI ARABIA": {
        "lat": 23.885942,
        "long": 45.079162
    },
    "SOLOMON ISLANDS": {
        "lat": -9.64571,
        "long": 160.156194
    },
    "SEYCHELLES": {
        "lat": -4.679574,
        "long": 55.491977
    },
    "SUDAN": {
        "lat": 12.862807,
        "long": 30.217636
    },
    "SWEDEN": {
        "lat": 60.128161,
        "long": 18.643501
    },
    "SINGAPORE": {
        "lat": 1.352083,
        "long": 103.819836
    },
    "SAINT HELENA": {
        "lat": -24.143474,
        "long": -10.030696
    },
    "SLOVENIA": {
        "lat": 46.151241,
        "long": 14.995463
    },
    "SVALBARD AND JAN MAYEN": {
        "lat": 77.553604,
        "long": 23.670272
    },
    "SLOVAKIA": {
        "lat": 48.669026,
        "long": 19.699024
    },
    "SIERRA LEONE": {
        "lat": 8.460555,
        "long": -11.779889
    },
    "SAN MARINO": {
        "lat": 43.94236,
        "long": 12.457777
    },
    "SENEGAL": {
        "lat": 14.497401,
        "long": -14.452362
    },
    "SOMALIA": {
        "lat": 5.152149,
        "long": 46.199616
    },
    "SURINAME": {
        "lat": 3.919305,
        "long": -56.027783
    },
    "SÃO TOMÉ AND PRÍNCIPE": {
        "lat": 0.18636,
        "long": 6.613081
    },
    "EL SALVADOR": {
        "lat": 13.794185,
        "long": -88.89653
    },
    "SYRIA": {
        "lat": 34.802075,
        "long": 38.996815
    },
    "SWAZILAND": {
        "lat": -26.522503,
        "long": 31.465866
    },
    "TURKS AND CAICOS ISLANDS": {
        "lat": 21.694025,
        "long": -71.797928
    },
    "CHAD": {
        "lat": 15.454166,
        "long": 18.732207
    },
    "FRENCH SOUTHERN TERRITORIES": {
        "lat": -49.280366,
        "long": 69.348557
    },
    "TOGO": {
        "lat": 8.619543,
        "long": 0.824782
    },
    "THAILAND": {
        "lat": 15.870032,
        "long": 100.992541
    },
    "TAJIKISTAN": {
        "lat": 38.861034,
        "long": 71.276093
    },
    "TOKELAU": {
        "lat": -8.967363,
        "long": -171.855881
    },
    "TIMOR-LESTE": {
        "lat": -8.874217,
        "long": 125.727539
    },
    "TURKMENISTAN": {
        "lat": 38.969719,
        "long": 59.556278
    },
    "TUNISIA": {
        "lat": 33.886917,
        "long": 9.537499
    },
    "TONGA": {
        "lat": -21.178986,
        "long": -175.198242
    },
    "TURKEY": {
        "lat": 38.963745,
        "long": 35.243322
    },
    "TRINIDAD AND TOBAGO": {
        "lat": 10.691803,
        "long": -61.222503
    },
    "TUVALU": {
        "lat": -7.109535,
        "long": 177.64933
    },
    "TAIWAN*": {
        "lat": 23.69781,
        "long": 120.960515
    },
    "TANZANIA": {
        "lat": -6.369028,
        "long": 34.888822
    },
    "UKRAINE": {
        "lat": 48.379433,
        "long": 31.16558
    },
    "UGANDA": {
        "lat": 1.373333,
        "long": 32.290275
    },
    "U.S. MINOR OUTLYING ISLANDS": {
        "lat": null,
        "long": null
    },
    "US": {
        "lat": 37.09024,
        "long": -95.712891
    },
    "URUGUAY": {
        "lat": -32.522779,
        "long": -55.765835
    },
    "UZBEKISTAN": {
        "lat": 41.377491,
        "long": 64.585262
    },
    "VATICAN CITY": {
        "lat": 41.902916,
        "long": 12.453389
    },
    "SAINT VINCENT AND THE GRENADINES": {
        "lat": 12.984305,
        "long": -61.287228
    },
    "VENEZUELA": {
        "lat": 6.42375,
        "long": -66.58973
    },
    "BRITISH VIRGIN ISLANDS": {
        "lat": 18.420695,
        "long": -64.639968
    },
    "U.S. VIRGIN ISLANDS": {
        "lat": 18.335765,
        "long": -64.896335
    },
    "VIETNAM": {
        "lat": 14.058324,
        "long": 108.277199
    },
    "VANUATU": {
        "lat": -15.376706,
        "long": 166.959158
    },
    "WALLIS AND FUTUNA": {
        "lat": -13.768752,
        "long": -177.156097
    },
    "SAMOA": {
        "lat": -13.759029,
        "long": -172.104629
    },
    "KOSOVO": {
        "lat": 42.602636,
        "long": 20.902977
    },
    "YEMEN": {
        "lat": 15.552727,
        "long": 48.516388
    },
    "MAYOTTE": {
        "lat": -12.8275,
        "long": 45.166244
    },
    "SOUTH AFRICA": {
        "lat": -30.559482,
        "long": 22.937506
    },
    "ZAMBIA": {
        "lat": -13.133897,
        "long": 27.849332
    },
    "ZIMBABWE": {
        "lat": -19.015438,
        "long": 29.154857
    }
}