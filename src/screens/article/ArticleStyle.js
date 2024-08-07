import React from 'react';
import { Platform, StyleSheet,I18nManager } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppUtils } from '../../utils/AppUtils';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5;
const isRTL = I18nManager.isRTL;

const ArticleStyle = StyleSheet.create({
  textViewStyle: {
    alignSelf: 'center',
    height: hp(6),
    flexDirection: 'row',
    width: wp(90),
    borderBottomWidth: 1,
    borderColor: AppColors.backgroundGray,
  },

  textTitleStyle: {
    flex: 1,
    fontSize: hp(2),
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: 'center',
    paddingLeft: wp(5),
    fontFamily: AppStyles.fontFamilyRegular,
  },

  textDataStyle: {
    flex: 1,
    fontSize: hp(2),
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginLeft: wp(25),
    alignSelf: 'center',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    marginLeft: moderateScale(120),
    marginTop: Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  searchViewMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  searchInputStyle: {
    width: wp(94),
    alignSelf: 'center',
    borderWidth: hp(0.2),
    borderRadius: hp(1),
    fontSize: 16,
    marginTop: hp(1.8),
    padding: hp(1.5),
    paddingLeft: wp(13),
    borderColor: AppColors.greyBorder,
    backgroundColor: '#F8F8F8',
    textAlign: isRTL ? 'right' : 'auto',
  },
  searchIcon: {
    height: hp(3),
    width: hp(3),
    position: 'absolute',
    top: hp(3.5),
    left: wp(6.5),
  },
  topArticleHeader: {
    backgroundColor: AppColors.whiteColor,
    width: wp(38),
    alignSelf: 'center',
  },
  topSubView: {
    flexDirection: 'row',
    padding: hp(0.5),
    marginLeft: wp(4),
  },
  topImage: {
    height: wp(30),
    width: wp(30),
    borderRadius: moderateScale(10),
  },
  topTitle: {
    color: AppColors.blackColor,
    height: hp(8),
    marginLeft: wp(5),
    marginTop: hp(3),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(1.9),
  },
  articleHead: {
    backgroundColor: AppColors.whiteColor,
    width: wp(90),
    marginLeft: wp(4),
    alignSelf: 'center',
    justifyContent: 'center',
  },
  articleSub: { flexDirection: 'row', borderBottomWidth: 1, borderColor: AppColors.backgroundGray, paddingBottom: hp(1) },
  articleImage: {
    height: hp(10),
    width: hp(10),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(2),
    marginBottom: moderateScale(10),
  },
  articleTitle: {
    color: AppColors.blackColor,
    width: wp(60),
    marginTop: hp(1),
    marginLeft: wp(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2.1),
  },
  articleBottom: {
    flexDirection: 'row',
    flex: 1,
    marginTop: hp(1.5),
    height: hp(5),
    
  },
  articleTopic: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    marginLeft: wp(6),
    backgroundColor: AppColors.lightPink2,
    alignSelf: 'center',
    borderRadius: 8,
    height: hp(3.5),
    width: wp(25),
    borderWidth: 1,
    borderColor: AppColors.lightPink2,
  },
  topicText: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: wp(2),
    paddingRight: wp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    textAlign: 'center',
    fontSize: moderateScale(10),
    color: AppColors.colorHeadings,
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  visibility: {
    height: wp(3),
    width: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp(0.1),
    // marginTop: AppUtils.isX ? 16 + 18 : 0,
  },
  numOfViews: {
    color: AppColors.textGray,
    width: wp(8),
    height: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isIphone ? hp(0.8) : hp(0.3),

    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.2),
  },
  publishedOn: {
    color: AppColors.textGray,
    width: wp(22),
    height: hp(2),
    textAlign: 'right',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 2 : 0,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.3),
  },
  suggestionHead: {
    alignContent: 'center',
    height: hp(6),
    borderColor: AppColors.greyBorder,
    marginLeft: hp(1),
    flexDirection: 'row',
    borderTopWidth: hp(0),
    borderBottomWidth: hp(0.1),
    borderLeftWidth: hp(0.1),
    borderRightWidth: hp(0.1),
    padding: hp(2),
  },
  recentIcon: {
    height: hp(2),
    marginTop: hp(0.2),
    width: hp(2),
    tintColor: AppColors.textGray,
    borderRadius: hp(2),
  },
  recentTitle: {
    fontSize: hp(2),
    height: hp(3),
    color: '#000000',
    marginLeft: hp(1.5),
    fontFamily: AppStyles.fontFamilyMedium,
  },
  searchTopicText: {
    alignContent: 'center',
    height: hp(5),
    borderColor: AppColors.greyBorder,
    flexDirection: 'row',
    borderTopWidth: hp(0.1),
    borderBottomWidth: hp(0),
    borderLeftWidth: hp(0.1),
    borderRightWidth: hp(0.1),
    padding: hp(2),
  },
  searchTopics: {
    fontSize: hp(2),
    height: hp(2.2),
    color: AppColors.textGray,
    fontFamily: AppStyles.fontFamilyMedium,
  },
  topViewtitle: {
    color: AppColors.blackColor,
    marginTop: hp(3),
    marginLeft: wp(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2.5),
    textAlign: isRTL ? 'left' : 'auto',
  },
  latestTitle: {
    color: AppColors.blackColor,
    marginLeft: wp(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: hp(2.5),
    textAlign: isRTL ? 'left' : 'auto',
  },
  topBookMarkView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(3),
    width: wp(8),
    position: 'absolute',
    top: hp(1.5),
    left: wp(30),
  },
  topBookMarkImage: {
    height: hp(2),
    width: hp(2),
    // marginTop: AppUtils.isX ? (16 + 18) : 0,
  },
  topTopic: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.lightPink2,
    borderRadius: 2,
    height: hp(2.5),
    // width: AppUtils.isIphone ? wp(12) : wp(14),
    position: 'absolute',
    top: hp(15),
    left: wp(8),
  },
  topVisibilityView: {
    flexDirection: 'row',
    position: 'absolute',
    top: hp(15),
    left: wp(24),
    justifyContent: 'center',
    backgroundColor: AppColors.lightPink2,
    borderRadius: 2,
    height: hp(2.5),
    width: wp(11),
  },
  articleBookMark: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(3),
    width: wp(8),
    position: 'absolute',
    top: hp(0.5),
    left: Platform.OS === 'ios' ? wp(16) : wp(14),
  },
  articleBookMarkImage: {
    height: hp(2),
    width: hp(2),
    // marginTop: AppUtils.isX ? 16 + 18 : 0,
  },
});

export default ArticleStyle;