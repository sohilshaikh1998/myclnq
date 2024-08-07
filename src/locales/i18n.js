import AsyncStorage from '@react-native-community/async-storage';
import ReactNative from 'react-native';
import I18n from 'react-native-i18n';

// Import all locales
import en from "./en";
import ms from "./ms";
import zh from "./zh";
import id from "./id";
import ta from "./ta";
import bn from "./bn";
import vi from "./vi";
import km from "./km";
import kk from "./kk";
import ar from "./ar"
import { AppUtils } from '../utils/AppUtils';


// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
  en,
  ms,
  zh,
  id,
  ta,
  bn,
  vi,
  km,
  kk,
  ar
};


const currentLocale = I18n.currentLocale();
// Is it a RTL language?
export const isRTL = currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;


AsyncStorage.getItem('lang').then((lang) => {
   AppUtils.console('dcszfsvxdvc', currentLocale, lang, currentLocale.startsWith('id'));
   if(lang){
    I18n.locale = lang;
   }
   else if(currentLocale.startsWith('zh-Hans')){
    I18n.locale = 'zh';
   }
   else if(currentLocale.startsWith('ms')){
    I18n.locale = 'ms';
   }
   else if(currentLocale.startsWith('id')){
    I18n.locale = 'id';
   }
   else if(currentLocale.startsWith('ta')){
    I18n.locale = 'ta';
   }
   else if(currentLocale.startsWith('bn')){
    I18n.locale = 'bn';
   }
   else if(currentLocale.startsWith('vi')){
    I18n.locale = 'vi';
   }
   else if(currentLocale.startsWith('km')){
    I18n.locale = 'km';
   }
   else if(currentLocale.startsWith('kk-KZ')){
    I18n.locale = 'kk';
   }
   else if(currentLocale.startsWith('ar')){
    I18n.locale = 'ar';
   }
   else{
    I18n.locale = 'en';
   }
})

// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
  return I18n.t(name, params);
};