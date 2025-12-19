import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('CypherSheet');
  
  sheet = {
    name:null,
    type:null,
    descriptor:null,
    focus:null,
    flavor:null,

    tier: 1,
    effort:1,
    xp:0,

    pools: {
      mig: {curr:null,max:null,edge:null},
      spd:{curr:null,max:null,edge:null},
      int:{curr:null,max:null,edge:null}
    },

    recovery: [false,false,false,false],
    damage: [false,false],

    advancements: [false,false,false,false,false],

    skills: {
      mig: [{name:null,grade:null}],
      spd: [{name:null,grade:null}],
      int: [{name:null,grade:null}],
    },

    attacks: [
      {name:null, mod:null, dmg:null}
    ],

    abilities: [
      null
    ],

    // And artifacts
    cypherLimit: null,
    cyphers: [
      null
    ],

    equipment: null,
    armor: null,
    money: null

  };

  countTrue(arrBool:boolean[]){
    console.log(arrBool.filter(v=>v).length)

    return arrBool.filter(v=>v).length
  }

  upTier() {
    this.sheet.tier++

    this.sheet.advancements = [false,false,false,false,false]
  }

  addAttack() {
    this.sheet.attacks.push({name:null,mod:null,dmg:null})
  }

  removeAttack(index:number) {
    this.sheet.attacks.splice(index,1)
  }

  addCypher() {
    this.sheet.cyphers.push(null)
  }

  removeCypher(index:number) {
    this.sheet.cyphers.splice(index,1)
  }

  moveCypher(index:number,ammount:number) {
    if(ammount < 0 && index == 0) {
      return
    } else if (ammount > 0 && index == this.sheet.cyphers.length-1) {
      return
    }
    [this.sheet.cyphers[index + ammount], this.sheet.cyphers[index]] = [this.sheet.cyphers[index], this.sheet.cyphers[index + ammount]]
  }

  addSkill(type:"mig"|"spd"|"int") {
    switch (type) {
      case "mig":
        this.sheet.skills.mig.push({name:null,grade:null})
        break;
      case "spd":
        this.sheet.skills.spd.push({name:null,grade:null})
        break;
      case "int":
        this.sheet.skills.int.push({name:null,grade:null})
        break;
    
      default:
        break;
    }
  }

  removeSkill(type:"mig"|"spd"|"int",index:number)  {
    switch (type) {
      case "mig":
        this.sheet.skills.mig.splice(index,1)
        break;
      case "spd":
        this.sheet.skills.spd.splice(index,1)
        break;
      case "int":
        this.sheet.skills.int.splice(index,1)
        break;
    
      default:
        break;
    }
  }
  
  ngOnInit(): void {
    const htmlEl = document.documentElement;

    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
  }

  themeToggle(): void {
    console.log('Toggling theme');
    const htmlEl = document.documentElement;

    if (htmlEl.classList.contains('dark')) {
      htmlEl.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      htmlEl.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
}
