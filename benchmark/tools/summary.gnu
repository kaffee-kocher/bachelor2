reset

### V8 ###
plot "./results/v8/average.dat"
Y_MAX_V8=GPVAL_DATA_Y_MAX
Y_MIN_V8=GPVAL_DATA_Y_MIN
Y_LENGTH_V8=Y_MAX_V8-Y_MIN_V8
X_MAX_V8=endTime*1000
X_MIN_V8=startTime
X_LENGTH_V8=X_MAX_V8-X_MIN_V8

### DartVM ###
plot "./results/dart/average.dat"
Y_MAX_DART=GPVAL_DATA_Y_MAX
Y_MIN_DART=GPVAL_DATA_Y_MIN
Y_LENGTH_DART=Y_MAX_DART-Y_MIN_DART
X_MAX_DART=X_MAX_V8
X_MIN_DART=X_MIN_V8
X_LENGTH_DART=X_MAX_DART-X_MIN_DART



### Main ###
set term png size 480, 289
set output './results/summary.png'
set xrange [X_MIN_V8:X_MAX_V8]
set title 'Durschnittlich benötigte Zeit je Durchlauf'
set ylabel "Durchlaufs/Kollisionen [Millisekunden]"
set xlabel "Messzeit [Millisekunden]"
set key at first X_MAX_V8, first 0.4
plot "./results/v8/average.dat" using 1:2 with lines title 'V8 Engine', "./results/dart/average.dat" using 1:2 with lines title 'DartVM',\
     "./results/v8/average.dat" u (X_MAX_V8+0.1*X_LENGTH_V8):($2):(1.1*X_LENGTH_V8) smooth unique w xerrorbars linecolor rgb "#808000" notitle,\
     Y_MAX_V8 w l lt 3 notitle,\
     Y_MIN_V8 w l lt 3 notitle
#     "./results/dart/average.dat" u (X_MAX_DART+0.1*X_LENGTH_DART):($2):(1.1*X_LENGTH_DART) smooth unique w xerrorbars notitle,\
#     Y_MAX_DART w l lt 3 notitle,\
#     Y_MIN_DART w l lt 3 notitle



     
#plot "./results/v8/average.dat" with lines title 'V8 Engine', "./results/dart/average.dat" with lines title 'DartVM'
