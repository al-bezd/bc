var indexedDB 	  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
	IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction

	let baseName="1c"
	let storeName = "barcodes"

function logerr(err){
	swal(JSON.stringify(err.error))
}

function connectDB(f,base,store){

	var baseName=base
	var storeName=store

	if(base===undefined){
		baseName = "1c"
	}if (store===undefined){
		storeName = "barcodes"
	}
  	//SetData('baseName',base)
	//SetData('storeName',store)

	var request = indexedDB.open(baseName, 1)

	request.onerror = logerr

	request.onsuccess = ()=>{
		f(request.result,base,store)
	}

	request.onupgradeneeded = (e,base,store)=>{
		//storeName = GetData("storeName")
		//baseName  = GetData("baseName")
		e.currentTarget.result.createObjectStore(storeName, { keyPath: "id" }).createIndex("id", "id", { unique: true })
		connectDB(f,baseName,storeName)

		//RemoveData('baseName',base)
		//RemoveData('storeName',store)
	}
}

function getFile(file, f,base,store){

	var baseName=base
	var storeName=store
	if(base===undefined){
		baseName = "1c"
	}if (store===undefined){
		storeName = "barcodes"
	}

	connectDB((db,base,store)=>{

		var baseName=base
		var storeName=store
		if(base===undefined){
			baseName = "1c"
		}
		if (store===undefined) {
			storeName = "barcodes"
		}

		var request = db.transaction([storeName], "readonly").objectStore(storeName).get(file)

		//RemoveData('baseName',base)
		//RemoveData('storeName',store)

		request.onerror = logerr
		request.onsuccess = ()=>{
			f(request.result ? request.result : -1)
		}
	},baseName,storeName)

}

function getStorage(f,base,store){
	var baseName=base
	var storeName=store
	if(base===undefined){baseName = "1c";}if (store===undefined) {storeName = "barcodes"}
	connectDB((db,baseName,storeName)=>{

		//setTimeout( ()=> {
			//baseName=GetData('baseName')
			//storeName=GetData('storeName')

			if(baseName===undefined){
				baseName = "1c"
			}

			if (storeName===undefined){
				storeName = "barcodes"
			}

			var rows = []
			store = db.transaction([storeName], "readonly").objectStore(storeName)

			if(store.mozGetAll)
				store.mozGetAll().onsuccess = (e)=>{
					f(e.target.result)
				}
			else
				store.openCursor().onsuccess = (e)=> {
					var cursor = e.target.result
					if(cursor){
						rows.push(cursor.value)
						cursor.continue()
					}
					else {
						f(rows)
					}
				}
		//}, 100)



	},baseName,storeName);
}

function setFile(file,base,store){

	baseName=base;storeName=store;
	if(base===undefined){
		baseName = "1c"
	}if (store===undefined) {
		storeName = "barcodes"
	}

	connectDB((db,base,store)=>{

		var baseName=base
		var storeName=store
		if(base===undefined){
			baseName = "1c"
		}if (store===undefined){
			storeName = "barcodes"
		}

		var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(file)
		request.onerror = logerr
		request.onsuccess = ()=>{
			return request.result
		}
	},baseName,storeName)
}

function delFile(file,base,store){
	var baseName=base
	var storeName=store
	if(base===undefined){
		baseName = "1c"
	}if (store===undefined){
		storeName = "barcodes"
	}
	connectDB((db,baseName,storeName)=>{
		var request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(file)
		request.onerror = logerr
		request.onsuccess = ()=>{
			console.log("File delete from DB:", file)
		}
	},baseName,storeName);
}
