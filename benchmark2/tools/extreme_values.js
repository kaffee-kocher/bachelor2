"use strict";

// Results
var hight_point_difference = {
  'time': 0,
  'value': 0
};

var low_point_difference = {
  'time': 0,
  'value': 99999999
};

var hight_point_collision = {
  'time': 0,
  'value': 0
};

var low_point_collision = {
  'time': 0,
  'value': 99999999
};

var calc = {
  'differences': [],
  'collisions': [],
  'sum': {
    'differences': 0,
    'collisions': 0
  },
  'average': {
    'differences': 0,
    'collisions': 0
  },
  'variance': {
    'differences': 0,
    'collisions': 0,
    'helper_diff':0,
    'helper_coll':0,
  }
};

// Save file in string
var file_in_string = read( file );

// Extract lines from string
var lines = file_in_string.match( /(\d+) (\d+\.\d+) (\d+) (\d+)/g );
var lines_length = lines.length;

// Extract times from lines
for( var j = 0; j < lines_length; j++ ) {
    var matched = lines[j].match( /(\d+) (\d+\.\d+) (\d+) (\d+)/ );
    
    calc.sum.differences += +matched[2];
    calc.sum.collisions += +matched[3];
    
    calc.differences.push(+matched[2]);
    calc.collisions.push(+matched[3]);
    
    if(matched[2] > hight_point_difference.value) {
      hight_point_difference.time =  +matched[1];
      hight_point_difference.value = +matched[2];
    }
    else if(matched[2] < low_point_difference.value) {
      low_point_difference.time =  +matched[1];
      low_point_difference.value = +matched[2];
    }
    
    if(matched[3] > hight_point_collision.value) {
      hight_point_collision.time =  +matched[1];
      hight_point_collision.value = +matched[3];
    }
    else if(matched[3] < low_point_collision.value) {
      low_point_collision.time =  +matched[1];
      low_point_collision.value = +matched[3];
    }
}

calc.average.differences = calc.sum.differences/lines_length;
calc.average.collisions = calc.sum.collisions/lines_length;

for( j = 0; j < lines_length; j++ ) {
 calc.variance.helper_diff += (calc.average.differences - calc.differences[j]) * (calc.average.differences - calc.differences[j]);
 calc.variance.helper_coll += (calc.average.collisions - calc.collisions[j]) * (calc.average.collisions - calc.collisions[j]);
}

calc.variance.differences = calc.variance.helper_diff/calc.differences.length;
calc.variance.collisions = calc.variance.helper_coll/calc.collisions.length;

print(' ### DIFFERENCE ###');

print('\n average');
print(calc.average.differences);

print('\n variance');
print(calc.variance.differences);

print('\n hight point');
print(hight_point_difference.time, hight_point_difference.value);

print('\n low point');
print(low_point_difference.time, low_point_difference.value);

print('\n standard devitation');
print(Math.sqrt(calc.variance.differences));

////////////////////////////////////////
print('\n #### COLLISIONS ###');

print('\n average');
print(calc.average.collisions);

print('\n variance');
print(calc.variance.collisions);

print('\n hight point');
print(hight_point_collision.time, hight_point_collision.value);

print('\n low point');
print(low_point_collision.time, low_point_collision.value);

print('\n standard devitation');
print(Math.sqrt(calc.variance.collisions));