import { BaseManager, ILoadableManager } from "./BaseManager";

export declare type AlertMode = 'warning' | 'error' | 'success' | 'info';

export class NotificationManager extends BaseManager implements ILoadableManager {
  static  instance:NotificationManager
  constructor(){
    super()
    NotificationManager.instance = this
  }

  public audioGood: HTMLAudioElement = new Audio(); 
  public audioError: HTMLAudioElement = new Audio(); 
  public audioScan: HTMLAudioElement = new Audio(); 
  public audioRepeat: HTMLAudioElement = new Audio(); 
  public audioRepeatArial: HTMLAudioElement = new Audio(); 

  public path={
    good:"",
    error:"",
    scan:"",
    repeat:"",
    repeat_arial:""
  }

  static init(){
    new NotificationManager()
  }

  load(): void {
    this.initSounds()
  }

  async initSounds(){
    try{
      this.path.good='assets/sounds/GOOD.mp3'
      this.path.error='assets/sounds/ERROR.mp3'
      this.path.scan='assets/sounds/SCAN.mp3'
      this.path.repeat='assets/sounds/REPEAT.mp3'
      this.path.repeat_arial='assets/sounds/REPEAT_ARIAL.mp3'
      this.audioGood.src = this.path.good
      this.audioError.src = this.path.error
      this.audioScan.src = this.path.scan
      this.audioRepeat.src = this.path.repeat
      this.audioRepeatArial.src = this.path.repeat_arial

    }catch(e){
      //
    }
  }


  public static swal(message: string, mode:AlertMode='warning') {
    //alert(message);
    if(this.instance){
      this.instance.emit('showAlert',[message, mode])
    }
  }

  public static error(message: string) {
    //alert(message);
    if(this.instance){
      this.instance.emit('showAlert',[message, 'error'])
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

  public playGood() {
    // this.audio.src = this.path.good
    // this.play()
    this.audioGood.play()
  }

  public playError() {
    // this.audio.src = this.path.error
    // this.play()
    this.audioError.play()
  }

  public playScan() {
    // this.audio.src = this.path.scan
    // this.play()
    this.audioScan.play()
  }

  public playRepeat() {
    // this.audio.src = this.path.repeat
    // this.play()
    this.audioRepeat.play()
  }

  public playRepeatArial() {
    // this.audio.src = this.path.repeat_arial
    // this.play()
    this.audioRepeatArial.play()
  }


  public static async showConfirm(message:string):Promise<boolean>{
    return new Promise((resolve,reject)=>{
        try{
          
          NotificationManager.instance.emit('showConfirm',[message,(result:boolean)=>{
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
