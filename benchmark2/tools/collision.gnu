set term png size 480, 289
set output filename.'.collision.png'
set title graphTitle
set ylabel "Anzahl der Kollisionen"
set xlabel "Messzeit [Millisekunde]"
plot filename using 1:3 with lines title description
