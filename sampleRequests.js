$.ajax({
    method: 'POST',
    url: '/api/days',
    data : { number: 1 },
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