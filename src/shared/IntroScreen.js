import React, {  useLayoutEffect } from 'react';
import { View, Image } from 'react-native';
import { AppStrings } from './AppStrings';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import { AppUtils } from '../utils/AppUtils';
import { AppColors } from './AppColors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const IntroScreen = () => {
  useLayoutEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    const checkLoggedInString = await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN);
    const checkLoggedIn = JSON.parse(checkLoggedInString);

    AppUtils.firstTimeUser(async function (isFirstTimeUser) {

      if (isFirstTimeUser) {
        Actions.HelpTour();
      } else {
        await AsyncStorage.setItem(AppStrings.contracts.firstTimeUser, JSON.stringify('false'));
        if (checkLoggedIn?.isLoggedIn) {
          Actions.MainScreen();
        } else {
          // Actions.LoginMobile();
          Actions.LoginOptions();
        }
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.colorHeadings, justifyContent: 'center',alignItems:'center' }}>
      <Image style={{ height: hp(20), width: hp(20) }} resizeMode={'contain'} source={require('../../assets/images/clnq_main_logo.png')} />
    </View>
  );
};

export default IntroScreen;
