request = (url, options, callback) ->
	if typeof options is 'function'
		[options, callback] = [{}, options]
		options = {}
	
	options.url = url
	options.success = (obj) ->
		callback(null, obj)
	options.error = (err) ->
		if err then callback(err) else callback(true)

	if options.data and typeof options.data is 'object'
		options.data = JSON.stringify(options.data)

	unless options.dataType
		options.processData = false
		options.contentType = 'application/json'
		options.dataType = 'json'

	$.ajax(options)

getCategories = do ->
	categories = null
	(callback) ->
		if categories
			callback categories
		else
			request "_view/categories", (error, data) ->
				throw new Error if error
				categories = new Array(data.total_rows + 1)
				categories[row.key] = row.value for row in data.rows
				console.log "read #{data.total_rows} categories"
				callback categories

# Split an array ['a', 'b', 'c', 'd', 'e', 'f'] into groups of size size
# -> [['a', 'b'], ['c', 'd'], ['e', 'f']]
splitList = (array, size) ->
	array[offset...offset + size] for offset in [0...array.length] by size

# Takes some lists of elements and associates them
# Eg,
# zip [[1,2,3], ['a','b', 'c']] -> [[1,'a'], [2,'b'], [3,'c']]
zip = (arrays) ->
	i = 0
	while i < arrays[0].length
		list = (a[i] for a in arrays)
		i++
		list

convertToPercentage = (data) ->
	sum = 0
	sum += d for d in data

	d/sum for d in data

makeChart = (title, categories, options, region, table, dest) ->
	options ||= {}
	#console.log options
	values = table.values

	total = 0
	total += v for v in values

#	values = convertToPercentage table.values
	defaultOptions =
		chart:
			type: 'bar'
		title:
			text: title
		subtitle:
			text: 'Source: ABS'
		xAxis:
			title:
				text: categories[0].name
			categories: categories[0].labels
		yAxis:
			min: 0
			title:
				text: null
		tooltip:
			formatter: ->
				"#{@series.name}: #{@y} (#{(@y * 100/total).toFixed 2}%)"
		plotOptions:
			#series:
			#	stacking: 'percent'
			bar:
				dataLabels:
					enabled:true
		series: if categories.length == 1
				[data: values]
			else if categories.length == 2
				split = splitList values, categories[1].labels.length
				split = zip split

				for label, i in categories[1].labels
					{name: label, data: split[i]}
	
	options[k] ||= v for k, v of defaultOptions
	options.chart.renderTo = dest

	#console.log options
	
	new Highcharts.Chart options

template = '''
{{#tables}}
<div class="row">
	<div class="span4 columns">
		<h2>{{name}}</h2>
	</div>
	<div class="span12 columns">
		<div id='{{divid}}'></div>
	</div>
</div>
{{/tables}}
'''

$ ->
	app = $.sammy '#content', ->
		# Index of all databases
#		this.get('', app.index)
		this.get "#/", ->
			@swap 'asdfasdfasfd'
		this.get "#/region/:regionid", ->
			regionId = @params.regionid
			throw new Error 'no regionid' unless regionId?
			
			getCategories (categories) =>
				catByName = {}
				catByName[name] = id for id, {name} of categories

				request "../../06_#{regionId}", (error, region) =>
					# For debugging
					#for cs in region.categories[0]
					#	console.log (categories[i].name for i in cs)


					throw new Error if error

					visibleTables = [
						{t:['Sex']}
						{t:['Sex', 'Age']}
						{t:["Indigenous persons"]}
						{t:["Country of birth"]}
						{t:["Highest year of school completed"]}
						{t:["Social Marital Status"], options:{
							chart:
								type:'pie'
							}
						}
						{t:["Sex", "Religion"]}
						{t:["Labour Status"]}
					]

					# Need to pick from region.categories where the labels match above.
					# First, we'll rewrite visibleTables into [1, 6] form.
					tableSpec.t = (catByName[name] for name in tableSpec.t) for tableSpec, i in visibleTables

					regionHas = {}
					regionHas[v.join '|'] = true for v in region.categories[0]

					templateData = for tableSpec in visibleTables when regionHas[tableSpec.t.join '|']
						{t, options} = tableSpec
						catsKey = t.join '|'
						key = "06_#{regionId}_0_#{catsKey}"

						title = (categories[c].name for c in t).join ' by '
						do (t, options, catsKey, title) ->
							request "../../#{key}", (error, table) ->
								#console.log options
								tcats = (categories[c] for c in t)

#								console.log tcats
								makeChart title, tcats, options, region, table, "chart #{catsKey}"

						v =
							name: title
							divid: "chart #{catsKey}"

					@swap Mustache.to_html(template, {tables:templateData})

	app.run()


