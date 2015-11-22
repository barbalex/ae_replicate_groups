/*
 * repliziert die lokale artendb in 5 gruppenspezifische db's
 */

'use strict'

const Promise = require('bluebird')
const PouchDB = require('pouchdb')
const couchPass = require('./couchPass.json')

const couchUrl = 'http://' + couchPass.user + ':' + couchPass.pass + '@127.0.0.1:5984'
const groups = ['Fauna', 'Flora', 'Moose', 'Macromycetes', 'Lebensräume']
const mainDb = new PouchDB(couchUrl + '/ae')

PouchDB.setMaxListeners(80)

function createDbnameFromGroupname (dbname) {
  // create db-names from groups
  const dbnameLc = dbname.toLowerCase()
  return dbnameLc.replace('macromycetes', 'pilze').replace('lebensräume', 'lr')
}

Promise.all(
  groups.map(function (group) {
    const targetDbUrl = couchUrl + '/ae_' + createDbnameFromGroupname(group)
    const targetDb = new PouchDB(targetDbUrl)
    const options = {
      filter: function (doc) {
        return (doc.Gruppe && doc.Gruppe === group)
      },
      batch_size: 500,
      create_target: true
    }
    return PouchDB.replicate(mainDb, targetDb, options)
  })
)
  .then((result) => console.log(result))
  .catch((error) => console.log(error))
