export function GetRequest (url, params, callback) {
  const request = new window.XMLHttpRequest()
  if (params) url += '?'
  for (var param in params) {
    url += param + '=' + params[param] + '&'
  }
  request.open('GET', url, true)

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      callback(JSON.parse(request.responseText))
    } else {
      // We reached our target server, but it returned an error
      callback('server returned an error')
    }
  }

  request.onerror = function () {
    // There was a connection error of some sort
  }

  request.send()
}

export function PostRequest (url, data, callback) {
  var request = new window.XMLHttpRequest()
  request.open('POST', url, true)
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      callback(JSON.parse(request.responseText))
    } else {
      // Server error
      callback('server returned an error')
    }
  }
  request.send(JSON.stringify(data))
}

export function PutRequest (url, data, callback) {
  var request = new window.XMLHttpRequest()

  request.open('PUT', url, true)
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      callback(JSON.parse(request.responseText))
    } else {
      // Server error
      callback('server returned an error')
    }
  }

  request.send(JSON.stringify(data))
}

export function FilePostRequest (url, form, callback) {
  var request = new window.XMLHttpRequest()
  var formData = new window.FormData()

  request.open('POST', url, true)
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      callback(JSON.parse(request.responseText))
    }
  }

  for (var i = 0; i < form.elements.length; i++) {
    if (form.elements[i].type === 'file') {
      formData.append(form.elements[i].id, form.elements[i].files[0])
    } else {
      formData.append(form.elements[i].id, form.elements[i].value)
    }
  }

  request.send(formData)
}

export function DeleteRequest (url, callback) {
  var request = new window.XMLHttpRequest()

  request.open('DELETE', url, true)
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      callback(JSON.parse(request.responseText))
    } else {
      // Server error
      callback('server returned an error')
    }
  }

  request.onerror = function () {
    // There was a connection error of some sort
  }

  request.send()
}
