const submit = document.getElementById('submit')

const query = function () {
  const resultContainer = document.getElementById('result')
  let className = resultContainer.className
  className = className.split(' ')
  className.splice(className.length - 1, 1).join(' ')
  resultContainer.className = className
}

submit.addEventListener('click', function () {
  query()
})
