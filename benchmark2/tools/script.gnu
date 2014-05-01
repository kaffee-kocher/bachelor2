set term png size 480, 289
set output filename.'.png'
set title graphTitle
set ylabel "Durchlauf/Kollisionen [Millisekunden]"
set xlabel "Messzeit [Millisekunde]"
plot filename using 1:2 with lines title description
