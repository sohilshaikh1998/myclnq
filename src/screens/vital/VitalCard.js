import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import {AppUtils} from '../../utils/AppUtils';
import ArrayData from '../../shared/dummy';
import { strings } from '../../locales/i18n';

const VitalCard = (props) => {
    const [indexValue, setIndexVal] = useState('');
    const selected = props.selected;

    let val = '';
    AppUtils.console('propsVaaaaaa'+props.itemIs.subscriptionPlanName+props.indexValue)
    return (
        <TouchableOpacity

            onPress={() => {
                // indexValue = props.indexValue;
                // setIndexVal(props.indexValue);
                // val = props.indexValue;

                props.updatePlan(props.indexValue)
            }}
            style={{
                alignItems: 'flex-start',
                width: wp('26%'),
                height: hp('15'),
                borderRadius: wp('3%'),
                marginBottom: hp(1.5),
                borderColor: selected ? AppColors.primaryColor : AppColors.primaryGray,
                borderWidth: 1,
                marginRight:props.indexValue == 1 ? wp(5):wp(3),
                backgroundColor: selected ? '#FFE5E5' : AppColors.whiteColor
            }}>

            <View style={{ height: hp('3%') }}>
                <Image resizeMode="contain" style={{
                    height: hp('4%'), width: wp('5%'), marginLeft: wp(3), marginTop: hp(1)
                }}
                    source={require('../../../assets/images/membership.png')} />
            </View>
            <View style={{ marginLeft: wp(3), marginTop: hp(3) }}>
                <Text style={{
                    fontSize: 12,
                    fontFamily: AppStyles.fontFamilyMedium, color: AppColors.blackColor
                }}>{props.title}</Text>
            </View>


            <View style={{ height: hp('3%'), marginTop: hp('1%'), marginLeft: wp('3'), flexDirection: 'row' }}>
                <Text style={{ alignSelf: 'center', color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyDemi }}>{props.symbol}{props.currency}</Text>
                {props.title == "Monthly" ?
                    <View>
                        <Text style={{ alignSelf: 'center', color: AppColors.blackColor, fontSize: 6, textAlign: 'center', marginTop: hp(1) }}>/month</Text>
                    </View>
                    : null
                }
            </View>
        </TouchableOpacity>
    )
}
export default VitalCard;
