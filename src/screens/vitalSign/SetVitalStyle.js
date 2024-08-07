import React from 'react';
import {Platform, StyleSheet,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../utils/Scaling";
import {AppUtils} from "../../utils/AppUtils";
import {AppColors} from "../../shared/AppColors";
import {AppStyles} from "../../shared/AppStyles";

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5

const SetVitalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.backgroundGray,
    },
    addRecordsTitle:
        {
            color: AppColors.blackColor,
            fontFamily: AppStyles.fontFamilyMedium,
            fontSize: 14,marginLeft:wp(.5)
        },


        btnSubmit:{
            backgroundColor:'#ff4848',
            color:'white',
            borderColor:'#ff4848',
            borderWidth:hp(.2),
            borderRadius:hp(1),
            width:wp(90),
            textAlign:'center',
            paddingTop:hp(1.5),
            paddingBottom:hp(1.5),
            marginLeft:wp(2),
            fontSize:16,
            fontFamily:AppStyles.fontFamilyRegular,
        },

    confirmBtn: {
        borderRadius: 23,
        backgroundColor: AppColors.primaryColor,
        height: hp(6),
        width: wp(35),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(0.8)
    },
    confirmBtnTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    modalListContentView: {
        alignItems: 'center',
    },
    modalListContentViewRange: {
        width: wp(90),
        borderBottomColor: AppColors.greyBorder, borderBottomWidth: wp(.1),

    },
    modalListActionView: {
        width: wp(90),
        borderColor: AppColors.greyBorder,
        borderWidth: 0,
        alignItems: 'center',
        borderRadius: hp(2),
        marginTop: hp(1),
        marginBottom: hp(1),
        backgroundColor: AppColors.whiteColor,
        elevation: 3,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: .2,
        shadowColor: '#000000',

    },
    modalListContentInnerView: {
        flexDirection: 'row',alignItems:'center',paddingTop:hp(1),paddingBottom:hp(1),
        borderBottomColor: AppColors.greyBorder,
        borderBottomWidth: 0,marginLeft:wp(1)
    },
    modalListContentInnerViewVital: {
        flexDirection: 'row',
        paddingTop: hp(2),paddingBottom:hp(1),
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
        width: wp(15),
    },
    modalListContentViewTxt: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 15,marginTop:hp(.5),width:wp(65)
    },
    modalListContentViewVitalTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 14,
    }
    ,modalListMinMAXTxt: {
        color: AppColors.textGray,
        width:wp(20),
        height:hp(4.5),
        fontFamily: AppStyles.fontFamilyRegular,
        justifyContent:'center',
        marginRight:hp(1.5) ,
        borderWidth:wp(.1),borderColor:AppColors.greyBorder,
        borderRadius:hp(.6),padding:wp(1)
     }
     ,
    modalListContentViewTxtAction: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 14,justifyContent:'center',marginTop:hp(.5)
    },
    modalListContentViewTail: {
        width: wp(70),
        },
    modalListContentViewSubTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 8,justifyContent:'center',width:wp(20)
    }, textViewStyle: {
        alignSelf: 'center', height: hp(4), flexDirection: 'row',
        width: wp(90)
    },


});

export default SetVitalStyles;
