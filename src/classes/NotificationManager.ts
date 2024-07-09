import { BaseManager, ILoadableManager } from "./BaseManager";

export declare type AlertMode = 'warning' | 'error' | 'success' | 'info';

export class NotificationManager extends BaseManager implements ILoadableManager {
  static  instance:NotificationManager
  constructor(){
    super()
    NotificationManager.instance = this
  }

  public audio: HTMLAudioElement = new Audio(); 

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
    this.path.good = (await import('@/assets/sounds/GOOD.mp3')).default
    this.path.error = (await import('@/assets/sounds/ERROR.mp3')).default
    this.path.scan = (await import('@/assets/sounds/SCAN.mp3')).default
    this.path.repeat = (await import('@/assets/sounds/REPEAT.mp3')).default
    this.path.repeat_arial = (await import('@/assets/sounds/REPEAT_ARIAL.mp3')).default
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
  

  public static soundClick(path: string) {
    const audio = new Audio();
    audio.autoplay = true;

    audio.src = path; // Указываем путь к звуку "клика"
    // Автоматически запускаем
    audio.play();
  }

  private play(){
    this.audio.autoplay = true;
    try{
      this.audio.play()
    }catch(e){
      console.error(e)
    }
    
  }

  public playGood() {
    this.audio.src = this.path.good
    this.play()
  }

  public playError() {
    this.audio.src = this.path.error
    this.play()
  }

  public playScan() {
    this.audio.src = this.path.scan
    this.play()
  }

  public playRepeat() {
    this.audio.src = this.path.repeat
    this.play()
  }

  public playRepeatArial() {
    this.audio.src = this.path.repeat_arial
    this.play()
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
