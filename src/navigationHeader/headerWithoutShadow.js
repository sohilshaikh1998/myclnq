import React from 'react';
import {BackHandler, Image, Platform, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';


class headerWithoutShadow extends React.Component {
    constructor(props) {
        super(props);

        this.goBack = this.goBack.bind(this)
    }


    render() {
        return (AppUtils.isIphone ? this.renderIOS() : this.renderAndroid());
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack()

            return true;
        })
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 4;
        return (

            <ElevatedView 
            style={[styles.headerStyle, {flexDirection: 'row'}]} 
            elevation={0}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                                    style={{
                                        width: wp(25),
                                        height: (AppUtils.headerHeight),
                                        justifyContent: 'center'
                                    }}>
                    <Image
                        resizeMode={'contain'}
                        style={{
                            height: moderateScale(30),
                            width: moderateScale(30),
                            marginTop: AppUtils.isX ? (16 + 18) : 16,
                            marginLeft: 8
                        }}
                        source={require('../../assets/images/blackarrow.png')}
                    />
                </TouchableHighlight>
                <View style={{width: wp(50), height: (AppUtils.headerHeight), justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={[styles.headerTextIOS, {textAlign: 'center'}]}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: wp(25),
                }}>

                </View>


            </ElevatedView>

        )
    }

    goBack() {
        let self = this;
        let route = AppUtils.isIphone ? self.props.title : self.props.routeName;
        AppUtils.console("logggg", route);


        if (route == "WishList" || route == "Wish List" || route == "Search" || route == "SearchProduct") {
            Actions.drawer();

        } else {
            Actions.pop();

        }

    }


    renderAndroid() {
        return (
            <View style={[styles.headerStyle, {}]} elevation={0}>
                <TouchableHighlight style={{width: wp(25)}} onPress={() => this.goBack()} underlayColor='transparent'>
                    <Image
                        style={{height: moderateScale(30), width: moderateScale(30), marginLeft: wp(3)}}
                        source={require('../../assets/images/blackarrow.png')}
                    />
                </TouchableHighlight>
                <View style={{width: wp(50)}}>
                    <Text allowFontScaling={false} style={styles.headerText}>{this.props.title}</Text>
                </View>
                <View style={{width: wp(25)}}/>
            </View>

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
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(0))),
        fontFamily: AppStyles.fontFamilyMedium,
        textAlign:'center',
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

export default headerWithoutShadow;
