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

    var data = {"OkPercent": 97.84604519774011, "KoPercent": 2.153954802259887};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.03766478342749529, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0615, 500, 1500, "GET Cart"], "isController": false}, {"data": [0.1625, 500, 1500, "POST Create Cart"], "isController": false}, {"data": [0.003080082135523614, 500, 1500, "PUT Update Quantity"], "isController": false}, {"data": [0.0555, 500, 1500, "POST Add Item"], "isController": false}, {"data": [0.03, 500, 1500, "DELETE Cart (purchase)"], "isController": false}, {"data": [0.1825, 500, 1500, "POST Add Item (seed)"], "isController": false}, {"data": [0.002566735112936345, 500, 1500, "DELETE Remove Item"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8496, 183, 2.153954802259887, 11862.072504708116, 0, 41342, 9086.0, 21629.0, 22878.899999999998, 30031.03, 13.65521231797872, 4.18519139607911, 3.4427807015252823], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Cart", 2000, 53, 2.65, 6602.429999999989, 0, 30328, 6550.5, 9447.0, 10646.349999999991, 30024.0, 3.3339223262776425, 2.4588377149754788, 0.6109152200222039], "isController": false}, {"data": ["POST Create Cart", 200, 2, 1.0, 3822.984999999999, 75, 30845, 2715.5, 7142.5, 8668.199999999995, 30118.880000000016, 1.5745056052399546, 0.4754115118009195, 0.4166904482617458], "isController": false}, {"data": ["PUT Update Quantity", 1948, 34, 1.7453798767967146, 18096.94404517452, 138, 41342, 18851.5, 22591.0, 24248.6, 30218.48, 3.2435366537957537, 0.3184101820909489, 0.7507013544429626], "isController": false}, {"data": ["POST Add Item", 2000, 52, 2.6, 6365.205000000004, 0, 30249, 6296.0, 9312.300000000001, 10057.599999999995, 30016.99, 3.331933921086477, 1.008918702061801, 1.2417636155314768], "isController": false}, {"data": ["DELETE Cart (purchase)", 200, 5, 2.5, 12519.244999999997, 0, 35503, 13060.0, 18888.9, 24254.549999999974, 30870.670000000002, 0.3630231844756765, 0.035752820463253884, 0.07432048866550862], "isController": false}, {"data": ["POST Add Item (seed)", 200, 4, 2.0, 3682.3450000000007, 3, 32890, 2883.0, 7456.900000000001, 8128.95, 30021.42000000007, 1.4778033930365904, 0.449084824067506, 0.5507559657075722], "isController": false}, {"data": ["DELETE Remove Item", 1948, 33, 1.6940451745379876, 18268.550308008205, 150, 40210, 18918.0, 22658.9, 24281.3, 30055.59, 3.1545639155457814, 0.3096284996955554, 0.6654158259354382], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 139, 75.95628415300547, 1.6360640301318268], "isController": false}, {"data": ["405/Method Not Allowed", 22, 12.021857923497267, 0.2589453860640301], "isController": false}, {"data": ["404/Not Found", 22, 12.021857923497267, 0.2589453860640301], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8496, 183, "500/Internal Server Error", 139, "405/Method Not Allowed", 22, "404/Not Found", 22, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET Cart", 2000, 53, "500/Internal Server Error", 33, "405/Method Not Allowed", 20, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create Cart", 200, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT Update Quantity", 1948, 34, "500/Internal Server Error", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Add Item", 2000, 52, "500/Internal Server Error", 32, "404/Not Found", 20, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Cart (purchase)", 200, 5, "500/Internal Server Error", 3, "405/Method Not Allowed", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Add Item (seed)", 200, 4, "500/Internal Server Error", 2, "404/Not Found", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Remove Item", 1948, 33, "500/Internal Server Error", 33, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
