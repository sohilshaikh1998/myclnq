import React from 'react';
import {Platform, StyleSheet,I18nManager,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../utils/Scaling";
import {AppUtils} from "../../utils/AppUtils";
import {AppColors} from "../../shared/AppColors";
import {AppStyles} from "../../shared/AppStyles";

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5
const isRTL = I18nManager.isRTL;
const AddRecordsStyles = StyleSheet.create({
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


        btnSubmit:{
            color:'white',
            textAlign:'center',
            paddingTop:hp(1.5),
            paddingBottom:hp(1.5),
            marginLeft:wp(2),
            fontSize:16,
            fontFamily:AppStyles.fontFamilyRegular,
        },
        addRecordSubmit:{
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
        addRecordSubmitText:{
            fontSize: hp(1.9), textAlign: 'center', color: AppColors.whiteColor,
            fontFamily: AppStyles.fontFamilyMedium
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
    modalListContentViewTxt: {
        color: AppColors.textMEGray,width:wp(60),
        fontFamily: AppStyles.fontFamilyRegular,padding:hp(1),
        fontSize: 14,justifyContent:'center',
        textAlign: isRTL ? 'right' : 'auto',
    },
    modalListContentViewTxtAction: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 15,justifyContent:'center',marginTop:hp(.5)
    },
    modalListContentViewTail: {
        width: wp(70),marginTop:hp(1)
        },
    modalListContentViewSubTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,width:wp(35),
        fontSize: 10,justifyContent:'center',marginLeft:wp(1.5)
    }, textViewStyle: {
        alignSelf: 'center', height: hp(4), flexDirection: 'row',
        width: wp(90)
    },

    textTitleStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(1), fontFamily: AppStyles.fontFamilyRegular
    },
    commonView:{flex: 1, flexDirection: 'row', alignItems: 'center'},


    textDataStyle: {
        flex: 1,
        fontSize: hp(1.8), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginRight: wp(1),
        alignSelf: 'center',
        textAlign: 'right',
        fontFamily: AppStyles.fontFamilyRegular
    },
    orderDetailModal:{
        width: wp("100"),
        height: hp("100"),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    }


});

export default AddRecordsStyles;
