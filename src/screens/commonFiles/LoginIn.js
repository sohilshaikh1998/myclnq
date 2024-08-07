import React from 'react';
import {Actions} from 'react-native-router-flux';
import {Dimensions, StyleSheet, Text, TouchableHighlight, View,} from 'react-native';
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppStyles} from '../../shared/AppStyles';
import {AppColors} from "../../shared/AppColors";
import {AppUtils} from "../../utils/AppUtils";
import { strings } from '../../locales/i18n';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class LoginIn extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('LoginIn');
    }

    componentWillMount() {

    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.nameView}>
                    <Text style={styles.nameText}>SmartHelp</Text>
                </View>
                <View style={styles.view}>
                    <TouchableHighlight onPress={Actions.LoginMobile} underlayColor='transparent'>
                        <View style={styles.numberView}>
                            <Text style={styles.numberText}>{strings(common.common.enterNumber)}</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={styles.termView}>
                    <Text style={styles.termText}>{strings('common.common.TC')}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
        justifyContent: 'flex-start',
        backgroundColor: AppColors.whiteColor
    },
    nameView: {
        height: verticalScale(100),
        alignItems: 'center',
        marginTop: moderateScale(100),

    },
    view: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: moderateScale(100)

    },
    nameText: {
        color: AppColors.primaryColor,
        fontWeight: 'bold',
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: moderateScale(22),
        justifyContent: 'center',
        alignContent: 'center'
    },
    numberView: {
        borderColor: AppColors.primaryColor,
        borderWidth: 1.5,
        height: verticalScale(60),
        width: moderateScale(300),
        justifyContent: 'center',

    },
    numberText: {
        color: AppColors.blackColor,
        fontSize: moderateScale(14),
        fontFamily: AppStyles.fontFamilyMedium,
        justifyContent: 'center',
        width: moderateScale(280),
        borderWidth: 0,
        textAlign: 'center'

    },
    termText: {
        color: AppColors.textGray,
        fontSize: moderateScale(15),
        fontFamily: AppStyles.fontFamilyMedium
    },
    termView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: verticalScale(200)
    }
});

export default LoginIn;



