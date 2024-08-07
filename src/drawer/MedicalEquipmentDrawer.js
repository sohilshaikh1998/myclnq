import React from 'react';

import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    I18nManager
} from 'react-native';
import { AppColors } from "../shared/AppColors";
import MarqueeText from 'react-native-marquee';
import { Actions } from "react-native-router-flux";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppStyles } from "../shared/AppStyles";
import { AppUtils } from "../utils/AppUtils";
import { SHApiConnector } from "../network/SHApiConnector";

const { height, width } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

import {
    CachedImage,
    ImageCacheProvider
} from '../cachedImage';
import { strings } from '../locales/i18n';
var date = new Date();

let drawerOptions = [
    {
        key: 'order',
        title: strings('equip.myOrder'),
        icon: require('../../assets/images/openbox_drawer.png')
    },
    {
        key: 'wishlist',
        title: strings('equip.myWishlist'),
        icon: require('../../assets/images/wishlist.png')
    },
    {
        key: 'account',
        title: strings('equip.myAccount'),
        icon: require('../../assets/images/profile_drawer.png')
    },
    {
        key: 'setting',
        title: strings('equip.settings'),
        icon: require('../../assets/images/cogwheel_drawer.png')
    },
    {
        key: 'notify',
        title: strings('equip.notifications'),
        icon: require('../../assets/images/notification_medpro_fill.png')
    }

];

export default class MedicalEquipmentDrawer extends React.Component {


    constructor(props) {
        super(props); 
        this.state = {
            drawerOptions: drawerOptions,
            userName: '',
            userImage: '',
            categoryList: []
        };
        AppUtils.console("Props in drawer:", props)

    }


    async componentDidMount() {
        this.getDrawerData();
    }

    async getDrawerData() {
        try {
            let response = await SHApiConnector.getDrawerData();
            AppUtils.console("aszdcsxfb", response);
            if (response.data.status) {
                let userName = (response.data.response.profile.relativeDetails) ?
                    response.data.response.profile.relativeDetails.firstName + " " +
                    "" + response.data.response.profile.relativeDetails.lastName :
                    "+" + response.data.response.profile.countryCode + " " + response.data.response.profile.phoneNumber
                this.setState({
                    userName: userName,
                    categoryList: response.data.response.category,
                    userImage: response.data.response.profile.profilePic
                })
            }
        } catch (e) {
            AppUtils.console('DRAWER_DATA_ERROR', e);

        }
    }

    componentWillUnmount() {
        AppUtils.console("un mount")
    }

    render() {
        const staffName = 'Sandeep Mishra';
        const staffImage = require('../../assets/images/user_dummy_image.png');
        const staffSchool = 'Mishra Vishwa Vidyalaya';

        return (
            <View
                style={styles.modalBackground}>
                <View style={{ height: hp(100) }}>
                    <TouchableHighlight underlayColor='transparent'>
                        <View
                            colors={AppColors.primaryColor}
                            style={{
                                height: hp(20),
                                marginTop: (AppUtils.isX) ? hp(5) : hp(2),
                                width: wp(70),
                                borderBottomWidth: 1,
                                borderColor: AppColors.dividerMEColor,
                                alignItems: 'center',
                                alignSelf: 'center',
                                flexDirection: 'row'
                            }}>

                            <CachedImage
                                style={{
                                    width: wp(18),
                                    height: wp(18),
                                    marginLeft: wp(2),
                                    borderRadius: wp(10),
                                    borderColor: AppColors.blackColor,
                                    borderWidth: 0,
                                }}
                                source={{ uri: AppUtils.handleNullImg(this.state.userImage) }}
                            />
                            <View style={{ flexDirection: 'column', marginLeft: wp(5) }}>
                                <Text allowFontScaling={false} style={{
                                    color: AppColors.textMEGray,
                                    fontSize: hp(1.8),
                                    textAlign: isRTL ? 'left' : 'auto',
                                }}>{strings('shared.hello')}</Text>
                                 <Text
                                    numberOfLines={2}
                                    style={{
                                        color: AppColors.blackColor, width: wp(35),
                                        fontSize: hp(2.2),
                                        textAlign: isRTL ? 'left' : 'auto',
                                    }}>{this.state.userName}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                    <ScrollView>
                        <TouchableOpacity onPress={() => Actions.MainScreen()}
                            style={{ borderBottomWidth: 1, borderColor: AppColors.dividerMEColor, }}>
                            <View style={{
                                flexDirection: 'row', height: hp(6),
                                alignItems: 'center', marginLeft: wp(8)
                            }}>
                                <Image style={{ height: 30, width: 30 }}
                                    source={require('../../assets/images/home_drawer.png')} />
                                <Text allowFontScaling={false} style={{
                                    marginLeft: wp(3), marginTop: (AppUtils.isIphone) ? 8 : 0,
                                    color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: hp(2)
                                }}>
                                    {strings('shared.backHome')}
                                    </Text>
                            </View>
                        </TouchableOpacity>

                        {(this.state.categoryList.length > 0) ?
                            <View style={{
                                borderBottomWidth: 1,
                                marginTop: hp(2),
                                borderColor: AppColors.dividerMEColor,
                            }}>
                                <FlatList
                                    style={{ marginBottom: hp(2), height: hp(30) }}
                                    showsVerticalScrollIndicator={false}
                                    testID={'drawerScroll'}
                                    renderItem={(item) => this.renderCategoryList(item)}
                                    data={this.state.categoryList}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View> : null
                        }
                        <View style={{ marginTop: hp(2) }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                testID={'drawerScroll'}
                                renderItem={(item) => this.renderScreenList(item)}
                                data={this.state.drawerOptions}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }

    renderCategoryList(item) {
        AppUtils.console("item", item)
        return (
            <TouchableOpacity onPress={() => Actions.SearchProduct({
                selectedCategoryIndex: item.index + 1,
                selectedCategroyName: item.item.category
            })}
                style={{
                    flexDirection: 'row', height: hp(6),
                    alignItems: 'center', marginLeft: wp(8)
                }}>
                <Image style={{ height: 30, width: 30 }} source={{ uri: item.item.logo }} />
                <Text allowFontScaling={false} numberOfLines={1} style={{
                    width: wp(45),
                    marginLeft: wp(3), marginTop: (AppUtils.isIphone) ? 8 : 0,
                    color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: hp(2),
                    textAlign: isRTL ? 'left' : 'auto',
                }}>{item.item.category}</Text>
            </TouchableOpacity>
        );
    }

    goToSelectScreen(item) {
        switch (item.item.key) {
            case 'order':
                Actions.MedicalEquipmentBooking();
                break;
            case 'wishlist':
                Actions.WishList();
                break;
            case 'account':
                Actions.MedicalEquipmentProfile();
                break;
            case 'setting':
                Actions.Settings();
                break;
            case 'notify':
                Actions.MedicalEquipmentNotification();
                break;
        }
    }

    renderScreenList(item) {
        AppUtils.console("SDZFsvxcvxdcvdxvd", item);
        return (
            <TouchableOpacity onPress={() => this.goToSelectScreen(item)} style={{
                flexDirection: 'row', height: hp(6),
                alignItems: 'center', marginLeft: wp(8)
            }}>
                <Image style={{ height: 30, width: 30 }} source={item.item.icon} />
                <Text allowFontScaling={false} style={{
                    marginLeft: wp(3), marginTop: (AppUtils.isIphone) ? 8 : 0,
                    color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: hp(2)
                }}>{item.item.title}</Text>
            </TouchableOpacity>
        );
    }

}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
    }
});
