$(function() {

    var map = initialize_gmaps();

    var days = [
        []
    ];
    $.ajax({
        method: 'DELETE',
        url: '/api/days/doomswitch',
        success: function(response) {
            console.log(response);
            $.post('api/days', { number: 1}, function(response) {
                    // $addDayButton.before($newDayButton);
                    // days.push([]);
                    // setDayButtons();
                    // setDay(1);
                })
                .fail(function(err) {
                    console.error(err);
                });
        },
        error: function(err) {
            console.log(err.message);
        }
    });

    // $.ajax({
    //     method: 'GET',
    //     url: '/api/days',
    //     success: function(data) {
    //         var hotelId, dayActivityArray, dayRestaurantArray;
    //         data.forEach(function(day) {

    //             hotelId = day.hotel; //check undefined
    //             dayActivityArray = day.activites;
    //             dayRestaurantArray = day.restaurants;

    //             days[day.number - 1].push( {} );
    //         });
    //         days[currentDay - 1].push({place: placeObj, marker: createdMapMarker, section: sectionName});

    //     },
    //     error: function(errorObj) {
    //         console.log(errorObj);
    //     }
    // });



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

    var createItineraryItem = function(placeName, _id) {

        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');

        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle" data-id=' + _id + '>x</button>');

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

    var getAPlaceObject = function(sectionName, placeName) {
        return window['all_' + sectionName].filter(function(placeObj) {
            return placeObj.name === placeName;
        })[0];
    };

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

        // get place Id
        var placeObj = getAPlaceObject(sectionName, placeName);

        console.log(placeObj._id);
        // ajax PUT
        $.ajax({
            method: 'PUT',
            url: '/api/days/' + currentDay.toString(),
            data: {
                sectionName: sectionName,
                _id: placeObj._id
            },
            success: function(updatedDayObj) {
                console.log('put success, response: ', updatedDayObj);
                days[currentDay - 1].push({
                    place: placeObj,
                    marker: createdMapMarker,
                    section: sectionName
                });
                $listToAppendTo.append(createItineraryItem(placeName, placeObj._id));
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

        placeInDay.marker.setMap(null);
        days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);
        $listItem.remove();

    });

    $dayButtons.on('click', '.day-btn', function() {
        setDay($(this).index() + 1);
    });

    $addDayButton.on('click', function() {

        var currentNumOfDays = days.length;
        var $newDayButton = createDayButton(currentNumOfDays + 1);
        var data = {
            number: parseInt(currentNumOfDays + 1)
        };

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
