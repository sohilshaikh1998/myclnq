import React from 'react';
import {Dimensions, View} from 'react-native';

import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppColors} from "../../shared/AppColors";

import SHButtonDefault from "../../shared/SHButtonDefault";
import {AppUtils} from "../../utils/AppUtils";
import { strings } from '../../locales/i18n';

const {width, height} = Dimensions.get('window');

class ClinicListing extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Clinic Listing');
    }


    render() {
        return (
            <View style={{height: height, width: width}}>

                <View style={{width: width, flexDirection: 'row', margin: moderateScale(10)}}>
                    <SHButtonDefault btnText={strings('doctor.button.east')} btnType={'border-only'} btnTextColor={AppColors.blackColor}
                                     style={{
                                         height: verticalScale(30),
                                         width: moderateScale(60),
                                         margin: moderateScale(5)
                                     }}/>
                    <SHButtonDefault btnText={strings('doctor.button.west')} btnType={'border-only'} btnTextColor={AppColors.blackColor}
                                     style={{
                                         height: verticalScale(30),
                                         width: moderateScale(60),
                                         margin: moderateScale(5)
                                     }}/>
                    <SHButtonDefault btnText={strings('doctor.button.north')} btnType={'border-only'} btnTextColor={AppColors.blackColor}
                                     style={{
                                         height: verticalScale(30),
                                         width: moderateScale(60),
                                         margin: moderateScale(5)
                                     }}/>
                    <SHButtonDefault btnText={strings('doctor.button.south')} btnType={'border-only'} btnTextColor={AppColors.blackColor}
                                     style={{
                                         height: verticalScale(30),
                                         width: moderateScale(60),
                                         margin: moderateScale(5)
                                     }}/>
                </View>

            </View>
        )
    }
}


export default ClinicListing;
