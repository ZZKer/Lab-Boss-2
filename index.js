
/**
 * @name Voyage 3
 * @title Lab Boss 2
 * @author ZZKer
 * @desc Lab Boss-Stage 2
 * 
 * Messing around with the Chords program,
 * I ended up making some boss music.
 */

//needed for the notes
import note from 'opendsp/note';
import { Saw, Tri } from 'opendsp/wavetable-osc';
import Chord from 'stagas/chord/1.1.0';
import Chords from 'stagas/chords';
//needed for the noise after 1 min.
import { layOsc } from 'zzker/Layered-Osc';

//~VOLUME~
var v = 0.2;

//basic chords that play in the background
var baseb = oct(6);
var basec = Chord(Tri, 20);
var basep = ['F9','Amin','Bmaj7','Bmaj11','Bmin11','Bbmin11','Bmaj6','Ebmaj9'].map(Chords);

//urgent notes that play over top the background
var upperb = oct(6);
var upperc = Chord(Saw, 50);
var upperp = ['B5','D5','F5','G5','Eb5','E5','D5','C5'].map(Chords);

export function dsp(t) {
  //background notes
  var c = basep[(t/4)%8|0];
  var vol = Math.abs(Math.sin(t/13))*0.3 + 1.2;//osc.ing volume
  var final = basec(c.map(note).map(baseb), 0.2) * vol;
  
  //urgent notes
  c = upperp[(8*t)%8|0];
  if (t < 15){
    vol = 0.4 * t / 15;//fade in
  } else{
    vol = 0.4;
  }
  final += upperc(c.map(note).map(upperb), 0.2) * vol;
  
  //machine noises using layered osc
  if(t > 60 && t < 100){
    final += layOsc(t, 130, 120, 1) * 0.4 * (t-60) / 40;//fade in after a minute
  } else if(t > 100){
    final += layOsc(t, 130, 120, 1) * 0.4 * Math.abs(Math.sin(t/60));//osc.ing volume
  }
  
  return v * final;
}

//I don't fully understand how this works
//sorry stagas for straight copying your code from the example
function oct(x){
  return function(y){
    return x * y;
  };
}
