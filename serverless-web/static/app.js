
function listAlbums() {
  // Create a request variable and assign a new XMLHttpRequest object to it.
  var request = new XMLHttpRequest()

  // Open a new connection, using the GET request on the URL endpoint
  request.open('GET', server_root+'/list_album/', true)
  
  //request.onload = function() {

  request.onload = function () {

     // Begin accessing JSON data here
     var data = JSON.parse(this.response)

     if (request.status == 200 || request.status == 404) {
        if (request.status == 404) {
          var albums=[]
        } else {
          var albums = data.CommonPrefixes.map(function(commonPrefix) {
            var prefix = commonPrefix.Prefix;
            var albumName = decodeURIComponent(prefix.replace("/", ""));
            return getHtml([
              "<li>",
              "<button style=\"cursor:pointer;\" onclick=\"deleteAlbum('" + albumName + "')\">X</button>",
              "<span style=\"cursor:pointer;margin-left:1rem;font-weight: bold;\" onclick=\"viewAlbum('" + albumName + "')\">",
              albumName,
              "</span>",
              "</li>"
             ]);
          });
        }
        var message = albums.length
          ? getHtml([
              "<p>Click sobre el nombre del album para verlo.</p>",
              "<p>Click en la X para borrar el album.</p>"
            ])
          : "<p>No tienes ningún album. Crear un album.</p>";
        var htmlTemplate = [
          "<h2>Albums</h2>",
          "<ul>",
          getHtml(albums),
          "</ul>",
          "<h2></h2>",
          "<button style=\"cursor:pointer;\" onclick=\"createAlbum(prompt('Introduce el nombre del Album:'))\">",
          "Crear Album",
          "</button>",
          message,
        ];
        document.getElementById("app").innerHTML = getHtml(htmlTemplate);
     } else {
       return alert("Hubo un error listando tus albums.");
     }
  }
  request.onerror = function () {
    return alert("Hubo un error listando tus albums.");
  }
  
  // Send request
  request.send()

}

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Los nombres de album deben contener al menos un caracter distinto del espacio.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Los nombres de album no pueden tener el carácter '/'.");
  }
  var albumKey = encodeURIComponent(albumName) + "/";

  var request = new XMLHttpRequest()
  request.open('GET', server_root+'/head_object/'+albumKey, true)
  
  request.onload = function () {
     // Begin accessing JSON data here
     var data = JSON.parse(this.response)
     if (request.status == 200) {
       return alert("El album ya existe.");
     }
     if (request.status !== 404 ) {
       return alert("Hubo un error creando tu album ");
     }
    var request2 = new XMLHttpRequest()
    request2.open('POST', server_root+'/put_object/'+albumKey, true)
    request2.onload = function () {
     // Begin accessing JSON data here
     var data = JSON.parse(this.response)
      if (request2.status !== 200) {
        return alert("Hubo un error creando tu album ");
      }
      alert("Album creado.");
      viewAlbum(albumName);
    }
    request2.onerror = function () {
      return alert("Hubo un error creando tu album ");
    }
    // Send request
    request2.send()
  }

  // Send request
  request.send()

}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  request = new XMLHttpRequest()
  request.open('GET', server_root+'/list_objects/'+albumPhotosKey, true)
  request.onload = function () {

    if (request.status == 200 || request.status == 404) {
        if (request.status == 404) {
          var photos=[]
        } else {
          var data = JSON.parse(this.response)
          var albumBucketName = data.Name
          var region = data.ResponseMetadata.HTTPHeaders['x-amz-bucket-region']
          var bucketUrl = "https://" + albumBucketName +".s3-"+region+ ".amazonaws.com/";
      
          var photos = data.Contents.map(function(photo) {
            var photoKey = photo.Key;
            console.log(photoKey)
            var photoUrl = bucketUrl + encodeURIComponent(photoKey);
            if (photoKey !== albumName+'/'){
            return getHtml([
              "<span>",
              "<div>",
              '<img style="width:20%;height:20%;" src="' + photoUrl + '"/>',
              "</div>",
              "<div style=\"text-align:center\">",
              "<button style=\"cursor:pointer;\" onclick=\"deletePhoto('" +
                albumName +
                "','" +
                photoKey +
                "')\">",
              "X",
              "</button>",
              "<span style=\"margin-left: 1rem;\">",
              photoKey.replace(albumPhotosKey, ""),
              "</span>",
              "</div>",
              "</span>"
            ]);
           }
          });
        }
        var message = photos.length
          ? "<p>Click en la X para borrar la imagen.</p>"
          : "<p>No tienes imagenes en este album. Añade imagen.</p>";
        var htmlTemplate = [
          "<h2>",
          "Album: " + albumName,
          "</h2>",
          "<div>",
          getHtml(photos),
          "<div>",
          "<h2></h2>",
          "</div>",
          "<div>",
          '<input id="photoupload" type="file" accept="image/*">',
          '<button style="cursor:pointer;"id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
          "Añade imagen",
          "</div>",
          "</button>",
          '<button style="cursor:pointer;" onclick="listAlbums()">',
          "Volver a Albums",
          "</button>",
          message,
        ];
        document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    }else {
      return alert("Hubo un error viendo tu album" );
    }
  }

  // Send request
  request.send()
}

function addPhoto(albumName) {
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Por favor, selecciona un archivo para subir.");
  }
  var file = files[0];
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  var photoKey = albumPhotosKey + fileName;
  var formData = new FormData();
  formData.append('file', file);
  request = new XMLHttpRequest()
  request.open('POST', server_root+'/upload_object/'+photoKey, true)
  request.onload = function () {

     if ( request.status == 200){
      alert("Imagen subida.");
      viewAlbum(albumName);
     }else{
      return alert("Hubo un error subiendo tu imagen.");
     }
  }
   //Send request
  request.send(formData)
  
}

function deletePhoto(albumName, photoKey) {
   var request = new XMLHttpRequest()
   request.open('POST', server_root+'/delete_object/'+photoKey+'/', true)

   request.onload = function () {

     if ( request.status == 200){
        alert("Imagen eliminada.");
        viewAlbum(albumName);
     } else {
      return alert("Hubo un error borrando tu imagen.");
     }
  }

  // Send request
  request.send()

}

function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + "/";
  var request = new XMLHttpRequest()
  request.open('POST', server_root+'/delete_object/'+albumKey+'none/', true)

  request.onload = function () {
     
     if ( request.status == 200){
        alert("Album eliminado.");
        listAlbums();
     } else {
      return alert("Hubo un error borrando tu Album ");
     }
  }

  // Send request
  request.send()
}

