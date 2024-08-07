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
import images from "../utils/images";

const { height, width } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

import {
    CachedImage,
    ImageCacheProvider
} from '../cachedImage';
import { strings } from '../locales/i18n';
var date = new Date();


export default class VitalHomeDrawer extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            userImage: '',
            categoryList:
                [
                    {
                        category: 'Add Records',
                        name: strings('vital.vital.addRecords'),
                        logo: images.add_all
                    },
                    {
                        category: 'Doctor Mapping',
                        name: strings('vital.vital.docMap'),
                        logo: images.doctor_mapping
                    },
                    {
                        category: 'Add Vital Range',
                        name: strings('vital.vital.addRange'),
                        logo: images.heart2
                    },
                    // {
                    //     category: 'Manage Subscription',
                    //     name: strings('vital.vital.manageSubscription'),
                    //     logo: images.manageSubs
                    // },
                    {
                        category: 'Delete All Records',
                        name: strings('vital.vital.deleteAll'),
                        logo: images.delete_all
                    },
                    {
                        category: 'Profiles',
                        name: strings('vital.vital.profiles'),
                        logo: images.profiles
                    }


                ]
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
                    <TouchableHighlight onPress={() => {
                        Actions.EditProfile();
                    }} underlayColor='transparent'>
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
                                    fontSize: hp(1.8)
                                }}>{strings('shared.backHome')}</Text>
                            </View>
                        </TouchableOpacity>

                        {(this.state.categoryList.length > 0) ?
                            <View style={{
                                borderBottomWidth: 1,
                                marginTop: hp(2),
                                borderColor: AppColors.dividerMEColor,
                            }}>
                                <FlatList
                                    style={{ marginBottom: hp(2) }}
                                    showsVerticalScrollIndicator={false}
                                    testID={'drawerScroll'}
                                    renderItem={(item) => this.renderCategoryList(item)}
                                    data={this.state.categoryList}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View> : null
                        }

                    </ScrollView>
                </View>
            </View>
        )
    }

    renderCategoryList(item) {
        AppUtils.console("item", item)
        return (
            <TouchableOpacity onPress={() => this.goToSelectScreen(item)}
                style={{
                    flexDirection: 'row', height: hp(6),
                    alignItems: 'center', marginLeft: wp(8)
                }}>
                <Image resizeMode={'contain'} style={{ height: wp(6), width: wp(6) }} source={item.item.logo} />
                <Text allowFontScaling={false} numberOfLines={1} style={{
                    width: wp(45),
                    marginLeft: wp(3), marginTop: (AppUtils.isIphone) ? 8 : 0,
                    color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyRegular,
                    fontSize: hp(1.8),
                    textAlign: isRTL ? 'left' : 'auto',
                }}>{item.item.name}</Text>
            </TouchableOpacity>
        );
    }

    goToSelectScreen(item) {
        Actions.drawerClose();
                switch (item.item.category) {
            case 'Add Records':
                Actions.AddRecords();
                break;
            case 'Add Vital Range':
                Actions.SetVitalRange();
                break;
            case 'Delete All Records':
                Actions.DeleteRecords()
                break;
            case 'Doctor Mapping':
                Actions.DoctorMapping()
                break;
            case 'Profiles':
                Actions.VitalProfile()
                break;
            case 'Manage Subscription':
                //Actions.ShareVital();
                Actions.ManageSubscription();
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
