couchapp = require 'couchapp'
path = require 'path'

ddoc =
	_id:'_design/app'
	rewrites: [
		{from:"/", to:'index.html'}
		{from:"/api", to:'../../'}
		{from:"/api/*", to:'../../*'}
		{from:"/*", to:'*'}
	]

ddoc.views =
	categories:
		map: (doc) ->
			emit doc.catId, {name:doc.name, labels:doc.labels} if doc.type == 'category'
	regions:
		map: (doc) ->
			emit doc.region, {year:doc.year} if doc.type == 'region' #and doc.version == 1
	conflicts:
		map: (doc) ->
			emit doc._conflicts, null if doc._conflicts

ddoc.validate_doc_update = (newDoc, oldDoc, userCtx) ->
	if newDoc._deleted == true and userCtx.roles.indexOf('_admin') == -1
		throw "Only admin can delete documents on this database."

couchapp.loadAttachments ddoc, path.join(__dirname, 'attachments')

module.exports = ddoc
