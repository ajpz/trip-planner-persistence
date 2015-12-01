$(function() {

    var map = initialize_gmaps();

    var days = [
        []
    ];

    var currentDay = 1;

    var placeMapIcons = {
        activities: '/images/star-3.png',
        restaurants: '/images/restaurant.png',
        hotels: '/images/lodging_0star.png'
    };

    var $dayButtons = $('.day-buttons');
    var $addDayButton = $('.add-day');
    var $placeLists = $('.list-group');
    var $dayTitle = $('#day-title');
    var $addPlaceButton = $('.add-place-button');

    // GET all day data already loaded in database
    $.ajax({
        method: 'GET',
        url: '/api/days',
        success: function(data) {
            var dayNumber, hotelId, dayActivityArray, dayRestaurantArray;
            data.forEach(function(day) {

                dayNumber = day.number; 
                hotelId = day.hotel; //check undefined
                dayActivityArray = day.activities; // array of _ids
                dayRestaurantArray = day.restaurants; // array of _ids

                var hotelObj = getPlaceObjectById('hotels', hotelId); 
                addPlaceToDaysArray(dayNumber, 'hotels', hotelObj)
                
                dayActivityArray.forEach(function(activityId) {
                    var activityObj = getPlaceObjectById('activities', activityId); 
                    addPlaceToDaysArray(dayNumber, 'activities', activityObj); 
                })
                
                dayRestaurantArray.forEach(function(restaurantId) {
                    var restaurantObj = getPlaceObjectById('restaurants', restaurantId);                     
                    addPlaceToDaysArray(dayNumber, 'restaurants', restaurantObj); 
                })

            });
            setDay(currentDay); 
            setDayButtons(); 
        },
        error: function(errorObj) {
            console.log(errorObj);
        }
    });

    // take data from db and refresh entire local days object
    var addPlaceToDaysArray = function(dayNumber, placeType, placeObj) {

        var $listToAppendTo = $('#' + placeType + '-list').find('ul');
        var createdMapMarker = drawLocation(map, placeObj.place[0].location, {
            icon: placeMapIcons[placeType]
        });

        if(!days[dayNumber -1]) days[dayNumber - 1] = [];  
        days[dayNumber - 1].push({
            place: placeObj,
            marker: createdMapMarker,
            section: placeType
        });
    }

    var createItineraryItem = function(placeName) {

        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');

        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        return $item;

    };

    // DRAW BUTTONS TO SCREEN
    var setDayButtons = function() {
        $dayButtons.find('button').not('.add-day').remove();
        days.forEach(function(day, index) {
            $addDayButton.before(createDayButton(index + 1));
        });
    };

    var getPlaceObject = function(typeOfPlace, nameOfPlace) {
        var placeCollection = window['all_' + typeOfPlace];

        return placeCollection.filter(function(place) {
            return place.name === nameOfPlace;
        })[0];

    };

    var getPlaceObjectById = function(typeOfPlace, _id) {

        var placeCollection = window['all_' + typeOfPlace];

        return placeCollection.filter(function(place) {
            return place._id === _id;
        })[0];

    };

    var getIndexOfPlace = function(nameOfPlace, collection) {
        var i = 0;
        for (; i < collection.length; i++) {
            if (collection[i].place.name === nameOfPlace) {
                return i;
            }
        }
        return -1;
    };

    var createDayButton = function(dayNum) {
        return $('<button class="btn btn-circle day-btn"></button>').text(dayNum);
    };

    var reset = function() {

        var dayPlaces = days[currentDay - 1];
        if (!dayPlaces) return;

        $placeLists.empty();

        dayPlaces.forEach(function(place) {
            place.marker.setMap(null);
        });

    };

    var removeDay = function(dayNum) {

        if (days.length === 1) return;
        // AJAX
        // DELETE requests sent to remove an entire day object
        $.ajax({
            method: "DELETE",
            url: "/api/days/" + dayNum.toString(),
            success: function(obj) {
                console.log("Delete response: ", obj);
                reset();

                days.splice(dayNum - 1, 1);

                setDayButtons();
                setDay(1);
            },
            error: function(err) {
                console.error(err);
            }
        });
    };

    var mapFit = function() {

        var bounds = new google.maps.LatLngBounds();
        var currentPlaces = days[currentDay - 1];

        currentPlaces.forEach(function(place) {
            bounds.extend(place.marker.position);
        });

        map.fitBounds(bounds);

    };

    var setDay = function(dayNum) {

        if (dayNum > days.length || dayNum < 0) {
            return;
        }

        var placesForThisDay = days[dayNum - 1];
        var $dayButtons = $('.day-btn').not('.add-day');

        reset();

        currentDay = dayNum;

        placesForThisDay.forEach(function(place) {
            $('#' + place.section + '-list').find('ul').append(createItineraryItem(place.place.name));
            place.marker.setMap(map);
        });

        $dayButtons.removeClass('current-day');
        $dayButtons.eq(dayNum - 1).addClass('current-day');

        $dayTitle.children('span').text('Day ' + dayNum.toString());

        mapFit();

    };

    // var getAPlaceObject = function(sectionName, placeName) {
    //     return window['all_' + sectionName].filter(function(placeObj) {
    //         return placeObj.name === placeName;
    //     })[0];
    // };

    // ADD NEW PLACE TO DAY ITINERARY - ADD LOCALLY AND ON DB
    $addPlaceButton.on('click', function() {

        var $this = $(this);
        var sectionName = $this.parent().attr('id').split('-')[0];
        var $listToAppendTo = $('#' + sectionName + '-list').find('ul');
        var placeName = $this.siblings('select').val();
        var placeObj = getPlaceObject(sectionName, placeName);

        var createdMapMarker = drawLocation(map, placeObj.place[0].location, {
            icon: placeMapIcons[sectionName]
        });

        // get place Id - either a hotel, restaurant or activity

        console.log(placeObj._id);
        // AJAX
        // PUT - adds a place to a day's itinerary
        // route is /api/days/:id/:sectionName 
        $.ajax({
            method: 'PUT',
            url: '/api/days/' + currentDay.toString() + '/' + sectionName,
            data: {
                // sectionName: sectionName,
                _id: placeObj._id
            },
            success: function(updatedDayObj) {
                console.log('put success, response: ', updatedDayObj);
                days[currentDay - 1].push({
                    place: placeObj,
                    marker: createdMapMarker,
                    section: sectionName
                });
                var $item = createItineraryItem(placeName); 
                $item.find('button').attr('data-id', placeObj._id); 

                $listToAppendTo.append($item);
                mapFit();
            },
            error: function(err) {
                console.log(err.message);
            }
        });


    });

    $placeLists.on('click', '.remove', function(e) {

        var $this = $(this);
        var $listItem = $this.parent().parent();
        var nameOfPlace = $this.siblings('span').text();
        var indexOfThisPlaceInDay = getIndexOfPlace(nameOfPlace, days[currentDay - 1]);
        var placeInDay = days[currentDay - 1][indexOfThisPlaceInDay];

        // parse sectionName from DOM
        var sectionName = $listItem.parent().parent().attr('id').split('-')[0]; 
        console.log('in placeLists: ', sectionName); 
        console.log('id is: ', $this.attr('data-id')); 

        // AJAX
        // ajax PUT to remove a place from a day's itinerary 
        $.ajax({
            method: 'DELETE', 
            url: 'api/days/' + currentDay + '/' + sectionName, 
            data: { _id : $this.attr('data-id') }, 
            success: function(response) {
                console.log('Remove place response: ', response); 
                placeInDay.marker.setMap(null);
                days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);
                $listItem.remove();
            } 
        })
    });

    $dayButtons.on('click', '.day-btn', function() {
        setDay($(this).index() + 1);
    });

    $addDayButton.on('click', function() {

        var currentNumOfDays = days.length;
        var $newDayButton = createDayButton(currentNumOfDays + 1);

        // data to be sent to server for the new day
        var data = { number: currentNumOfDays + 1 };

        // AJAX
        // POSTs to /api/days --> should find or create a day with "number"
        $.post('api/days', data, function(response) {
                console.log('post response: ', response);
                $addDayButton.before($newDayButton);
                days.push([]);
                setDayButtons();
                setDay(currentNumOfDays + 1);
            })
            .fail(function(err) {
                console.error(err);
            });


    });

    $dayTitle.children('button').on('click', function() {

        removeDay(currentDay);

    });

});
