const fs = require('fs')
const { Pool } = require('pg')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

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
  let index = 1

  if (request.query.area) {
    statement += 'INNER JOIN _geographic_area_ref ON _geographic_area_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _geographic_area ON _geographic_area.area_id = _geographic_area_ref.area_id\n'
    if (statementEnd) {
      statementEnd += ' AND area_name = $' + index
    } else {
      statementEnd += 'WHERE area_name = $' + index
    }
    params.push(request.query.area)
    index++
  }

  if (request.query.modality) {
    statement += 'INNER JOIN _modality_ref ON _modality_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _modality ON _modality.modality_id = _modality_ref.modality_id\n'
    if (statementEnd) {
      statementEnd += ' AND modality_name = $' + index
    } else {
      statementEnd += 'WHERE modality_name = $' + index
    }
    params.push(request.query.modality)
    index++
  }

  if (request.query.outcome) {
    statement += 'INNER JOIN _outcome_ref ON _outcome_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _outcome ON _outcome.outcome_id = _outcome_ref.outcome_id\n'
    if (statementEnd) {
      statementEnd += ' AND outcome_name = $' + index
    } else {
      statementEnd += 'WHERE outcome_name = $' + index
    }
    params.push(request.query.outcome)
    index++
  }

  if (request.query.populations) {
    statement += 'INNER JOIN _populations_ref ON _populations_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _populations ON _populations_ref.pop_id = _populations.pop_id\n'
    if (statementEnd) {
      statementEnd += ' AND pop_class = $' + index
    } else {
      statementEnd += 'WHERE pop_class = $' + index
    }
    params.push(request.query.populations)
    index++
  }

  if (request.query.sysrev) {
    if (statementEnd) {
      statementEnd += ' AND _systematic_review.first_author = $' + index
    } else {
      statementEnd += 'WHERE _systematic_review.first_author = $' + index
    }
    params.push(request.query.sysrev)
    index++
  }

  if (request.query.target) {
    statement += 'INNER JOIN _target_ref ON _target_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _target ON _target_ref.disease_id = _target.disease_id\n'
    if (statementEnd) {
      statementEnd += ' AND disease_name = $' + index
    } else {
      statementEnd += 'WHERE disease_name = $' + index
    }
    params.push(request.query.target)
    index++
  }

  if (request.query.urbanicity) {
    statement += 'INNER JOIN _urbanicity_ref ON _urbanicity_ref.study_id = _main.study_id\n'
    statement += 'INNER JOIN _urbanicity ON _urbanicity_ref.urbanicity_id = _urbanicity.urbanicity_id\n'
    if (statementEnd) {
      statementEnd += ' AND urbanicity_class = $' + index
    } else {
      statementEnd += 'WHERE urbanicity_class = $' + index
    }
    params.push(request.query.urbanicity)
    index++
  }

  statement += statementEnd
  const client = await pool.connect()
  const result = await client.query(statement, params)
  response.json(result.rows)
  client.release()
})

app.use(function (request, response, next) {
  response.status(404).end(request.url + ' not found, please check your input.')
})

app.listen(port)
