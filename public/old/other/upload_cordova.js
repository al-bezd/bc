function UploadApp() {
    axios({
      url:url_to_base+'/barcode2020/hs/barcode/app-debug.apk',
      method:'GET',
      responseType:'blob'
    }).
    then((e)=>{
    download('app-debug.apk',e.data,'application/vnd.android.package-archive')
  })}

function download(filename, data, mimeType) {
  var blob = new Blob([data], {
    type: mimeType
  });
  if (window.cordova && cordova.platformId !== "browser") {
    document.addEventListener("deviceready", ()=> {
      var storageLocation = ""
      var blob = new Blob([data], {type: mimeType})
      var storageLocation = cordova.file.externalDataDirectory
      var folderPath = storageLocation
      window.resolveLocalFileSystemURL(
        folderPath,
         (dir) =>{
          dir.getFile(
            filename,
            {
              create: true
            },
             (file)=> {
              file.createWriter(
                 (fileWriter) =>{
                  fileWriter.write(blob)
                  fileWriter.onwriteend =  ()=> {
                    var url = file.toURL()
                    cordova.plugins.fileOpener2.open(url, mimeType, {
                      error: function error(err) {
                        console.error(err)
                        alert("Unable to download")
                      },
                      success: function success() {
                        console.log("success with opening the file")
                      }
                    })
                  }
                  fileWriter.onerror =  (err)=> {
                    alert("Unable to download")
                    console.error(err)
                  }
                },
                 (err) =>{
                  // failed
                  alert("Unable to download")
                  console.error(err)
                }
              )
            },
             (err)=> {
              alert("Unable to download")
              console.error(err)
            }
          )
        },
         (err)=> {
          alert("Unable to download")
          console.error(err)
        }
      )

    })
  } else {
    saveAs(blob, filename)
  }
}

 /////////////////////////////////////////////////////////////////////////////////////////////////////

function ClipBoardCopy(text){
  cordova.plugins.clipboard.clear()
  cordova.plugins.clipboard.copy(text)
}

function ClipBoardPaste(attr,success){
  //obj=eval()
  cordova.plugins.clipboard.paste(
     (text)=> {
      eval(`${attr[0]}.${attr[1]}="${text}"`)
      success()
      cordova.plugins.clipboard.clear()
    })

}
