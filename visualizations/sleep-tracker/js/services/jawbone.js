angular
    .module('hdcSleepTracker.jawbone', [])
    .factory(
        'jawbone',
        function(){
          var jawboneService = {};
          /**
           * Function that checks if an HDC record is a valid sleep record from
           * Jawbone UP.
           */
          jawboneService.isJawboneSleepRecord = function(record){
            // A jawbone record should have a meta property, and a data property
            // with items
            if (record.meta === undefined || record.data === undefined
                || record.data.items === undefined) {
              return false;
            }
            // If there are no items in the data element then ignore this
            // element
            if (record.data.items.length == 0) {
              return false;
            }
            // Now we are going to deal with sleeping records, first make sure
            // that
            // for every item we have an xid and an associated sleep phases
            // object
            // in the main element. Additionally check that every element has a
            // details object and at least the following properties
            // asleep_time, awake_time, sunset, sunrise, quality
            if (!_.every(record.data.items, function(childElem){
              if (childElem.xid === undefined
                  || record[childElem.xid] === undefined) {
                return false;
              }
              if (childElem.details === undefined
                  || childElem.details.asleep_time === undefined
                  || childElem.details.awake_time === undefined
                  || childElem.details.sunset === undefined
                  || childElem.details.sunrise === undefined
                  || childElem.details.quality === undefined) {
                return false;
              }
              return true;
            })) {
              return false;
            }
            return true;
          };
          /**
           * Function that parses a Jawbone UP sleep record into a sleep data
           * object that can be displayed by the visualizations library's
           * sleepcycle directive.
           */
          jawboneService.fromJawboneSleep = function(record){
            var item = {};
            // Sunset and sunrise are set using the date from the first
            // sleep item in the daily records.
            item.sunset = toHours(record.data.items[0].details.sunset);
            item.sunrise = toHours(record.data.items[0].details.sunrise);

            // Start datetime is given by the time_created of the first item in
            // the
            // sleep list
            item.start_date = new Date(record.data.items[0].time_created * 1000);
            // End datetime is given by the time_completed of the last item in
            // the
            // sleep list
            item.end_date = new Date(
                record.data.items[record.data.items.length - 1].time_completed * 1000);
            // Quality of the sleep is calculated as the maximum quality of all
            // records
            item.quality = _.max(record.data.items, function(val){
              return parseInt(val.details.quality);
            }).details.quality;
            item.data = [];
            record.data.items.forEach(function(val){
              var absoluteEnd = val.time_completed;
              var lastObject = null;
              var ticks = record[val.xid].data.items;
              ticks.forEach(function(tick){
                if (lastObject) {
                  lastObject.endTime = new Date(tick.time * 1000);
                }
                var newEvent = null;
                newEvent = {
                  startTime : new Date(tick.time * 1000),
                  colorClass : getSleepColor(tick.depth),
                  description : getSleepDescription(tick.depth)
                };
                lastObject = newEvent;
                item.data.push(lastObject);
              });
              lastObject.endTime = new Date(absoluteEnd * 1000);
            });
            return item;
          };
          /**
           * Auxiliary function that maps from Jawbone UP int codes for sleep
           * depth to the corresponding CSS class for the sleepcycle directive
           * from the visualizations library.
           */
          var getSleepColor = function(depth){
            switch (depth) {
              case 1:
                return 'awake';
              case 2:
                return 'light-sleep';
              case 3:
                return 'deep-sleep';
            }
          };
          /**
           * Function that maps from the Jawbone UP sleep to a string
           * description of the sleep status at that point.
           */
          var getSleepDescription = function(depth){
            switch (depth) {
              case 1:
                return 'Awake';
              case 2:
                return 'Light sleep';
              case 3:
                return 'Sound sleep';
            }
          };
          /**
           * Function that transforms a timestamps in seconds to the
           * corresponding hour in the day in 24 hour format with decimal
           * accounting for the minutes.
           */
          var toHours = function(timestamp){
            var tmpDate = new Date(timestamp * 1000);
            return tmpDate.getHours() + tmpDate.getMinutes() / 60;
          };
          return jawboneService;
        });