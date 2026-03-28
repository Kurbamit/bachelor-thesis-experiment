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

    var data = {"OkPercent": 93.15730754927482, "KoPercent": 6.842692450725177};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6409445890665675, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6701112877583466, 500, 1500, "GET Cart"], "isController": false}, {"data": [0.04, 500, 1500, "POST Create Cart"], "isController": false}, {"data": [0.7531531531531531, 500, 1500, "PUT Update Quantity"], "isController": false}, {"data": [0.7087542087542088, 500, 1500, "POST Add Item"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE Cart (purchase)"], "isController": false}, {"data": [0.18529411764705883, 500, 1500, "POST Add Item (seed)"], "isController": false}, {"data": [0.7761904761904762, 500, 1500, "DELETE Remove Item"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2689, 184, 6.842692450725177, 7116.9360357010055, 32, 90197, 155.0, 16193.0, 65855.0, 89942.9, 10.077048762572888, 3.2371331950971354, 3.0042680309000764], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Cart", 629, 35, 5.5643879173290935, 4214.373608903021, 32, 90144, 137.0, 3893.0, 9645.0, 89366.4, 2.368972114674822, 1.6481984018853852, 0.5367202447310143], "isController": false}, {"data": ["POST Create Cart", 200, 30, 15.0, 45642.329999999994, 76, 88582, 52936.5, 74679.3, 80106.09999999999, 87728.98000000003, 1.9360709376391552, 0.6073855358560337, 0.5010339828851329], "isController": false}, {"data": ["PUT Update Quantity", 555, 30, 5.405405405405405, 2031.2774774774764, 45, 90083, 122.0, 3028.4, 3472.0, 89903.59999999999, 2.1016358679188123, 0.20856605952741594, 0.5767184364113148], "isController": false}, {"data": ["POST Add Item", 594, 39, 6.565656565656566, 2627.6414141414134, 52, 90144, 147.0, 3462.0, 3976.0, 89769.59999999999, 3.3226122220668435, 1.1160753303733744, 1.3822586001957768], "isController": false}, {"data": ["DELETE Cart (purchase)", 16, 0, 0.0, 82.0625, 56, 157, 72.0, 156.3, 157.0, 157.0, 11.619462599854756, 1.1347131445170662, 2.8821713870733476], "isController": false}, {"data": ["POST Add Item (seed)", 170, 20, 11.764705882352942, 23358.31764705883, 78, 90197, 6302.5, 79049.8, 89982.05, 90127.42, 0.9767869455297633, 0.3167487538784188, 0.40635863163640545], "isController": false}, {"data": ["DELETE Remove Item", 525, 30, 5.714285714285714, 1329.0076190476204, 37, 90081, 124.0, 1786.4, 3332.099999999996, 59475.02000000065, 1.9844944831053368, 0.1971205457548828, 0.5038755523509645], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 184, 100.0, 6.842692450725177], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2689, 184, "500/Internal Server Error", 184, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET Cart", 629, 35, "500/Internal Server Error", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create Cart", 200, 30, "500/Internal Server Error", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT Update Quantity", 555, 30, "500/Internal Server Error", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Add Item", 594, 39, "500/Internal Server Error", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add Item (seed)", 170, 20, "500/Internal Server Error", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Remove Item", 525, 30, "500/Internal Server Error", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
