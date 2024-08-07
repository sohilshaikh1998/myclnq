import moment from 'moment-timezone'
import {AppUtils} from "../utils/AppUtils";

export class Validator {
    static validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    static isBlank = (field) => {
        field += "";
        if (field != null && field != undefined && field != "" && field.length > 0 && field != "undefined") {
            return false;
        } else {
            return true;
        }
    }
    static isValidPassword = (password) => {
        var re = /^(?=.*\d).{6,20}$/
        return re.test(password);
    }

    static isValidDOB(dob, relation) {
        let currentDate = moment(new Date());
        let dateOfBirth = moment(dob);

        let diff = currentDate.diff(dateOfBirth);
        let diffInYears = (diff / 1000 / 60 / 60 / 24 / 365);
        if (diffInYears <= 15 && relation == 'self') {
            return true;
        } else if (diffInYears <= 0 && relation != "self") {
            return true;
        } else if (diffInYears > 15 && relation != 'self') {
            return false;
        }

    }

    static isValidHeightWeight = (height, weight) => {
        if ((height == '' && weight != '') || (height != '' && weight == '')) {
          return true;
        } else if (height == undefined || weight == undefined) {
          return true;
        } else {
          return false;
        }
      };


    static checkCountry(code, country) {
        AppUtils.console("getCountry", code)
        let check;
        let countryCodes = [{ 'code': '65', 'country': 'Singapore' }, { 'code': '91', 'country': 'India' }, { 'code': '60', 'country': 'Malaysia' }, { 'code': '66', 'country': 'Thailand' }, { 'code': '62', 'country': 'Indonesia' }, { 'code': '27', 'country': 'South Africa' }]
        countryCodes.map((item) => {
            //We need to return the corresponding mapping for each item too.
            if (item.code == code) {
                AppUtils.console("checkCountry", item.country, "country", country)

                if (item.country == country) {
                    check = true
                } else {
                    check = false
                }
            }


        });
        return check;


    }

    static validateNRIC(str) {
        // if (str.length != 9)
        //     return false;
        //
        // str = str.toUpperCase();
        // var i, icArray = [];
        //
        // for (i = 0; i < 9; i++) {
        //     icArray[i] = str.charAt(i);
        // }
        //
        // icArray[1] = parseInt(icArray[1], 10) * 2;
        // icArray[2] = parseInt(icArray[2], 10) * 7;
        // icArray[3] = parseInt(icArray[3], 10) * 6;
        // icArray[4] = parseInt(icArray[4], 10) * 5;
        // icArray[5] = parseInt(icArray[5], 10) * 4;
        // icArray[6] = parseInt(icArray[6], 10) * 3;
        // icArray[7] = parseInt(icArray[7], 10) * 2;
        //
        // var weight = 0;
        // for (i = 1; i < 8; i++) {
        //     weight += icArray[i];
        // }
        //
        // var offset = (icArray[0] == "T" || icArray[0] == "G") ? 4 : 0;
        // var temp = (offset + weight) % 11;
        //
        // var st = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
        // var fg = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];
        //
        // var theAlpha;
        // if (icArray[0] == "S" || icArray[0] == "T") {
        //     theAlpha = st[temp];
        // }
        // else if (icArray[0] == "F" || icArray[0] == "G") {
        //     theAlpha = fg[temp];
        // }
        //
        // return (icArray[8] === theAlpha);

        return true;
    }
}
