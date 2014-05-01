set term png size 480, 289
set output path.'union.png'
set title graphTitle
set ylabel sprintf("Durchlauf/Kollisionen\n[Millisekunden]")
set xlabel "Messzeit [Millisekunde]"
if (number > 8) set key off; else set key outside bottom center horizontal
set xrange [startTime:(endTime*1000)]
set ytics ticsY

filename(n) = sprintf(path.filename."_%d.dat", n)
plot for [i=1:number] filename(i) using 1:2 with lines title 'Durchlauf #'.i
