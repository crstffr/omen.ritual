import { Player } from 'midi-player-js'



export class MyPlayer {

  constructor () {

    const player = new Player(function(event) {
      console.log(event);
    });

    // Load a MIDI file
    player.loadFile('./midi/01.mid');

    console.log(player.getFormat());

    //Player.play();
  }

}
