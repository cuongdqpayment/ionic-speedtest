import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiStorageService } from './apiStorageService';


@Injectable()
export class ApiMapService {
    GOOGLE_API_KEY = 'AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    WEATHER_API_KEY = '22bc862e9465e98d1c74b7351cab36ef';
    /* 
    urlLatLng ='https://maps.googleapis.com/maps/api/geocode/json?latlng=16.0652695,108.2010651&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlAddress='https://maps.googleapis.com/maps/api/geocode/json?address=30%20be%20van%20dan,%20da%20nang&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlRoute='https://maps.googleapis.com/maps/api/directions/json?origin=30%20Be%20van%20dan,%20da%20nang,%20viet%20nam&destination=263%20nguyen%20van%20linh,%20da%20nang&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlWeather='https://api.openweathermap.org/data/2.5/weather?id=1905468&APPID=22bc862e9465e98d1c74b7351cab36ef&units=metric';
    */
    constructor(private httpClient: HttpClient) {}

    getWeatherApi(cityId: number) {
        return this.httpClient.get('https://api.openweathermap.org/data/2.5/weather?id='
            + cityId
            + '&APPID=' + this.WEATHER_API_KEY
            + '&units=metric')
            .toPromise()
            .then(data => {let rtn:any;rtn = data;return rtn})
    }

    getAddressFromLatlng(latlng: string) {
        //return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='
        return this.httpClient.get(ApiStorageService.mapServer + '/getPoint?latlng='
            + latlng
            + '&key=' + this.GOOGLE_API_KEY)
            .toPromise()
            .then(data => {let rtn:any;rtn = data;return rtn})
            //.then(apiJson => apiJson.results[0].formatted_address)
    }

    getLatlngFromAddress(address: string) {
        //return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address='
        return this.httpClient.get(ApiStorageService.mapServer + '/getAddress?address='
            + address
            + '&key=' + this.GOOGLE_API_KEY)
            .toPromise()
            .then(data => {let rtn:any;rtn = data;return rtn})
    }

    
    getRouteApi(startPoint: string, endPoint: string) {
        return this.httpClient.get(
            ApiStorageService.mapServer + '/getRoutes?origin=' + startPoint
            + '&destination=' + endPoint
            + '&key=' + this.GOOGLE_API_KEY
            )
            .toPromise()
            .then(data => {let rtn:any;rtn = data;return rtn})
            .then(apiJson => {
                let routeApi =   {
                                route: apiJson.routes[0].overview_polyline.points,
                                points:this.decodePolyline(apiJson.routes[0].overview_polyline.points),
                                end_address: apiJson.routes[0].legs[0].end_address,
                                end_location: {
                                                lat : apiJson.routes[0].legs[0].end_location.lat,
                                                lng : apiJson.routes[0].legs[0].end_location.lng
                                                },
                                start_address: apiJson.routes[0].legs[0].start_address,
                                start_location: {
                                                lat : apiJson.routes[0].legs[0].start_location.lat,
                                                lng : apiJson.routes[0].legs[0].start_location.lng
                                                },
                                distance: {
                                    text: apiJson.routes[0].legs[0].distance.text,
                                    value: apiJson.routes[0].legs[0].distance.value
                                    },
                                duration: {
                                        text : apiJson.routes[0].legs[0].duration.text,
                                        value : apiJson.routes[0].legs[0].duration.value,
                                     },
                                cost: {
                                    vnd: 18,
                                    usd:0.1
                                }
                            }
                        return routeApi;
                    }
            )

    }



    //chuyen doi chuoi polyline thanh cac toa do diem
    // source: http://doublespringlabs.blogspot.com.br/2012/11/decoding-polylines-from-google-maps.html
    decodePolyline(encoded) {
        // array that holds the points
        var points = []
        var index = 0, len = encoded.length;
        var lat = 0, lng = 0;
        while (index < len) {
            var b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;
            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;
            points.push({ lat: (lat / 1E5), lng: (lng / 1E5) })
        }
        return points
    }


    /**
     * loc = { lat:pos.coords.latitude,
        lng:pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        timestamp:pos.timestamp,
        time_tracking: new Date().getTime()
       }
     * @param newLoc 
     */
    getSpeed(old,newLoc){
        let distance =  this.distance(old.lat,old.lng,newLoc.lat,newLoc.lng);
        let angle = this.angle(old.lat,old.lng,newLoc.lat,newLoc.lng);
        let dtimestamp = newLoc.timestamp - old.timestamp;
        let dtime_tracking =  newLoc.time_tracking - old.time_tracking;
        let old_accuracy = old.accuracy;
        let new_accuracy = newLoc.accuracy;
        let speed = 0;
        let speed1 = 0;
        if (old_accuracy<500 && new_accuracy<500){
            if (newLoc.timestamp && old.timestamp && newLoc.timestamp > old.timestamp)
                speed = Math.round(distance/dtimestamp*1000*60*60);

            speed1 = Math.round(distance/dtime_tracking*1000*60*60);
        } 

        return {
            distance: distance
            , angle: angle
            , dtimestamp: dtimestamp
            , dtime_tracking: dtime_tracking
            , old_accuracy : old.accuracy
            , new_accuracy : newLoc.accuracy
            , speed: speed
            , speed1: speed1
        }
    }


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    distance(lat1:number, lon1:number, lat2:number, lon2:number, unit?:"M"|"K"|"N") {
        if (!unit) unit="K";
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }
            return dist;
        }
    }

    angle(cx:number, cy:number, ex:number, ey:number) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }
}
