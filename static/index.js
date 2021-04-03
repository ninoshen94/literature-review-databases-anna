const submit = document.getElementById('submit')

const ajaxObject = function ajaxObject () {
  let xmlHttp
  try {
    // Firefox, Opera 8.0+, Safari and Chrome
    xmlHttp = new XMLHttpRequest()
  } catch (e) {
    window.alert('Please use Firefox, Opera 8.0+, Chrome or Safari to browse.')
    return null
  }
  return xmlHttp
}

function ajaxGet (url, then) {
  const ajax = ajaxObject()
  ajax.open('get', url, true)
  ajax.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4) {
      if (ajax.status === 200) {
        const response = JSON.parse(ajax.responseText)
        if (response.error) {
          window.alert('Error')
          window.location = '/'
          return
        }
        console.log(response)
        then(response)
      }
    }
  }
  ajax.send()
}

const renderResult = function (essays) {
  const table = document.getElementById('table')
  const resultNum = document.getElementById('result-number')
  const title = '<tr>\n' +
  ' <th>First Author</th>\n' +
  ' <th>Publish Year</th>\n' +
  ' <th>From Systematic Review</th>\n' +
  ' <th>Title</th>\n' +
  ' <th>doi</th>\n' +
  '</tr>\n'

  const resultContainer = document.getElementById('result')
  let className = resultContainer.className
  className = className.split(' ')
  if (className[className.length - 1] !== 'hidden') {
    resultContainer.className += ' hidden'
    className.push('hidden')
  }

  if (essays) {
    table.innerHTML = title
    const length = Object.keys(essays).length
    for (let id = 0; id < length; id++) {
      const tr = document.createElement('tr')
      Object.keys(essays[id]).forEach(function (field) {
        const td = document.createElement('td')
        td.innerHTML = essays[id][field]
        tr.appendChild(td)
      })
      if (id % 2 === 0) {
        tr.className = 'darken'
      }
      table.appendChild(tr)
    }
    if (length === 1) {
      resultNum.innerHTML = length + ' result'
    } else {
      resultNum.innerHTML = length + ' results'
    }
  } else {
    resultNum.innerHTML = 'no results'
    table.innerHTML = ''
  }

  className.splice(className.length - 1, 1).join(' ')
  resultContainer.className = className
}

const getSelection = function () {
  let queries = ''
  const selects = document.getElementsByClassName('selects')
  Object.keys(selects).forEach(function (id) {
    const children = selects[id].children
    const name = children[0].getAttributeNode('for').value
    const value = children[1].value.replace(/ /g, '+')
    if (value !== 'all') {
      if (!queries) {
        queries = '?' + name + '=' + value
      } else {
        queries += '&' + name + '=' + value
      }
    }
  })
  return queries
}

const query = async function () {
  const searchContent = getSelection()
  ajaxGet('/search' + searchContent, renderResult)
}

submit.addEventListener('click', function () {
  query()
})
