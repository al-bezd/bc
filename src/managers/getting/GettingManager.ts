import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { BaseManager } from "../../classes/BaseManager";
import { DBManager } from "../../classes/DBManager";
import { UserManager } from "../user/UserManager";

export class GettingManager extends BaseManager {
  static instance: GettingManager;
  constructor() {
    super();
    GettingManager.instance = this;
  }
  
  static init(){
    new GettingManager()
  }

  public documents: any[] = [];
  public barcode: string | null = null;
  public prodList: any[] = [];

  async getDocumentById(id: string): Promise<boolean> {
    const currentUser = UserManager.instance.user.Ссылка.Ссылка;
    return new Promise((resolve, reject) => {
      try {
        DBManager.getFile(
          currentUser,
          (res: any) => {
            for (const i of res.data.docs) {
              if (i.Ссылка.Ссылка === id) {
                LocalStorageManager.set("prod_doc", i);
                if (i.scanings == null) {
                  LocalStorageManager.set("prod_list", []);
                  this.prodList = [];
                } else {
                  LocalStorageManager.set("prod_list", i.scanings);
                  this.prodList = i.scanings;
                }
                resolve(true);
                //getting_prod_form.show()
                break;
              }
            }
          },
          DBManager.baseName,
          "user_docs"
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async closeDocumentById(id:string): Promise<boolean> {
    return new Promise((resolve,reject)=>{
        try{
            const currentUser = UserManager.instance.user.Ссылка.Ссылка;
            DBManager.getFile(currentUser,  (res:any) =>{
                for (const i of res.data.docs) {
                  if (i.Ссылка.Ссылка === id) {
                    res.data.docs.splice(res.data.docs.indexOf(i), 1)
                    DBManager.setFile(res, DBManager.baseName, 'user_docs')
                    resolve(true)
                    break
                  }
                }
              }, DBManager.baseName, 'user_docs')
        }catch(e){
            reject(e)
        } 
    })
    

    
    
  }
}
