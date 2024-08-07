import React from 'react';
import {Image, Platform, StyleSheet,BackHandler, Text, TouchableHighlight, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import AsyncStorage from '@react-native-community/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

import images from "./../utils/images";
import { AppStrings } from '../shared/AppStrings';


class EquipmentCommonHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHome: true
        }
    }

    render() {
        return (
            AppUtils.isIphone ? this.renderIOS() : this.renderIOS()
        );
    }
    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack()

            return true;
        })
    }


   async goBack() {
        let self = this;
      
        let cart = await AsyncStorage.getItem(AppStrings.label.cart_count);
        AppUtils.console("cartCount",cart)
        cart = JSON.parse(cart);
            Actions.pop();
            setTimeout(()=>{
                AppUtils.console("timeout","----->",cart.cartCount)
                Actions.refresh({cartCount:cart.cartCount})
            },1000);
       
             
           


     
     

    }


    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={5}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent"
                                        onPress={()=>this.goBack()}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginLeft: 8
                            }}
                            source={images.smallBackIcon}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{width: cellWidth, height: (AppUtils.headerHeight),
                    marginTop:(AppUtils.isIphone) ? AppUtils.isX ? (0 +4) : 10 : 0,
                    justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 5 : 16 : 0,
                }}>
                    <TouchableHighlight onPress={() => Actions.drawer()} underlayColor="transparent"
                                        style={{marginRight: 8}}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                </View>
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
        //elevation: 5,
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        marginLeft: moderateScale(120),
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 25) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default EquipmentCommonHeader;
