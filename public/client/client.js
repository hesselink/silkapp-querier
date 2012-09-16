(function ($) {

  window.model = window.model || {};

  var body = $("body");

  var fieldSites = $("#sites");

  var fieldDocument = $("#document");

  var fieldTags = $("#tags");

  var fieldQuery = $("#query");

  var timeline = $("#timeline");

  var error = $("#error");

  fieldSites.change(function (event) {
    event.preventDefault();
    timeline.hide();
    error.hide();
    fieldDocument.empty();
    fieldTags.empty();
    var site = fieldSites.val();
    if (!site) return;
    refreshDocuments(site);
  });

  fieldDocument.change(function (event) {
    event.preventDefault();
    timeline.hide();
    error.hide();
    fieldTags.empty();
    var documentName = fieldDocument.val();
    if (!documentName) return;
    refreshTags(documentName);
    generateQuery();
  });

  fieldTags.change(function (event) {
    event.preventDefault();
    if (!fieldTags.val()) return;
    var tag = findTagByName(fieldTags.val());
  });

  refreshSites();

  function findTagByName(name) {
    return model.tags.find(function (tag) {
      return tag.name.$t === name;
    })
  }

  function hasDateType(tag) {
    if (!tag || !tag.types) return false;
    var result = false;
//    var dateValues = ["year", "date", "datetime"];
    var dateValues = ["date"];
    if (Array.isArray(tag.types["with-count"])) {
      tag.types["with-count"].forEach(function (withCount) {
        if (dateValues.indexOf(withCount.value.$t) !== -1) result = true;
      });
    } else {
      if (dateValues.indexOf(tag.types["with-count"].value.$t) !== -1) result = true;
    }
    return result;
  }

  function refreshSites() {
    $.get("/sites", function (response) {
      model.sites = response.list.items.site;
      model.sites.forEach(function (site) {
        site.documentCount = new Number(site.documents.$t);
      });
      model.sites = model.sites.sortBy("documentCount").reverse();
      model.sites.forEach(function (site) {
        var label = site.uri.$t + ".......Documents: " + site.documentCount;
        var value = site.uri.$t;
        fieldSites.append("<option value='" + value + "'>" + label + "</option>");
      });

      fieldSites.prepend("<option value='world.silkapp.com'>world.silkapp.com.......Default</option>");
      fieldSites.trigger("change");
    });
  }

  function refreshDocuments(site) {
    $.get("/tags", {site:site}, function (response) {
      model.tags = response.tags.tag;
      if (!model.tags || !Array.isArray(model.tags)) return;
      model.tags.forEach(function (tag) {
        tag.totalCount = new Number(tag.total.$t);
        tag.docLevel = new Number(tag.doclevel.$t);
      });
      model.documents = model.tags.filter(function (potentialDocument) {
        if (potentialDocument.doclevel.$t === "0") return false;
        else {
          var childTags = model.tags.filter(function (tag) {
            if (!tag.context["with-count"]) return false;
            if (tag === document) return false;
            var value = "http://" + fieldSites.val() + "/tag/" + potentialDocument.name.$t;
            if (Array.isArray(tag.context["with-count"])) {
              for (var i = 0; i < tag.context["with-count"].length; i++) {
                if (value === tag.context["with-count"][i].value.$t) return true;
              }
            } else if (tag.context["with-count"].value.$t === value) {
              return true;
            }
            return false;
          });
          var result = false;
          childTags.forEach(function (tag) {
            if (hasDateType(tag)) {
              result = true;
            }
          });
          return result;
        }
      });
      model.documents.forEach(function (tag) {
        var value = tag.name.$t;
        var label = tag.name.$t;
        fieldDocument.append("<option value='" + value + "'>" + label + "</option>");
      });
      fieldDocument.trigger("change");
    });
  }

  function refreshTags(documentName) {
    var document = findTagByName(documentName);
    var tags = model.tags.filter(function (tag) {
      if (!tag.context["with-count"]) return false;
      if (tag === document) return false;
      var value = "http://" + fieldSites.val() + "/tag/" + document.name.$t;
      if (Array.isArray(tag.context["with-count"])) {
        for (var i = 0; i < tag.context["with-count"].length; i++) {
          if (value === tag.context["with-count"][i].value.$t) return true;
        }
      } else if (tag.context["with-count"].value.$t === value) {
        return true;
      }
      return false;
    });
    tags = tags.sortBy("totalCount").reverse();
    tags.forEach(function (tag) {
      var value = tag.name.$t;
      var label = tag.name.$t + ".......Total: " + tag.totalCount;
      var selected = "";
      if (hasDateType(tag)) selected = " selected='true' ";
      var option = $("<option value='" + value + "' " + selected + ">" + label + "</option>");
      fieldTags.append(option);
    });
  }

  function generateQuery() {
    var host = fieldSites.val();
    var document = findTagByName(fieldDocument.val());
    var tag = findTagByName(fieldTags.val());
    if (!document || !tag) {
      timeline.hide();
      error.show();
      return;
    } else {
      var query = "from all documents where (document has type " + document.uri + ") \n";
      query += "select document name and " + tag.uri;
      fieldQuery.val(query);
      submitQuery();
    }
  }

  function submitQuery() {
    var host = fieldSites.val();
    var query = fieldQuery.val();
    if (!host || !query) return;

    $.post("/query", {query:query, host:host}, function (response) {
      if (!response.table.tbody.tr || !Array.isArray(response.table.tbody.tr)) return;
      var parsedResponse = [];
      response.table.tbody.tr.forEach(function (tr) {
        if (!tr.td[0] || !tr.td[1] || !tr.td[0].a || !tr.td[1].a) return;
        var label = tr.td[0].a.$t;
        var rawDate = tr.td[1].a["data-normalized-date"];
        if (!rawDate) return;
        var date = new Date(rawDate.split(",")[1]);
        var startDate = date.getFullYear() + "," + date.getMonth() + "," + date.getDate();
        var endDate = date.getFullYear() + "," + date.getMonth() + "," + date.getDate();
        parsedResponse.push({
          headline:label,
          text:"",
          startDate:startDate,
          endDate:endDate
        });
      });
      if (parsedResponse.length === 0) return;
      else {
        timeline.show();
        error.hide();
        var timelineSource = {
          timeline:{
            headline:"Headline",
            type:"default",
            text:"Text?",
            startDate:"1900,1,1",
            date:parsedResponse
          }
        };
        createStoryJS({
          type:"timeline",
          width:950,
          height:330,
          source:timelineSource,
          embed_id:"timeline"
        });
      }
    });
  }

})(window.jQuery);