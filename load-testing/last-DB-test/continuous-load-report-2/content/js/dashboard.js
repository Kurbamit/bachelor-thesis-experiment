/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.30266576199826, "KoPercent": 0.6973342380017491};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.609042642388531, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6126147291921186, 500, 1500, "Remove Item"], "isController": false}, {"data": [0.6029117075540442, 500, 1500, "Create Cart"], "isController": false}, {"data": [0.6106245181187355, 500, 1500, "Add Item"], "isController": false}, {"data": [0.6079943684387721, 500, 1500, "Get Cart"], "isController": false}, {"data": [0.611121633993118, 500, 1500, "Delete Cart"], "isController": false}, {"data": [0.6091979922611925, 500, 1500, "Update Quantity"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 387619, 2703, 0.6973342380017491, 1574.8267061211382, 30, 51421, 369.0, 591.0, 675.0, 931.9900000000016, 427.79729406090627, 13.060798760334341, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Remove Item", 63846, 626, 0.9804842903235912, 1543.6165147386055, 30, 10495, 388.0, 606.0, 699.0, 969.9900000000016, 74.78634480949079, 0.8583471358022378, 0.0], "isController": false}, {"data": ["Create Cart", 65872, 204, 0.30969152295360697, 1714.2963019188485, 30, 51421, 385.0, 605.0, 701.0, 960.0, 72.70263021675476, 3.206153523216787, 0.0], "isController": false}, {"data": ["Add Item", 64850, 411, 0.6337702390131071, 1542.632521202785, 30, 10308, 385.0, 607.0, 706.0, 994.9800000000032, 75.8610847257771, 3.7218248012521467, 0.0], "isController": false}, {"data": ["Get Cart", 65346, 418, 0.6396719003458513, 1552.5931350044325, 30, 10466, 386.0, 603.0, 694.0, 939.9800000000032, 76.38000883654496, 3.3767677473122175, 0.0], "isController": false}, {"data": ["Delete Cart", 63354, 426, 0.6724121602424472, 1543.4255137797027, 32, 10429, 390.0, 612.0, 710.0, 987.9900000000016, 74.27999268385335, 1.6278201862041393, 0.0], "isController": false}, {"data": ["Update Quantity", 64351, 618, 0.9603580363941508, 1548.9617410762612, 30, 10495, 388.0, 615.0, 703.0, 976.0, 75.32361730344469, 0.8632423076146487, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 1326, 49.056603773584904, 0.3420884941140656], "isController": false}, {"data": ["22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 175", 200, 7.3991860895301516, 0.0515970579357565], "isController": false}, {"data": ["22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 103", 396, 14.6503884572697, 0.10216217471279787], "isController": false}, {"data": ["22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 118", 400, 14.798372179060303, 0.103194115871513], "isController": false}, {"data": ["22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 149", 191, 7.066222715501294, 0.04927519032864746], "isController": false}, {"data": ["22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 74", 190, 7.029226785053644, 0.04901720503896868], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 387619, 2703, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 1326, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 118", 400, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 103", 396, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 175", 200, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 149", 191], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Remove Item", 63846, 626, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 103", 396, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 230, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Cart", 65872, 204, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 204, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Item", 64850, 411, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 220, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 149", 191, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Cart", 65346, 418, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 218, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 175", 200, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Cart", 63354, 426, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 236, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_id_not_found&quot;\\n  Position: 74", 190, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Quantity", 64351, 618, "22P02 0/org.postgresql.util.PSQLException: ERROR: invalid input syntax for type uuid: &quot;cart_item_id_not_found&quot;\\n  Position: 118", 400, "null 0/java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object, borrowMaxWaitDuration=PT10S", 218, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
