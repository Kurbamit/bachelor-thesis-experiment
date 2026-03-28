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

    var data = {"OkPercent": 98.71073605250821, "KoPercent": 1.2892639474917955};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5004688232536334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9175, 500, 1500, "GET Cart"], "isController": false}, {"data": [0.98, 500, 1500, "POST Create Cart"], "isController": false}, {"data": [0.029501525940996948, 500, 1500, "PUT Update Quantity"], "isController": false}, {"data": [0.964, 500, 1500, "POST Add Item"], "isController": false}, {"data": [0.065, 500, 1500, "DELETE Cart (purchase)"], "isController": false}, {"data": [0.965, 500, 1500, "POST Add Item (seed)"], "isController": false}, {"data": [0.023906408952187184, 500, 1500, "DELETE Remove Item"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4266, 55, 1.2892639474917955, 4447.684716361935, 0, 26125, 627.5, 10134.60000000005, 21279.499999999996, 24879.89, 16.27772096643722, 4.969347363694119, 4.101848676528945], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Cart", 1000, 18, 1.8, 197.29500000000013, 0, 15060, 75.0, 593.0, 691.8999999999999, 929.3100000000006, 3.8777726074143013, 2.8504317354486584, 0.7105715352101752], "isController": false}, {"data": ["POST Create Cart", 100, 1, 1.0, 100.57000000000001, 20, 2149, 56.0, 93.30000000000004, 324.49999999999807, 2140.999999999996, 1.3407701383674784, 0.4048366397283599, 0.3548327221656119], "isController": false}, {"data": ["PUT Update Quantity", 983, 5, 0.508646998982706, 9162.12309257377, 107, 25582, 7817.0, 21591.4, 23760.8, 24964.16, 3.7826605610497555, 0.36996412869896483, 0.875479055633586], "isController": false}, {"data": ["POST Add Item", 1000, 17, 1.7, 216.5419999999999, 0, 15061, 147.0, 248.0, 333.94999999999993, 1613.5800000000004, 3.8756685528253625, 1.1798647815576313, 1.44440565411596], "isController": false}, {"data": ["DELETE Cart (purchase)", 100, 1, 1.0, 5438.950000000002, 4, 25155, 4563.5, 8614.500000000002, 16161.899999999918, 25153.29, 0.40966145577294927, 0.040166025546488376, 0.08386858162914167], "isController": false}, {"data": ["POST Add Item (seed)", 100, 2, 2.0, 184.38999999999996, 1, 1487, 156.5, 237.50000000000003, 340.79999999999995, 1479.6099999999963, 1.316083860863614, 0.3999404060776752, 0.49048543341931744], "isController": false}, {"data": ["DELETE Remove Item", 983, 11, 1.1190233977619533, 9136.549338758907, 96, 26125, 7902.0, 21947.8, 24099.799999999996, 25516.199999999997, 3.7659949429162514, 0.36900758323117006, 0.7943895582713969], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 33, 60.0, 0.7735583684950773], "isController": false}, {"data": ["405/Method Not Allowed", 11, 20.0, 0.2578527894983591], "isController": false}, {"data": ["404/Not Found", 11, 20.0, 0.2578527894983591], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4266, 55, "500/Internal Server Error", 33, "405/Method Not Allowed", 11, "404/Not Found", 11, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET Cart", 1000, 18, "405/Method Not Allowed", 10, "500/Internal Server Error", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create Cart", 100, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT Update Quantity", 983, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Add Item", 1000, 17, "404/Not Found", 10, "500/Internal Server Error", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Cart (purchase)", 100, 1, "405/Method Not Allowed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Add Item (seed)", 100, 2, "500/Internal Server Error", 1, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Remove Item", 983, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
