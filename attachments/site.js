(function() {
  var convertToPercentage, getCategories, makeChart, request, splitList, template, zip;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  request = function(url, options, callback) {
    var _ref;
    if (typeof options === 'function') {
      _ref = [{}, options], options = _ref[0], callback = _ref[1];
      options = {};
    }
    options.url = url;
    options.success = function(obj) {
      return callback(null, obj);
    };
    options.error = function(err) {
      if (err) {
        return callback(err);
      } else {
        return callback(true);
      }
    };
    if (options.data && typeof options.data === 'object') {
      options.data = JSON.stringify(options.data);
    }
    if (!options.dataType) {
      options.processData = false;
      options.contentType = 'application/json';
      options.dataType = 'json';
    }
    return $.ajax(options);
  };
  getCategories = (function() {
    var categories;
    categories = null;
    return function(callback) {
      if (categories) {
        return callback(categories);
      } else {
        return request("_view/categories", function(error, data) {
          var row, _i, _len, _ref;
          if (error) {
            throw new Error;
          }
          categories = new Array(data.total_rows + 1);
          _ref = data.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            categories[row.key] = row.value;
          }
          console.log("read " + data.total_rows + " categories");
          return callback(categories);
        });
      }
    };
  })();
  splitList = function(array, size) {
    var offset, _ref, _results;
    _results = [];
    for (offset = 0, _ref = array.length; 0 <= _ref ? offset < _ref : offset > _ref; offset += size) {
      _results.push(array.slice(offset, offset + size));
    }
    return _results;
  };
  zip = function(arrays) {
    var a, i, list, _results;
    i = 0;
    _results = [];
    while (i < arrays[0].length) {
      list = (function() {
        var _i, _len, _results2;
        _results2 = [];
        for (_i = 0, _len = arrays.length; _i < _len; _i++) {
          a = arrays[_i];
          _results2.push(a[i]);
        }
        return _results2;
      })();
      i++;
      _results.push(list);
    }
    return _results;
  };
  convertToPercentage = function(data) {
    var d, sum, _i, _j, _len, _len2, _results;
    sum = 0;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      d = data[_i];
      sum += d;
    }
    _results = [];
    for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
      d = data[_j];
      _results.push(d / sum);
    }
    return _results;
  };
  makeChart = function(title, categories, options, region, table, dest) {
    var defaultOptions, i, k, label, split, total, v, values, _i, _len;
    options || (options = {});
    values = table.values;
    total = 0;
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      total += v;
    }
    defaultOptions = {
      chart: {
        type: 'bar'
      },
      title: {
        text: title
      },
      subtitle: {
        text: 'Source: ABS'
      },
      xAxis: {
        title: {
          text: categories[0].name
        },
        categories: categories[0].labels
      },
      yAxis: {
        min: 0,
        title: {
          text: null
        }
      },
      tooltip: {
        formatter: function() {
          return "" + this.series.name + ": " + this.y + " (" + ((this.y * 100 / total).toFixed(2)) + "%)";
        }
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      series: (function() {
        var _len2, _ref, _results;
        if (categories.length === 1) {
          return [
            {
              data: values
            }
          ];
        } else if (categories.length === 2) {
          split = splitList(values, categories[1].labels.length);
          split = zip(split);
          _ref = categories[1].labels;
          _results = [];
          for (i = 0, _len2 = _ref.length; i < _len2; i++) {
            label = _ref[i];
            _results.push({
              name: label,
              data: split[i]
            });
          }
          return _results;
        }
      })()
    };
    for (k in defaultOptions) {
      v = defaultOptions[k];
      options[k] || (options[k] = v);
    }
    options.chart.renderTo = dest;
    return new Highcharts.Chart(options);
  };
  template = '{{#tables}}\n<div class="row">\n	<div class="span4 columns">\n		<h2>{{name}}</h2>\n	</div>\n	<div class="span12 columns">\n		<div id=\'{{divid}}\'></div>\n	</div>\n</div>\n{{/tables}}';
  $(function() {
    var app;
    app = $.sammy('#content', function() {
      this.get("#/", function() {
        return this.swap('asdfasdfasfd');
      });
      return this.get("#/region/:regionid", function() {
        var regionId;
        regionId = this.params.regionid;
        if (regionId == null) {
          throw new Error('no regionid');
        }
        return getCategories(__bind(function(categories) {
          var catByName, id, name;
          catByName = {};
          for (id in categories) {
            name = categories[id].name;
            catByName[name] = id;
          }
          return request("../../06_" + regionId, __bind(function(error, region) {
            var c, catsKey, i, key, name, options, regionHas, t, tableSpec, templateData, title, v, visibleTables, _i, _len, _len2, _ref;
            if (error) {
              throw new Error;
            }
            visibleTables = [
              {
                t: ['Sex']
              }, {
                t: ['Sex', 'Age']
              }, {
                t: ["Indigenous persons"]
              }, {
                t: ["Country of birth"]
              }, {
                t: ["Highest year of school completed"]
              }, {
                t: ["Social Marital Status"],
                options: {
                  chart: {
                    type: 'pie'
                  }
                }
              }, {
                t: ["Sex", "Religion"]
              }, {
                t: ["Labour Status"]
              }
            ];
            for (i = 0, _len = visibleTables.length; i < _len; i++) {
              tableSpec = visibleTables[i];
              tableSpec.t = (function() {
                var _i, _len2, _ref, _results;
                _ref = tableSpec.t;
                _results = [];
                for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
                  name = _ref[_i];
                  _results.push(catByName[name]);
                }
                return _results;
              })();
            }
            regionHas = {};
            _ref = region.categories[0];
            for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
              v = _ref[_i];
              regionHas[v.join('|')] = true;
            }
            templateData = (function() {
              var _j, _len3, _results;
              _results = [];
              for (_j = 0, _len3 = visibleTables.length; _j < _len3; _j++) {
                tableSpec = visibleTables[_j];
                if (regionHas[tableSpec.t.join('|')]) {
                  t = tableSpec.t, options = tableSpec.options;
                  catsKey = t.join('|');
                  key = "06_" + regionId + "_0_" + catsKey;
                  title = ((function() {
                    var _k, _len4, _results2;
                    _results2 = [];
                    for (_k = 0, _len4 = t.length; _k < _len4; _k++) {
                      c = t[_k];
                      _results2.push(categories[c].name);
                    }
                    return _results2;
                  })()).join(' by ');
                  (function(t, options, catsKey, title) {
                    return request("../../" + key, function(error, table) {
                      var c, tcats;
                      tcats = (function() {
                        var _k, _len4, _results2;
                        _results2 = [];
                        for (_k = 0, _len4 = t.length; _k < _len4; _k++) {
                          c = t[_k];
                          _results2.push(categories[c]);
                        }
                        return _results2;
                      })();
                      return makeChart(title, tcats, options, region, table, "chart " + catsKey);
                    });
                  })(t, options, catsKey, title);
                  _results.push(v = {
                    name: title,
                    divid: "chart " + catsKey
                  });
                }
              }
              return _results;
            })();
            return this.swap(Mustache.to_html(template, {
              tables: templateData
            }));
          }, this));
        }, this));
      });
    });
    return app.run();
  });
}).call(this);
