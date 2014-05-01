#!/bin/bash

function v8_compiler {
  /home/tobias/Documents/v8/out/x64.release/d8 --allow_natives_syntax -e "end_time=${1}" $2
}

function dart_compiler {
  /home/tobias/Documents/dart/dart-sdk/bin/dart $2 $1
}


 while :
 do
    case $1 in
        -h | --help | -\?)
            echo -e "Usage: run_benchmark [OPTION...]\n"
            echo -e "\t-n, --number\t Number of the runs (default is 8)"
            echo -e "\t-t, --time\t Time of the runs in seconds (default is 30)"
            echo ""
            echo "Report bugs to tlang.mmt-b2011@fh-salzburg.ac.at"
            exit 0
            ;;
        -n | --number)
            if [[ $2 =~ ^[0-9]+$ ]];
              then
                number=$2
              else
                echo "-n, --number Must be an integer."
                exit 1
            fi
            shift 2
            ;;
        -t | --time)
            if [[ $2 =~ ^[0-9]+$ ]];
              then
                time=$2
              else
                echo "-t, --time Must be an integer."
                exit 1
            fi
            shift 2
            ;;
        --)
            shift
            break
            ;;
        -*)
            echo -e "Usage: run_benchmark [OPTION...]\n"
            echo -e "\t-n, --number\t Number of the runs (default is 8)"
            echo -e "\t-t, --time\t Time of the runs in seconds (default is 30)"
            echo ""
            echo "Report bugs to tlang.mmt-b2011@fh-salzburg.ac.at"
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

if [[ -z "$number" ]]; then
    number=8
fi

if [[ -z "$time" ]]; then
    time=30
fi

save_number=$number
startTime=1000

for file in benchmark/*.*; do
  echo -e "\n******************************"
  fileend=${file#*.}
  filename=$(echo $file | sed s/"benchmark\/"//)
  number=$save_number
  
  if [[ $fileend = "js" ]]
    then
      filetype="JavaScript"
      ticsY=0.2
      compiler=v8_compiler
      filename=${filename%.js}
    elif [[ $fileend = "dart" ]]
    then
      filetype="Dart"
      ticsY=0.02
      compiler=dart_compiler
      filename=${filename%.dart}
    else
      filetype="Script"
      ticsY="default"
      compiler=v8_compiler
      filename=${file%.js}
  fi
  
  echo "Run benchmark '${file}' ${number} times and for ${time} seconds"

  
  if [[ -d results/$filename ]]
    then
      rm -r results/$filename
  fi
  
  mkdir results/$filename
  i=1
  filelist=""
  while [[ "$number" -gt 0 ]]
  do
     dir_path="$(pwd)/results/${filename}/"
     echo "#${i}"
     echo -n -e "\t save memory and cpu usage... "
     usage_path="${dir_path}usage_${i}.txt"
     cat /proc/meminfo > $usage_path && iostat >> $usage_path && echo "ok"
     
     echo -n -e "\t run benchmark... "
     if [[ $i -eq 1 ]]
      then
        filelist="'${filename}_${i}.dat'"
      else
        filelist="${filelist}, '${filename}_${i}.dat'"
    fi
    
     path="$(pwd)/results/${filename}/${filename}_${i}.dat"
     $compiler $time $file > $path && echo "ok"
     
     echo -n -e "\t render graph... "
     gnuplot -e "filename='${path}'; description='Durchlauf #${i}'; graphTitle='Anzahl der Kollisionen [${filetype}]'" tools/collision.gnu
     gnuplot -e "filename='${path}'; description='Durchlauf #${i}'; graphTitle='Benötigte Zeit [${filetype}]'" tools/script.gnu && echo "ok"
     
     
     number=$(($number - 1))
     i=$(($i + 1))
     sleep 10
  done
  
  echo "average"
  
  average_path="${dir_path}average.dat"
  
  echo -e -n "\t calculate... "
  d8 -e "files=[${filelist}]; directory='${dir_path}'; end_time=${time}; start_time=${startTime};" tools/average.js > $average_path && echo "ok"
  
  echo -e -n "\t calculate maxima and minima... "
  d8 -e "file='${average_path}'" tools/extreme_values.js >"${dir_path}extremes.dat" && echo "ok"
  
  echo -n -e "\t render graph... "
  gnuplot -e "path='${dir_path}'; graphTitle='Benötigte Zeit [${filetype}]'; filename='${filename}'; endTime='${time}'; startTime=${startTime}; number=${save_number}; ticsY='${ticsY}'" tools/union.gnu
  gnuplot -e "filename='${average_path}'; description='Durchschnitt'; graphTitle='Durchschnittliche Anzahl der Kollisionen [${filetype}]'" tools/collision.gnu
  gnuplot -e "filename='${average_path}'; description='Durchschnitt'; graphTitle='Durchschnittlich benötigte Zeit [${filetype}]'" tools/script.gnu && echo -e "ok"
done

gnuplot -e "endTime='${time}'; startTime=${startTime}" tools/summary_collision.gnu
gnuplot -e "endTime='${time}'; startTime=${startTime}" tools/summary_collision_trend.gnu
gnuplot -e "endTime='${time}'; startTime=${startTime}" tools/summary.gnu
