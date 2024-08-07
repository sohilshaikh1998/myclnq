import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppUtils } from '../utils/AppUtils';
import { AppColors } from '../shared/AppColors';
import ElevatedView from 'react-native-elevated-view';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { AppStyles } from '../shared/AppStyles';
import { strings } from '../locales/i18n';

const cellWidth = AppUtils.screenWidth / 5;

const LoginPageHeader = () => {
  return (

      <ElevatedView style={styles.headerStyle} elevation={5}>
        <TouchableOpacity
          onPress={() => Actions.LoginOptions()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Image
            style={styles.backArrow}
            source={require('../../assets/images/blackarrow.png')}
          />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTextIOS}>
            {strings('doctor.button.loging')}
          </Text>
        </View>
      </ElevatedView>
    
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    backgroundColor: AppColors.whiteColor,
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(16),
  },
  headerContainer: {
    width: cellWidth * 3,
    height: AppUtils.headerHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow:{
    height: moderateScale(30),
    width: moderateScale(30),
    marginTop: AppUtils.isX ? 16 + 18 : 0,
    marginLeft: 8,
  }
});

export default LoginPageHeader;
