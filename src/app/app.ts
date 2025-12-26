import { ChangeDetectorRef, Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';


// Create a deep reactive proxy for the sheet that calls onChange whenever any nested property is modified.
// It wraps objects and arrays recursively and uses a WeakMap cache to avoid re-wrapping.
function createReactiveSheet<T extends object>(obj: T, onChange: () => void): T {
  const cache = new WeakMap<object, any>();

  function proxify<TVal>(value: TVal): TVal {
    if (value === null || typeof value !== 'object') return value;
    if (cache.has(value as unknown as object)) return cache.get(value as unknown as object);
    const target = value as unknown as any;

    // Pre-wrap existing nested properties so further mutations are proxied.
    for (const key of Object.keys(target)) {
      target[key] = proxify(target[key]);
    }

    const handler: ProxyHandler<any> = {
      get(t, prop, receiver) {
        const v = Reflect.get(t, prop, receiver);
        return proxify(v);
      },
      set(t, prop, newVal, receiver) {
        const wrapped = proxify(newVal);
        const result = Reflect.set(t, prop, wrapped, receiver);
        try { onChange(); } catch (_) {}
        return result;
      },
      deleteProperty(t, prop) {
        const result = Reflect.deleteProperty(t, prop);
        try { onChange(); } catch (_) {}
        return result;
      }
    };

    const p = new Proxy(target, handler);
    cache.set(value as unknown as object, p);
    return p;
  }

  return proxify(obj);
}

// Default sheet template used when there is no saved data
const DEFAULT_SHEET = {
  name: null,
  type: null,
  descriptor: null,
  focus: null,
  flavor: null,

  tier: 1,
  effort: 1,
  xp: 0,

  pools: {
    mig: { curr: null, max: null, edge: null },
    spd: { curr: null, max: null, edge: null },
    int: { curr: null, max: null, edge: null }
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

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private cd: ChangeDetectorRef) {}

  protected readonly title = signal('CypherSheet');

  // Source - https://stackoverflow.com/a
  // Posted by Marco Bérubé
  // Retrieved 2025-12-25, License - CC BY-SA 4.0

  @HostListener('window:beforeunload', ['$event'])
  showAlertMessageWhenClosingTab($event: { returnValue: string; }) {
      if(this.changeDanger){
        $event.returnValue = 'Your data will be lost!';
      }
  }

  changeDanger = false;

  isDarkMode: boolean = false;

  // The sheet is created in ngOnInit as a reactive proxy so any nested mutation will set `changeDanger` to true.
  sheet: any;

  saveSheet() {
    localStorage.setItem('cyphersheet', JSON.stringify(this.sheet));
    // Mark as saved
    this.changeDanger = false;
  }

  exportSheet() {
    const sheetData = JSON.stringify(this.sheet);
    const blob = new Blob([sheetData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyphersheet.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importSheet() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const importedSheet = JSON.parse(event.target.result);
          this.sheet = createReactiveSheet(importedSheet, () => this.changeDanger = true);
          this.changeDanger = true;
          this.cd.detectChanges();
        } catch (error) {
          alert('Erro ao importar a ficha: arquivo inválido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  resetSheet() {
    if(confirm("Tem certeza que deseja reiniciar a ficha? Todas as alterações não salvas serão perdidas.")) {
      this.sheet = createReactiveSheet(DEFAULT_SHEET, () => this.changeDanger = true);
      this.changeDanger = true;
    }
  }

  setAutosaveTimer() {
    setInterval(() => {
      if(this.changeDanger) {
        this.saveSheet();
      }
    }, 30000); // Save every 30 seconds if there are changes
  }

  countTrue(arrBool:boolean[]){
    console.log(arrBool.filter(v=>v).length)

    return arrBool.filter(v=>v).length
  }

  upTier() {
    this.sheet.tier++

    this.sheet.advancements = [false,false,false,false,false]
  }

  addAbility() {
    this.sheet.abilities.push(null)
  }

  removeAbility(index:number) {
    this.sheet.abilities.splice(index,1)
  }

  moveAbility(index:number,ammount:number) {
    if(ammount < 0 && index == 0) {
      return
    } else if (ammount > 0 && index == this.sheet.abilities.length-1) {
      return
    } 
    [this.sheet.abilities[index + ammount], this.sheet.abilities[index]] = [this.sheet.abilities[index], this.sheet.abilities[index + ammount]]
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

    this.isDarkMode = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }

    const savedSheet = localStorage.getItem('cyphersheet');
    if (savedSheet) {
      const parsed = JSON.parse(savedSheet);
      this.sheet = createReactiveSheet(parsed, () => this.changeDanger = true);
      // Loaded data is the baseline - no unsaved changes yet
      this.changeDanger = false;
    } else {
      this.sheet = createReactiveSheet(DEFAULT_SHEET, () => this.changeDanger = true);
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

    this.isDarkMode = !this.isDarkMode
  }
}
