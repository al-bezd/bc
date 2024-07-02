export class NotificationManager {
  public static swal(message: string) {
    alert(message);
  }

  public static soundClick(path: string) {
    const audio = new Audio();
    audio.autoplay = true;

    audio.src = path; // Указываем путь к звуку "клика"
    // Автоматически запускаем
    audio.play();
  }

  public static playGood() {
    this.soundClick('../src/assets/sounds/GOOD.mp3')
  }

  public static playError() {
    this.soundClick('../src/assets/sounds/ERROR.mp3')
  }

  public static playScan() {
    this.soundClick('../src/assets/sounds/SCAN.mp3')
  }

  public static playRepeat() {
    this.soundClick('../src/assets/sounds/REPEAT.mp3')
  }

  public static playRepeatArial() {
    this.soundClick('../src/assets/sounds/REPEAT_ARIAL.mp3')
  }


  public static async  showConfirm(message:string):Promise<boolean>{
    return new Promise((resolve,reject)=>{
        try{
            const res = confirm(message)
            resolve(res)
        }catch(e){
            reject(e)
        }
        
    })
  }

}
