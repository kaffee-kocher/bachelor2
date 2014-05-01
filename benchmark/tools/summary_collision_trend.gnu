set term png size 480, 289
set output './results/summary_collisions_trend.png'
X_MAX=endTime*1000
X_MIN=startTime
set xrange [X_MIN:X_MAX]
set title 'Trend der Kollisionen'
set ylabel "Anzahl der Kollisionen"
set xlabel "Messzeit [Millisekunden]"
set key left top
plot "./results/v8/average.dat" using 1:4 with lines title 'V8 Engine', "./results/dart/average.dat" using 1:4 with lines title 'DartVM'
