import React from 'react';
import {Platform, StyleSheet,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../utils/Scaling";
import {AppUtils} from "../../utils/AppUtils";
import {AppColors} from "../../shared/AppColors";
import {AppStyles} from "../../shared/AppStyles";
const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5

const EditVitalStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.backgroundGray,
    },
    addRecordsTitle:
        {
            color: AppColors.colorHeadings,
            fontFamily: AppStyles.fontFamilyMedium,
            fontSize: 14,marginLeft:wp(2)
        },

    modalListContentView: {
        width: wp(90),
        borderBottomColor: AppColors.greyBorder, borderBottomWidth: wp(.3),
    },

    modalListContentInnerView: {
        flexDirection: 'row',
        paddingTop: hp(.5),
        borderBottomColor: AppColors.greyBorder,
        borderBottomWidth: 0,
    },
    modalListContentInnerActionView: {
        width: wp(75),
        flexDirection: 'row',
        paddingTop: 20,
        borderBottomColor: AppColors.greyBorder,
        borderBottomWidth: 0,
    },
    modalListContentViewHead: {
        width: wp(15),justifyContent:'center',
    },
    modalListMinMaxTxt: {
        color: AppColors.textGray,width:wp(90),paddingTop:hp(2),
        fontFamily: AppStyles.fontFamilyRegular,paddingBottom:hp(2),
        fontSize: 14,justifyContent:'center',borderBottomColor:AppColors.greyBorder,borderBottomWidth:hp(.1)
    },
    modalListContentViewTxt: {
        color: AppColors.textGray,width:wp(70),
        fontFamily: AppStyles.fontFamilyRegular,padding:hp(1),
        fontSize: 14,height:hp(5),justifyContent:'center',
    },
    modalListContentViewTxtAction: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 15,justifyContent:'center',marginTop:hp(.5)
    },

    textViewStyle: {
        alignSelf: 'center', height: hp(4), flexDirection: 'row',
        width: wp(90)
    },



});

export default EditVitalStyle;
