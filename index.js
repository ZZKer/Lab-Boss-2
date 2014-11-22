
/**
 * @name Voyage 3
 * @title Lab Boss 2
 * @author ZZKer
 * @desc Lab Boss-Stage 2
 * @version 1.02
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
//needed for high hats and drum
import { sin, noise } from 'opendsp/osc';
import envelope from 'opendsp/envelope';

//~VOLUME~
var v = 0.2;

//basic chords that play in the background
var baseb = oct(6);
var basec = Chord(Tri, 20);
var basep = ['F9','Amin','Bmaj7','Bmaj11','Bmin11','Bbmin11','Bmaj6','Ebmaj9'].map(Chords);
var basev = [1.25,0.8,0.92,2.2,2.2,2.5,0.9,1.7];

//urgent notes that play over top the background
var upperb = oct(6);
var upperb2 = oct(3);
var upperc = Chord(Saw, 50);
var upperp = ['B5','D5','F5','G5','Eb5','E5','D5','C5'].map(Chords);

export function dsp(t) {
  //background notes
  var c = basep[(t/4)%8|0];
  var vol = Math.abs(Math.sin(t/13))*0.45 + basev[(t/4)%8|0];//osc.ing volume
  var final = basec(c.map(note).map(baseb), 0.2) * vol;
  
  //urgent notes
  c = upperp[(8*t)%8|0];
  if (t < 25){
    vol = 0.43 * t / 25;//fade in
  } else{
    vol = 0.43;
  }
  final += upperc(c.map(note).map(upperb), 0.2) * vol;
  
  //machine noises using layered osc
  if(t < 60){
    final += 0;
  }else if(t < 100){
    final += layOsc(t, 130, 120, 1) * 0.25 * (t-60) / 40;//fade in after a minute
  } else{
    final += layOsc(t, 130, 120, 1) * 0.25 * Math.abs(Math.sin(t/60));//osc.ing volume
  }
  
  //high hats and drums
  if(t < 16){
    final += 0;
  }else if(t < 32){
    final += (noise() * envelope(t, 1/8, 100, 16)
            + noise() * envelope(t+1/8, 1/4, 100, 16)
            + noise() * envelope(t+1/4, 1/2, 100, 16)
            ) * 0.24;//simple high-hats at first
  }else{
    var a = ((noise() * envelope(t, 1/2, 100, 16)
            + noise() * envelope(t+1/8, 1/4, 97, 16)
            + noise() * envelope(t+2/8, 1/8, 105, 16)
            + noise() * envelope(t+3/8, 1/8, 110, 16)
            + noise() * envelope(t+4/8, 1/4, 100, 16)
            + noise() * envelope(t+4/8, 1/4, 16, 10)) * 0.8
          + (sin(t,73) * envelope(t, 1/16, 50, 16)
          +  sin(t,70) * envelope(t+1/16, 1/8, 50, 16)) * 0.5
          ) * 0.3;//then add the complicated stuff and drum
    if(t > 100){
      a *= Math.abs(Math.sin((t-60)/60));//"alternate" between machine and hats
    }
    final += a;
  }
  
  return v * final;
}

//Thank you, cherry, for explaining what this does
//Thank you, stagas, for letting me copy it over from the example
//(it's for octives)
function oct(x){
  return function(y){
    return x * y;
  };
}

/**
 * CHANGE LOG
 * v1.02:
 *  - Fixed comment on oct function. Sorry, Cherry.
 *    (love that new track you're working on, btw)
 *  - Fixed some spelling errors
 *  - Changed volumes to make up for additions
 *    - backing notes from .3 to .45
 *    - urgent note from .33 to .43
 *    - machine noise from .2 to .25
 *  - Added high-hats and barely audible drum
 * 
 * v1.01:
 *  - Fixed volume of backing chords to be consistent
 *  - Changed urgent note fade from 15 to 25 sec.
 *  - Changed urgent note vol. from .4 to .33
 *  - Changed machine noise vol. from .4 to .2
 *  - Changed comment on oct function
 *  - Added change log to bottom of program
 *    (out of the way for people who don't care)
 */
