// Read all files
"use strict";

var results = [];
var count_files = files.length;
var global_collisions = 0;

for( var i = 0; i < count_files; i++ ) {
    // Save file in string
    var file_in_string = read( directory + files[i] );

    // Extract lines from string
    var lines = file_in_string.match( /(\d+\.\d+) (\d+\.\d+) (\d+)/g );
    var lines_length = lines.length;

    // Extract times from lines
    for( var j = 0; j < lines_length; j++ ) {
        var matched = lines[j].match( /(\d+\.\d+) (\d+\.\d+) (\d+)/ );
        
        if (matched[1] < start_time) {
          continue;
        }
        
        results.push( {
            'time':       matched[1],
            'difference': matched[2],
            'collisions': matched[3],
        } );
    }
}

var deepCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

var average = [];
var max = end_time*1000;
for( var time = 0; time < max; time += 100 ) {
    var end = time + 100;
    average = [];
    
    if( results.length <= 0) {
      break; 
    }

    for( i = 0; i < results.length; i++ ) {
        if( results[i].time >= time && results[i].time <= end ) {
            average.push( deepCopy(results[i]));
            results.splice( i, 1 );
            i--;
        }
    }

    var sum_difference = 0;
    var sum_collisions = 0;
    for( j = 0; j < average.length; j++ ) {
      sum_difference += +average[j].difference;
      sum_collisions += +average[j].collisions;
    }

    var average_collision = (sum_collisions/count_files);
    global_collisions += +average_collision;
    if( sum_difference > 0 ) {
        print(time, (sum_difference/average.length), average_collision, global_collisions);
    }
}
