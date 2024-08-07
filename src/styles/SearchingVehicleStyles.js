import React from 'react';
import {StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AppStyles} from "../shared/AppStyles";
import {AppColors} from "../shared/AppColors";


const styles = StyleSheet.create({

    content: {
        width: wp('100%'),
        height: hp('100%'),
        alignItems: 'center',
        backgroundColor: '#FF4848',
    },
    yourCare: {
        fontSize: hp('5%'),
        textAlign: 'center',
        fontFamily: AppStyles.fontFamilyBold,
        color: 'white',
        letterSpacing: 2
    },
    pickupScreenHeader: {
        height: hp(7),
        width: wp(100),
        backgroundColor: AppColors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 30
    },
    pickupDetails: {
        width:wp(50),
        color: AppColors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 18,textAlign:'center',
        marginLeft:wp(30)
    },
    backArrowIcon: {
        height: hp(4),
        width: wp(9),
        marginLeft: 10,
        tintColor: AppColors.whiteColor
    },
    textStyle: {
        fontSize: hp(2.8),
        alignContent: 'center',
        textAlign: 'center',
        fontFamily: AppStyles.fontFamilyDemi,
        color: AppColors.blackColor,
        paddingHorizontal: hp(2.5),
        paddingVertical: hp(2),
        lineHeight: hp(3),
      },
      buttonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.whiteColor,
        borderRadius: hp(1),
      },

});
export default styles;