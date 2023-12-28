const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbOjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// API 1

app.get('/players/', async (request, response) => {
  const getListOfPlayers = `
    SELECT * FROM cricket_team;
    `
  const teamArray = await db.all(getListOfPlayers)
  response.send(
    teamArray.map(eachPlayer => convertDbOjectToResponseObject(eachPlayer)),
  )
})

// API 2

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body

  const addPlayerDetails = `INSERT INTO cricket_team (
    player_name,
    jersey_number,
    role) VALUES ('${playerName}',${jerseyNumber},'${role}')`

  const addPlayerDetails = await db.run(addPlayerDetails)
  response.send('Player Added to Team')
})

// API 3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `

  const playerDetails = await db.all(getListOfPlayers)
  response.send(convertDBOjectToResponseObject(playerDetails))
})

// API 4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const {playerName, jerseyNumber, role} = request.body

  const updatePlayerDetails = `UPDATE player SET player_name: ${playerName}, jersey_number: ${jerseyNumber}, role: ${role} WHERE player_id = ${playerId};`
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

// API 5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayer = `DELETE FROM player WHERE player_id = ${playerId};`

  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
