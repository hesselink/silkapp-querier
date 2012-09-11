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
    $.post("/query", {query:fieldQuery.val()}, function (response) {
      tabs.removeClass("hidden");
      tabTable.html(response);
    });
  });

})(window.jQuery);