import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,Dimensions
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";
import {verticalScale, moderateScale} from '../../../utils/Scaling';
const {width} = Dimensions.get('window');

const medicalEquipmentNotificationStyle = StyleSheet.create({
    container: 
        {
            width: width,
            height: hp(100),
            backgroundColor: AppColors.whiteColor,
            marginTop: moderateScale(5),
            justifyContent: 'flex-start',
            alignItems: 'center',
            alignSelf: 'center'
        }    ,
    subContainer:{
        marginRight: moderateScale(5),
        marginLeft: moderateScale(5)
    },

    footerView:{
        backgroundColor: AppColors.white,
        height: verticalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: width
    },seeView:{backgroundColor: AppColors.colorPrimary, width: width},
    seeText:{
        fontFamily: AppStyles.fontFamilyBold,
        color: AppColors.primaryColor,
        fontSize: moderateScale(15),
        alignSelf: 'center',
        alignItems: 'center'
    },
    emptyView:{
        marginRight: moderateScale(5),
        marginLeft: moderateScale(5),
        marginTop: moderateScale(220),
        backgroundColor: AppColors.whiteColor,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    cancelImage:{
        height: verticalScale(100),
        width: moderateScale(100),
    },
    emptyText:{
        color: AppColors.primaryColor,
        fontSize: moderateScale(15),
        fontFamily: AppStyles.fontFamilyBold
    },itemView:{
        flexDirection: 'row',
        width: (width - moderateScale(10)),
        alignSelf: 'center',
        borderBottomWidth: moderateScale(2),
        borderBottomColor: AppColors.lightGray
    },itemImage:{
        height: moderateScale(50),
        width: moderateScale(50),
        borderRadius: moderateScale(25),
        margin: moderateScale(10)
    },itemTitleView:{flex: 2, flexDirection: 'column', margin: moderateScale(10)},
    titleText:{
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(12),
        color: AppColors.blackColor
    },
    dateText:{
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(8),
        marginTop: moderateScale(10),
        color: AppColors.blackColor
    },indicator:{
        marginTop: moderateScale(25),
        alignItems: 'center',
        marginRight: moderateScale(5)
    },indicatorImage:{height: moderateScale(20), width: moderateScale(20)}
  

});

export default medicalEquipmentNotificationStyle;
