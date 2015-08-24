/*
 * repliziert die lokale artendb in 5 gruppenspezifische db's
 */

'use strict'

var Promise = require('bluebird')
var PouchDB = require('pouchdb')
var couchPass = require('./couchPass.json')

var couchUrl = 'http://' + couchPass.user + ':' + couchPass.pass + '@127.0.0.1:5984'
var groups = ['Fauna', 'Flora', 'Moose', 'Macromycetes', 'Lebensräume']
var mainDb = new PouchDB(couchUrl + '/artendb')

PouchDB.setMaxListeners(80)

function createDbnameFromGroupname (dbname) {
  // create db-names from groups
  var dbnameLc = dbname.toLowerCase()
  return dbnameLc.replace('macromycetes', 'pilze').replace('lebensräume', 'lr')
}

Promise.all(
  groups.map(function (group) {
    var targetDbUrl = 'ae_' + couchUrl + '/' + createDbnameFromGroupname(group)
    var targetDb = new PouchDB(targetDbUrl)
    var options = {
      filter: function (doc) {
        return (doc.Gruppe && doc.Gruppe === group)
      },
      batch_size: 500,
      create_target: true
    }
    return PouchDB.replicate(mainDb, targetDb, options)
  })
)
  .then(function (result) {
    console.log(result)
  })
  .catch(function (error) {
    console.log(error)
  })
