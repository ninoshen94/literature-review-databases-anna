const fs = require('fs')
const sql = require('sqlite3').verbose()
const db = new sql.Database('lr.db')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.use(express.static('static'))

app.get('/', function (request, response) {
  fs.readFile('/index.html', 'utf-8', function (err, data) {
    if (err) {
      throw err
    }
    console.log('here runing')
    response.status(200).end(data)
  })
})

app.get('/search', async function (request, response) {
  const params = []
  let statement = 'SELECT DISTINCT _main.first_author, _main.publish_year, _systematic_review.first_author AS sys_first_author, _main.title, _main.doi FROM _main\n'
  statement += 'INNER JOIN _systematic_review ON _main.sys_rev_id = _systematic_review.sys_rev_id\n'
  let statementEnd = ''

  if (request.query.area) {
    statement += 'INNER JOIN _geographic_area_ref ON _geographic_area_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _geographic_area ON _geographic_area.area_id = _geographic_area_ref.area_id\n'
    if (statementEnd) {
      statementEnd += ' AND area_name = ?'
    } else {
      statementEnd += 'WHERE area_name = ?'
    }
    params.push(request.query.area)
  }

  if (request.query.modality) {
    statement += 'INNER JOIN _modality_ref ON _modality_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _modality ON _modality.modality_id = _modality_ref.modality_id\n'
    if (statementEnd) {
      statementEnd += ' AND modality_name = ?'
    } else {
      statementEnd += 'WHERE modality_name = ?'
    }
    params.push(request.query.modality)
  }

  if (request.query.outcome) {
    statement += 'INNER JOIN _outcome_ref ON _outcome_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _outcome ON _outcome.outcome_id = _outcome_ref.outcome_id\n'
    if (statementEnd) {
      statementEnd += ' AND outcome_name = ?'
    } else {
      statementEnd += 'WHERE outcome_name = ?'
    }
    params.push(request.query.outcome)
  }

  if (request.query.populations) {
    statement += 'INNER JOIN _populations_ref ON _populations_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _populations ON _populations_ref.pop_id = _populations.pop_id\n'
    if (statementEnd) {
      statementEnd += ' AND pop_class = ?'
    } else {
      statementEnd += 'WHERE pop_class = ?'
    }
    params.push(request.query.populations)
  }

  if (request.query.sysrev) {
    if (statementEnd) {
      statementEnd += ' AND _systematic_review.first_author = ?'
    } else {
      statementEnd += 'WHERE _systematic_review.first_author = ?'
    }
    params.push(request.query.sysrev)
  }

  if (request.query.target) {
    statement += 'INNER JOIN _target_ref ON _target_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _target ON _target_ref.disease_id = _target.disease_id\n'
    if (statementEnd) {
      statementEnd += ' AND disease_name = ?'
    } else {
      statementEnd += 'WHERE disease_name = ?'
    }
    params.push(request.query.target)
  }

  if (request.query.urbanicity) {
    statement += 'INNER JOIN _urbanicity_ref ON _urbanicity_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _urbanicity ON _urbanicity_ref.urbanicity_id = _urbanicity.urbanicity_id\n'
    if (statementEnd) {
      statementEnd += ' AND urbanicity_class = ?'
    } else {
      statementEnd += 'WHERE urbanicity_class = ?'
    }
    params.push(request.query.urbanicity)
  }

  statement += statementEnd

  await db.all(statement, params, function (err, rows) {
    if (err) throw err
    response.json(rows)
  })
})

app.use(function (request, response, next) {
  response.status(404).end(request.url + ' not found, please check your input.')
})

app.listen(port)
