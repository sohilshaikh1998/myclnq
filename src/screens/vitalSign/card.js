import React, {useState, useEffect} from 'react';
import {Text, View, Image, TouchableOpacity, ImageBackground} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
    widthPercentageToDP
} from 'react-native-responsive-screen';
import { strings } from '../../locales/i18n';
import {AppColors} from '../../shared/AppColors';
import {AppStyles} from '../../shared/AppStyles';
import { AppUtils } from '../../utils/AppUtils';

const VitalCard = (props) => {
    const [colorPassed, setColor] = useState(props.title);
    const [marginpad, setmarginpad] = useState(false);

    useEffect(() => {
        if (props.title == 'Average') {
            setmarginpad(false);
        }
        else if (props.title == 'Maximum' || 'Diastolic') {
            setmarginpad(true);
        } else if (props.title == 'Minimum' || 'Systolic' ) {
            setmarginpad(true);
        } 
    }, []);
    let reading = parseFloat(props.reading).toFixed(1);

    return (
        <View
            style={[{
                flex: 1,
                justifyContent: "center",
                width: wp('27%'),
                height: hp('15'), borderRadius: wp(3),
                marginLeft: marginpad ? wp('5%') : wp('0%'),
                backgroundColor: props.title == 'Average' ?AppColors.vitalcard1 :
                 (props.title == 'Minimum' || props.title == 'Systolic')?AppColors.vitalcard2 :AppColors.vitalcard3,
                overflow: 'hidden'

            }]}>
            <ImageBackground resizeMode="contain" style={[{
                flex: 1,
                resizeMode: "cover",
                justifyContent: "center",
                overflow: 'hidden'
            }]}
                             source={require('../../../assets/images/stars.png')}>
                <View style={{height: hp('3%')}}>
                    <Image resizeMode="contain" style={{
                        marginRight: wp('3%'),
                        height: hp('4%'), width: wp('5%'), alignSelf: 'flex-end'
                    }}
                           source={{uri: props.image}}/>
                </View>
                <View style={{
                    flexDirection: 'column', marginLeft: wp(4),
                    marginTop: hp(1),
                    height: hp('6%')
                }}>
                    <Text style={{
                        fontSize: 20,
                        textAlign:'left',
                        fontFamily: AppStyles.fontFamilyBold,
                        color: AppColors.whiteColor
                    }}>{ props.reading}</Text>
                    <Text numberOfLines={1} style={{ justifyContent: 'flex-end', paddingRight: wp(2),
                        color: AppColors.whiteColor }}>{props.unit}</Text>
                </View>
                <View style={{height: hp('3%'), marginTop: hp('1%')}}>
                    <Text style={{alignSelf: 'center', color: AppColors.whiteColor, fontSize: 11,}}>{props.title}</Text>
                </View>
            </ImageBackground>
        </View>
    )
}
export default VitalCard;
