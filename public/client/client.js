(function ($) {

  var formQuery = $("#formQuery");

  var fieldQuery = $("#fieldQuery");

  fieldQuery.val("\
from all documents \n \
where (document has type http://world.silkapp.com/tag/Country) \n \
select document name \n \
and http://world.silkapp.com/tag/Birthdate for http://world.silkapp.com/tag/Head%20of%20Government \n \
and http://world.silkapp.com/tag/Head%20of%20Government \n \
slice from 0 to 99");

  var tabs = $(".tabs");

  var tabTable = $("#table");

  formQuery.submit(function (event) {
    event.preventDefault();
    $.post("/query", {query:fieldQuery.val()}, function (responseAsXml) {
      tabs.removeClass("hidden");
      tabTable.html(responseAsXml);
      var response = [];
      var dates = [];
      var parsed = $($.parseXML(responseAsXml));
      var rows = parsed.find("tbody").find("tr");
      rows.each(function (index) {
        var links = $(rows[index]).find("td").find("a");
        if (links.length === 3) {
          var country = $(links[0]).text();
          var dateOfBirth = new Date($(links[1]).text());
          dateOfBirth = dateOfBirth.getFullYear() + "," + dateOfBirth.getMonth() + "," + dateOfBirth.getDate();
          var headOfState = $(links[2]).text();
          response.push({
            headline:country,
            text:"<p>" + headOfState + " of " + country + " was born on " + dateOfBirth + "</p>",
            startDate:dateOfBirth,
            endDate:dateOfBirth
          });
          dates.push(dateOfBirth);
        }
      });
      var timelineSource = {
        timeline:{
          headline:"Date of Births of Head of States",
          type:"default",
          text:"When were they born?",
          startDate:"1900,1,1",
          date:response
        }
      };
      createStoryJS({
        type:"timeline",
        width:950,
        height:330,
        source:timelineSource,
        embed_id:"timeline"
      });
    });
  });

})(window.jQuery);