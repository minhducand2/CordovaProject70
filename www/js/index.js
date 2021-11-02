/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

function warningEmptyFill() {
    alert('Please fill in property name, bedroom, date, monthly rent price and reporter name');
}

function addPropertyToDatabase(property, bedroom, date, monthly_rent, furniture_types, note, reporter) {
    if(property === '' || bedroom === '' || date === '' || monthly_rent === '' || reporter === '') {
        warningEmptyFill();
        return;
    }
    var curDate = new Date();
    var indexTime = curDate.getTime();

    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('CREATE TABLE IF NOT EXISTS PropertiesTable (id, property, bedroom, date, monthly_rent, furniture_types, note, reporter, image)');
        tr.executeSql('INSERT INTO PropertiesTable VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)', [indexTime, property, bedroom, date, monthly_rent, furniture_types, note, reporter, ""]);
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        window.location.href='home.html'
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function readPropertyListFromStorage() {
    await sleep(500);
    readDatabaseProperty()
}



function deletePropertyByPropertyId (id) {
    event.stopPropagation();
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('DELETE FROM PropertiesTable WHERE id LIKE '+ id, [], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        readDatabaseProperty();
    });
}

function onEditClick(id, property, bedroom, date, monthly_rent, furniture_types, reporter) {
    event.stopPropagation();
    window.location.href='edit.html?id='+id+'&property='+ property + '&bedroom='+ bedroom + '&date='+ date + '&monthly_rent='+ monthly_rent + '&furniture_types='+ furniture_types + '&reporter=' + reporter;
}

function readDatabaseProperty() {
    var properties = [];
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql("SELECT * FROM PropertiesTable", [], function(tx, results) {
        var i;
        for(i = 0; i < results.rows.length ; i++) {
            var property = {
                id : results.rows.item(i).id,
                property : results.rows.item(i).property,
                bedroom : results.rows.item(i).bedroom,
                date : results.rows.item(i).date,
                monthly_rent : results.rows.item(i).monthly_rent,
                furniture_types : results.rows.item(i).furniture_types,
                note : results.rows.item(i).note,
                reporter : results.rows.item(i).reporter,
            };
            properties.push(property);
        }

        document.getElementById('list_rent').innerHTML = properties.map(property =>
            `<div class="activity" onclick="window.location.href='details.html?id=${property.id}'">
                <span class="date">${property.date}</span>
                <p class="activity_name">${property.property}</p>
                <p class="reporter">${property.reporter}</p>
                <div class="group_btn">
                    <button class="delete_btn" id="btn_delete_item" onclick="event.stopPropagation(); deletePropertyByPropertyId(${property.id})">DELETE</button>
                    <button class="edit_btn" id="btn_edit_item" onclick="event.stopPropagation(); onEditClick('${property.id}','${property.property}','${property.bedroom}','${property.date}','${property.monthly_rent}','${property.furniture_types}','${property.reporter}')">EDIT</button>
                </div>
            </div>`
        ).join('');

    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}

function updateProperty(id, property, bedroom, date, monthly_rent, furniture_types, reporter) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('UPDATE PropertiesTable SET property = ?, bedroom = ?, date = ?, monthly_rent = ?, furniture_types = ?, reporter = ?  WHERE id = '+ id, [property, bedroom, date, monthly_rent, furniture_types, reporter], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        window.location.href='home.html';
    });
}

async function readPropertyDetailFromDatabase(id) {
    await sleep(500);
    readDatabaseDetailProperty(id)
}

function readDatabaseDetailProperty(id) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql('SELECT * FROM PropertiesTable WHERE id LIKE ' + id, [], function(tx, results) {
        if(results.rows.item(0).image === '') {

        } else {
            document.getElementById("image_property").src = "data:image/jpeg;base64," +  results.rows.item(0).image;
        }
        document.getElementById("property").innerHTML = results.rows.item(0).property;
        document.getElementById("bedroom").innerHTML = results.rows.item(0).bedroom;
        document.getElementById("date").innerHTML = results.rows.item(0).date;
        document.getElementById("monthly_rent").innerHTML = results.rows.item(0).monthly_rent;
        document.getElementById("furniture_types").innerHTML = results.rows.item(0).furniture_types;

        document.getElementById("reporter").innerHTML = results.rows.item(0).reporter;
        if(results.rows.item(0).note === '') {
            document.getElementById("note").innerHTML = 'Add note!';
        } else {
            document.getElementById("note").innerHTML = "'" + results.rows.item(0).note + "'";
        }
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}

function searchByName(keyword) {
    var properties = [];
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('SELECT * FROM PropertiesTable WHERE property LIKE \'' + keyword + '\'', [], function(tx, results) {
            var i;
            for(i = 0; i < results.rows.length ; i++) {
                var property = {
                    id : results.rows.item(i).id,
                    property : results.rows.item(i).property,
                    bedroom : results.rows.item(i).bedroom,
                    date : results.rows.item(i).date,
                    monthly_rent : results.rows.item(i).monthly_rent,
                    furniture_types : results.rows.item(i).furniture_types,
                    note : results.rows.item(i).note,
                    reporter : results.rows.item(i).reporter,
                };
                properties.push(property);
            }
            document.getElementById('list_rent').innerHTML = properties.map(property =>
                `<div class="activity" onclick="window.location.href='details.html?id=${property.id}'">
                    <span class="date">${property.date}</span>
                    <p class="activity_name">${property.property}</p>
                    <p class="reporter">${property.reporter}</p>
                    <div class="group_btn">
                        <button class="delete_btn" id="btn_delete_item" onclick="event.stopPropagation(); deletePropertyByPropertyId(${property.id})">DELETE</button>
                        <button class="edit_btn" id="btn_edit_item" onclick="event.stopPropagation(); onEditClick('${property.id}','${property.property}','${property.bedroom}','${property.date}','${property.monthly_rent}','${property.furniture_types}','${property.reporter}')">EDIT</button>
                    </div>
                </div>`
            ).join('');
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('Read database OK');
        }
    );
}

function checkDuplicate(property, bedroom, date, furniture_types) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('SELECT * FROM PropertiesTable WHERE property LIKE \'' + property + '\'', [], function(tx, results) {
            var i;
            for(i = 0; i < results.rows.length ; i++) {
				if (property === results.rows.item(i).property && bedroom === results.rows.item(i).bedroom && date === results.rows.item(i).date && furniture_types === results.rows.item(i).furniture_types) {
					return true;
				}
            }
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('Read database OK');
        }
    );
	return false;
}

function addNoteToPropertyById(id, note) {
    var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('UPDATE PropertiesTable SET note = ?  WHERE id = '+ id, [note], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        document.getElementById("addNoteContainer").style.display = "none";
        document.getElementById("showDetails").style.display = "block";
        readDatabaseDetailProperty(id);
    });
}

function onPickPhoto(id) {
    navigator.camera.getPicture(onPickImageSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
     });
  
     function onPickImageSuccess(imageURL) {
        var db = window.sqlitePlugin.openDatabase({name: 'properties.db', location: 'default'});
        db.transaction(function(tr) {
            tr.executeSql('UPDATE PropertiesTable SET image = ?  WHERE id = '+ id, [imageURL], function(tx, results) {
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            var image = document.getElementById('image_property');
            image.src = "data:image/jpeg;base64," + imageURL;
        });
     }
  
     function onFail(message) {
     }
}

