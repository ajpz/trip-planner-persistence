$.ajax({
    method: 'POST',
    url: '/api/days',
    data : { number: 4 },
    dataType: 'json',
    success: function(dayData) {
        console.log("DayData:", dayData);
    },
    error: function(errorObj) {
        console.log(errorObj);
    }
});

$.ajax({
    method: 'DELETE',
    url: '/api/days/4',
    success: function(dayData) {
        console.log("DayData:", dayData);
    },
    error: function(errorObj) {
        console.log(errorObj);
    }
});


$.ajax({
    method: 'GET',
    url: '/api/days/1',
    success: function(dayData) {
        console.log("DayData:", dayData);
    },
    error: function(errorObj) {
        console.log(errorObj);
    }
});




$.get('/api/days', function (data) {console.log('GET response data', data)})
  .fail( function (err) {console.error('err', err)} );
// should log an empty array
$.post('/api/days', function (data) {console.log('POST response data', data)})
  .fail( function (err) {console.error('err', err)} );
// should log a new day
$.get('/api/days', function (data) {console.log('GET response data', data)})
  .fail( function (err) {console.error('err', err)} );
// should now log an array with the new day in it