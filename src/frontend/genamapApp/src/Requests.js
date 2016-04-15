var Requests = {
  GetRequest: function (url, params, callback) {
    var request = new XMLHttpRequest();
    if (params) { url += "?" };
    for (var param in params) {
      url += param + "=" + params[param] + "&";
    }
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        callback(JSON.parse(request.responseText));
      } else {
        // We reached our target server, but it returned an error 
        callback("server returned an error");
      } 
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
  },
  PostRequest: function (url, data, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        callback(JSON.parse(request.responseText));
      } else {
        // Server error
        callback("server returned an error");
      }
    };
    request.send(JSON.stringify(data));
  },
  PutRequest: function (url, data, callback) {
    var request = new XMLHttpRequest();
    
    request.open('PUT', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        callback(JSON.parse(request.responseText));
      } else {
        // Server error
        callback("server returned an error");
      }
    };

    request.send(JSON.stringify(data));
  },
  FilePostRequest: function (url, form, callback) {
    var request = new XMLHttpRequest();
    var formData = new FormData();
    
    request.open("POST", url, true);
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        callback(JSON.parse(request.responseText));
      }
    };

    for (var i = 0; i < form.elements.length; i++) {
      if (form.elements[i].type === 'file') {
        formData.append(form.elements[i].id, form.elements[i].files[0]);
      } else {
        formData.append(form.elements[i].id, form.elements[i].value);
      }
    }

    request.send(formData);
  }
}

module.exports = Requests