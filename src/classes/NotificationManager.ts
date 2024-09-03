import { BaseManager, ILoadableManager } from "./BaseManager";

export declare type AlertMode = 'warning' | 'error' | 'success' | 'info';
export declare type AudioType = "good"|"error"|"scan"|"repeat"|"repeat_arial"

export class NotificationManager extends BaseManager implements ILoadableManager {
  static  instance:NotificationManager
  constructor(){
    super()
    NotificationManager.instance = this
  }

  //public audioGood: HTMLAudioElement = new Audio(); 
  public audioError: HTMLAudioElement = new Audio(); 
  public audioScan: HTMLAudioElement = new Audio(); 
  public audioRepeat: HTMLAudioElement = new Audio(); 
  public audioRepeatArial: HTMLAudioElement = new Audio(); 
  public goodAudios:HTMLAudioElement[]=[]
  public erroAudios:HTMLAudioElement[]=[]
  public scanAudios:HTMLAudioElement[]=[]
  public repeatAudios:HTMLAudioElement[]=[]
  public repeat_arialAudios:HTMLAudioElement[]=[]

  public path = {
    "good":"assets/sounds/GOOD.mp3",
    "error":"assets/sounds/ERROR.mp3",
    "scan":"assets/sounds/SCAN.mp3",
    "repeat":"assets/sounds/REPEAT.mp3",
    "repeat_arial":"assets/sounds/REPEAT_ARIAL.mp3"
  }

  public pools = {
    "good":[] as HTMLAudioElement[],
    "error":[] as HTMLAudioElement[],
    "scan":[] as HTMLAudioElement[],
    "repeat":[] as HTMLAudioElement[],
    "repeat_arial":[] as HTMLAudioElement[]
  }

  static init(){
    new NotificationManager()
  }

  load(): void {
    this.initSounds()
  }

  async initSounds(){
    try{
      
      //this.audioGood.src = this.path.good
      this.audioError.src = this.path.error
      this.audioScan.src = this.path.scan
      this.audioRepeat.src = this.path.repeat
      this.audioRepeatArial.src = this.path.repeat_arial
      

    }catch(e){
      //
    }
  }

  public createAudio(audioType:AudioType) {
    let items:HTMLAudioElement[] = this.pools[audioType]
    items = items.filter(x=>x.ended)
    
    if(items.length > 0 ){
      const  currentSound = items[0]
      return currentSound
    }
    
    const newAudio = new Audio()
    newAudio.src = this.path[audioType]
    this.pools[audioType].push(newAudio)
    return newAudio
  }


  public static swal(message: string, mode:AlertMode='warning') {
    //alert(message);
    if(this.instance){
      NotificationManager.showAlert(message);
      //this.instance.emit('showAlert',[message, mode])
    }
  }

  public static error(message: string) {
    
    //alert(message);
    if(this.instance){
      NotificationManager.showAlert(message);
      //this.instance.emit('showAlert',[message, 'error'])
    }
  }

  public static success(message: string) {
    //alert(message);
    if(this.instance){
      this.instance.emit('showAlert',[message, 'success'])
    }
  }

  public static info(message: string) {
    //alert(message);
    if(this.instance){
      this.instance.emit('showAlert',[message, 'info'])
    }
  }

  // public static soundGood = new Audio('../../../assets/sounds/GOOD.mp3')
  // public static soundError = new Audio('../../../assets/sounds/ERROR.mp3')
  // public static soundScan = new Audio('../../../assets/sounds/SCAN.mp3')
  // public static soundRepeat = new Audio('../../../assets/sounds/REPEAT.mp3')
  // public static soundRepeatArial = new Audio('../../../assets/sounds/REPEAT_ARIAL.mp3')


  // private play(){
  //   //this.audio.autoplay = true;
  //   try{
  //     this.audio.play()
  //   }catch(e){
  //     //console.error(e)
  //   }
    
  // }



  addListener(audio:HTMLAudioElement, audioType:AudioType){
    this.afterPlaying(audio)
  }

  public afterPlaying(audio:HTMLAudioElement){
    //console.log("afterPlaying", audio, NotificationManager.instance)
  }

  public playGood() {
    // this.audio.src = this.path.good
    // this.play()
    const item = this.createAudio('good')
    item.play()
    this.addListener(item, "good")

    //this.audioGood.play()
  }

  public playError() {
    // this.audio.src = this.path.error
    // this.play()
    //this.audioError.play()
    const item = this.createAudio("error")
    item.play()
    this.addListener(item,"error")
  }

  public playScan() {
    // this.audio.src = this.path.scan
    // this.play()
    //this.audioScan.play()
    const item = this.createAudio("scan")
    item.play()
    this.addListener(item,"scan")
  }

  public playRepeat() {
    // this.audio.src = this.path.repeat
    // this.play()
    //this.audioRepeat.play()
    const item = this.createAudio("repeat")
    item.play()
    this.addListener(item, "repeat")
  }

  public playRepeatArial() {
    // this.audio.src = this.path.repeat_arial
    // this.play()
    //this.audioRepeatArial.play()
    const item = this.createAudio("repeat_arial")
    item.play()
    this.addListener(item,"repeat_arial")
  }


  public static async showConfirm(message:string):Promise<boolean>{
    return new Promise((resolve,reject)=>{
        try{
          
          NotificationManager.instance.emit('showConfirmWindow',[message,(result:boolean)=>{
            if(result){
              resolve(result)
            }
          }])
        }catch(e){
            reject(e)
        }
        
        
    })
  }

  public static async showAlert(message:string):Promise<boolean>{
    return new Promise((resolve, reject)=>{
        try{
          
          NotificationManager.instance.emit('showAlertWindow',[message,(result:boolean)=>{
            if(result){
              resolve(result)
            }
          }])
        }catch(e){
            reject(e)
        }
        
        
    })
  }

}
