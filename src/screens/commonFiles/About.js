import React from 'react';
import {Dimensions, Image, ScrollView, Text, View} from 'react-native';
import {AppStyles} from '../../shared/AppStyles'
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppColors} from "../../shared/AppColors";
import {AppUtils} from "../../utils/AppUtils";
import {AppStrings} from "../../shared/AppStrings";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import { strings } from '../../locales/i18n';

const {width, height} = Dimensions.get('window');


class About extends React.Component {
    constructor(props) {
        AppUtils.analyticsTracker("About")
        super(props);
    }

    render() {
        return (
            <View style={{backgroundColor: AppColors.whiteColor}}>
                <ScrollView contentContainerStyle={{height: heightPercentageToDP(150)}}>
                    <View style={{
                        margin: widthPercentageToDP(5),
                        marginTop: heightPercentageToDP(2),
                        backgroundColor: AppColors.whiteColor,
                        alignItems: 'center',
                        alignSelf: 'center',
                        flex: 1
                    }}>
                        <View style={{
                            backgroundColor: AppColors.whiteColor,
                            alignItems: 'center',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: AppColors.blackColor,
                                fontFamily: AppStyles.fontFamilyMedium,
                                lineHeight: moderateScale(25),
                                fontSize: moderateScale(15)
                            }}>{strings('string.aboutUs.aboutus_1')}{"\n\n"}{strings('string.aboutUs.aboutus_2')}</Text>
                            {/* <Text style={{
                                color: AppColors.blackColor,
                                fontFamily: AppStyles.fontFamilyMedium,
                                lineHeight: moderateScale(25),
                                marginTop: moderateScale(10),
                                fontSize: moderateScale(15)
                            }}>{strings('string.aboutUs.aboutus_2')}</Text> */}
                            <Image
                                style={{height: verticalScale(70), width: moderateScale(70)}}
                                source={require('../../../assets/images/clnq_main_logo.png')}
                            />
                            <Text style={{
                                color: AppColors.primaryColor,
                                fontFamily: AppStyles.fontFamilyMedium,
                                lineHeight: moderateScale(25),
                                fontSize: moderateScale(15)
                            }}>MyCLNQ</Text>
                            <Text style={{
                                color: AppColors.blackColor,
                                fontFamily: AppStyles.fontFamilyMedium,
                                lineHeight: moderateScale(25),
                                fontSize: moderateScale(15)
                            }}>App Version : v{AppStrings.myClnqVersionName}</Text>

                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }

}

export default About;
