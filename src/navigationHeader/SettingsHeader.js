import React from 'react';
import {Image, Platform, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';


class SettingsHeader extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (AppUtils.isIphone ? this.renderIOS() : this.renderAndroid());
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={5}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                                    style={{
                                        width: cellWidth,
                                        height: (AppUtils.headerHeight),
                                        justifyContent: 'center'
                                    }}>
                    <Image
                        style={{
                            height: moderateScale(30),
                            width: moderateScale(30),
                            marginTop: AppUtils.isX ? (16 + 18) : 16,
                            marginLeft: 8
                        }}
                        source={require('../../assets/images/blackarrow.png')}
                    />
                </TouchableHighlight>
                <View style={{width: cellWidth, height: (AppUtils.headerHeight), justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: AppUtils.isX ? (16 + 18) : 16
                }}>

                </View>


            </ElevatedView>

        )
    }

    goBack() {
        AppUtils.console("logggg");
        Actions.pop()
    }


    renderAndroid() {
        return (

            <ElevatedView style={styles.headerStyle} elevation={5}>
                <TouchableHighlight style={{width: wp(25)}} onPress={() => this.goBack()} underlayColor='transparent'>
                    <Image
                        style={{height: moderateScale(30), width: moderateScale(30), marginLeft: wp(4)}}
                        source={require('../../assets/images/blackarrow.png')}
                    />
                </TouchableHighlight>
                <View style={{width: wp(50)}}>
                    <Text allowFontScaling={false} style={styles.headerText}>{this.props.title}</Text>
                </View>
                <View style={{width: wp(25)}}/>
            </ElevatedView>
        )
    }
}

const styles = StyleSheet.create({

    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        elevation: 5,
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        textAlign:'center',
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default SettingsHeader;