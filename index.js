
/**
 * @name Voyage 3
 * @title Lab Boss 2
 * @author ZZKer
 * @desc Lab Boss-Stage 2
 * @version 1.03b
 *  You can find the Version Change Log at the bottom
 * 
 * Messing around with the Chords program,
 * I ended up making some boss music.
 * 
 *  Thank you to grifdail who featured my 
 * song in the position module. Expect a
 * version of this song that uses positional
 * audio in the future.
 * You can find that module at:
 *      'grifdail/position'
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
//Sequencer to line up song events easier
import { Sequencer, emptyfunk } from 'zzker/sequencer';

//for Debugging only
import Debug from 'debug';
var debug = new Debug('Lab Boss');
debug('- Stage 2');

//~VOLUME~
var v = 0.2;


//basic chords that play in the background
var baseb = oct(6);
var basec = Chord(Tri, 20);
var basep = ['F9','Amin','Bmaj7','Bmaj11','Bmin11','Bbmin11','Bmaj6','Ebmaj9'].map(Chords);
var basev = [1.25,0.8,0.92,2.2,2.2,2.5,0.9,1.7];

//Sequencer
function backing(t) {
  //background notes
  var c = basep[(t/4)%8|0];
  var vol = Math.abs(Math.sin(t*Math.PI/44))*0.45 + basev[(t/4)%8|0];//osc.ing volume
  return basec(c.map(note).map(baseb), 0.2) * vol;
}

function backingout(t) {
  return backing(t) * (42-t) / 42;
}

var baseseq = new Sequencer();
baseseq.add(backing, 352);//main
baseseq.add(backingout, 42);//fade out
baseseq.add(emptyfunk, 40);//silent part



//urgent notes that play over top the background
var upperb = oct(6);
//  var upperb2 = oct(3);//for future idea
var upperc = Chord(Saw, 50);
var upperp = ['B5','D5','F5','G5','Eb5','E5','D5','C5'].map(Chords);

//Sequencer
function urgent(t) {
  var c = upperp[(t*8)%8|0];
  return upperc(c.map(note).map(upperb), 0.2) *  0.43;
}

function urgentin(t) {
  return urgent(t) * t / 24;
}

function urgentout(t) {
  return urgent(t) * (42-t) / 42;
}

var upperseq = new Sequencer();
upperseq.add(urgentin, 24);//fade in
upperseq.add(urgent, 328);//main
upperseq.add(urgentout, 42);//fade out
upperseq.add(emptyfunk, 40);//silent part


//high hats and drums
function hatstart(t) {
  return (noise() * envelope(t, 1/8, 100, 16)
        + noise() * envelope(t+1/8, 1/4, 100, 16)
        + noise() * envelope(t+1/4, 1/2, 100, 16)
          ) * 0.24;
}

function hatmain(t) {
  return ((noise() * envelope(t, 1/2, 100, 16)
         + noise() * envelope(t+1/8, 1/4, 97, 16)
         + noise() * envelope(t+2/8, 1/8, 105, 16)
         + noise() * envelope(t+3/8, 1/8, 110, 16)
         + noise() * envelope(t+4/8, 1/4, 100, 16)
         + noise() * envelope(t+4/8, 1/4, 16, 10)) * 0.8//high-hats
         +(sin(t,80) * envelope(t, 1/2, 100, 16)
         + sin(t,70) * envelope(t+3/8, 1/4, 100, 16)
         + sin(t,70) * envelope(t+2/8, 1/4, 100, 16)
         + sin(t,70) * envelope(t+4/8, 1/4, 100, 16)
         + sin(t,80) * envelope(t+18/24, 1/2, 100, 16)) * 2//drums
         ) * 0.3;
}

var hatseq = new Sequencer();
hatseq.add(emptyfunk, 16);
hatseq.add(hatstart, 16);//intro
hatseq.add(hatmain, 64);//main part
hatseq.add(emptyfunk, 8);//break
hatseq.add(hatstart, 8);
hatseq.add(hatmain, 44);//more main part
hatseq.add(function(t){
    return hatmain(t) * Math.abs(Math.sin((t+60)*Math.PI/120));
  }, 180);//fluctuate opposite machine noise
hatseq.add(emptyfunk, 16);
hatseq.add(function(t){
    return hatmain(t) * (42-t) / 42;
  }, 42);//fade out
hatseq.add(emptyfunk, 40);//silent part



//machine noises used to create ambiance
function machine(t) {
  return layOsc(t, 130, 120, 1) * 0.25;
}

var machseq = new Sequencer();
machseq.add(emptyfunk, 60);//no intro
machseq.add(function(t){
    return machine(t) * t / 36;
  }, 36);//fade in after a minute
machseq.add(function(t){
    return machine(t) * Math.abs(Math.sin((t+60)*Math.PI/120));
  }, 240);//osc.ing volume opposite hats
machseq.add(machine, 68);//sustain volume till end
machseq.add(function(t){
    return machine(t) * (t+30) / 30;
  }, 30);//scary part



//our main function
export function dsp(t) {
  //background notes
  var final = baseseq.simpleplay(t);
  
  //urgent notes
  final += upperseq.simpleplay(t);
  
  //high hats and drums
  final += hatseq.simpleplay(t);
  
  //machine noises using layered osc
  final += machseq.simpleplay(t);
  
  return v * final;
}

//Thank you, cheery, for explaining what this does
//Thank you, stagas, for letting me copy it over from the example
//(it's for octives)
function oct(x){
  return function(y){
    return x * y;
  };
}

/**
 * CHANGE LOG
 * v1.03:
 *  - Changed drum part to be more interesting
 *  - Changed drum volume from .5 to 2
 *  - Changed most oscs
 *  - Added Sequencer for better managing sequence changes
 *  - Added full loop (aprox. length = 7:14)
 *  - Added more comments
 *  - noted that Math.pi is actually Math.PI (many hour mistake)
 *  - Took over 12 hours to make Sequencer work
 *    There is a bug where wavepot doesn't reload newly updated code elsewhere
 * b:
 *  - Changed .play to .simpleplay functions for Sequencers
 * 
 * v1.02:
 *  - Fixed comment on oct function. Sorry, cheery.
 *    (love that new track you're working on, btw)
 *  - Fixed some spelling errors
 *  - Changed volumes to make up for additions
 *    - backing notes from .3 to .45
 *    - urgent note from .33 to .43
 *    - machine noise from .2 to .25
 *  - Added high-hats and barely audible drum
 * b:
 *  - Fixed more spelling mistakes
 *  - Added a thank you to grifdail
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
