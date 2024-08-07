/*
 * Created by anooj on 25/06/18.
 */
import React from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  I18nManager
} from "react-native";
import { RadioButton, RadioGroup } from "react-native-flexi-radio-button";
import { Actions } from "react-native-router-flux";
import { moderateScale, verticalScale } from "../utils/Scaling";
import { AppUtils } from "../utils/AppUtils";
import { AppStyles } from "../shared/AppStyles";
import { AppColors } from "../shared/AppColors";
import ElevatedView from "react-native-elevated-view";
import SHButtonDefault from "../shared/SHButtonDefault";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SHApiConnector } from "../network/SHApiConnector";
import { Dropdown } from "react-native-material-dropdown";
import { strings } from "../locales/i18n";

const { width, height } = Dimensions.get("window");
const isRTL = I18nManager.isRTL;

class TabHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animationType: "bounceInUp",
      showFilters: false,
      isMenuOpen: false,
      location: "",
      text: "",
      insuranceList: [],
      insuranceListForDropdown: [],
      selectedInsuranceId: "",
      selectedInsurance: "",
    };
    this.props.filtersSet ? (this.props.filtersSet = false) : null;
  }
  componentDidMount() {
    this.getInsuranceList();
  }

  componentWillReceiveProps(props) {
    if (props.range) {
      this.setState({ showFilters: true });
    }
    if (props.filtersSet) {
      props.filtersSet = false;
    }
    this.setState({
      location: this.props.location,
    });
  }
  async getInsuranceList() {
    let response = await SHApiConnector.getInsuranceList();
    AppUtils.console("Insurance", response);

    if (response.data.status) {
      AppUtils.console("InsuranceList", response.data);
      this.setState({ insuranceList: response.data.response });
      let insuranceList = response.data.response;
      await insuranceList.map((insuranceList) => {
        insuranceList.value = insuranceList.companyName;
      });
      this.setState({
        insuranceListForDropdown: insuranceList,
      });
    }
  }

  openSettings() {
    Actions.Settings();
    this.setState({ showFilters: false });
  }

  closeControlPanel = () => {
    this._drawer.close();
  };
  openControlPanel = () => {
    this._drawer.open();
  };

  render() {
    return AppUtils.isIphone ? this.renderIOS() : this.renderAndroid();
  }

  openFilter() {
    Keyboard.dismiss();
    this.setState({ showFilters: !this.state.showFilters });
  }

  onSelectClinic(index, value) {
    this.setState({
      text: `Selected index: ${index} , value: ${value}`,
    });
    AppUtils.insuranceId = "";
    AppUtils.insuranceAccepted = index;
  }

  onAnimEnd() {
    if (this.state.isMenuOpen == false) {
      this.setState({
        isMenuOpen: !this.state.isMenuOpen,
      });
    } else if (this.state.animationType == "bounceOutDown") {
      this.setState({
        isMenuOpen: false,
      });
    }
  }

  onAnimStart() {
    AppUtils.console("OnAnimStart: ", this.state);
  }

  getFilter(val) {
    var self = this;
    self.setState({ value: val });

    AppUtils.maxDistance = self.state.value;

    var distance = {
      maximumDistance: self.state.value * 1000,
    };
  }

  openFilters() {
    const sliderWidth = AppUtils.isIphone ? AppUtils.screenWidth / 2.2 : 250;
    return (
      <ScrollView
        style={{
          backgroundColor: AppColors.lightGray,
          height:
            AppUtils.screenHeight -
            (AppUtils.headerHeight + 2 * AppUtils.tabHeight),
        }}
      >
        <View
          animation={this.state.animationType}
          onAnimationEnd={() => this.onAnimEnd()}
          onAnimationBegin={() => this.onAnimStart()}
          duration={4000}
        >
          <View
            style={{
              height:
                Platform.OS === "ios" ? verticalScale(110) : verticalScale(100),
              margin: moderateScale(15),
              flexDirection: "column",
              borderBottomWidth: moderateScale(1),
              borderBottomColor: AppColors.primaryGray,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                margin: moderateScale(10),
                fontFamily: AppStyles.fontFamilyMedium,
                fontSize: moderateScale(20),
                color: AppColors.textGray,
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings("shared.filter")}
            </Text>
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                marginLeft: moderateScale(20),
                fontSize: moderateScale(12),
                color: AppColors.textGray,
                textAlign: isRTL ? 'left' : 'auto',
              }}
              numberOfLines={2}
            >
              {strings("shared.subjetedBasedOnPresentDay")}
            </Text>
          </View>
          <View
            style={{
              height: verticalScale(80),
              width: width,
              flexDirection: "column",
              paddingLeft: moderateScale(20),
              paddingRight: moderateScale(20),
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <View style={{ justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: moderateScale(18),
                    fontFamily: AppStyles.fontFamilyRegular,
                    color: AppColors.textGray,
                  }}
                >
                  {strings("shared.searchIn")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  width: sliderWidth,
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <Text style={styles.distance}>{AppUtils.maxDistance} Km</Text>
                <Slider
                  style={{
                    width: sliderWidth,
                    marginBottom: verticalScale(30),
                  }}
                  color={AppColors.primaryColor}
                  step={0.5}
                  minimumValue={5}
                  maximumValue={10}
                  value={AppUtils.maxDistance}
                  minimumTrackTintColor={AppColors.primaryColor}
                  maximumTrackTintColor={AppColors.textGray}
                  thumbTintColor={AppColors.primaryColor}
                  onValueChange={(val) => this.getFilter(val)}
                  onSlidingComplete={(val) => this.getFilter(val)}
                />
              </View>
            </View>
          </View>
          <View style={{ margin: moderateScale(20), width: width }}>
            <Text
              style={{
                fontFamily: AppStyles.fontFamilyRegular,
                fontSize: moderateScale(18),
                color: AppColors.textGray,
                textAlign: isRTL ? 'left' : 'auto',
              }}
            >
              {strings("common.common.insurance")}
            </Text>

            <View style={{ flexDirection: "row" }}>
              <RadioGroup
                style={{ flexDirection: "row" }}
                color={AppColors.primaryGray}
                activeColor={AppColors.primaryColor}
                selectedIndex={AppUtils.insuranceAccepted}
                onSelect={(index, value) => this.onSelectClinic(index, value)}
              >
                <RadioButton value={"item1"}>
                  <Text style={{ color: AppColors.blackColor }}>
                    {strings("shared.accepted")}
                  </Text>
                </RadioButton>

                <RadioButton value={"item2"}>
                  <Text style={{ color: AppColors.blackColor }}>
                    {strings("shared.notAccepted")}
                  </Text>
                </RadioButton>
                <RadioButton value={"item2"}>
                  <Text style={{ color: AppColors.blackColor }}>
                    {strings("shared.both")}
                  </Text>
                </RadioButton>
              </RadioGroup>
            </View>
          </View>
          {AppUtils.insuranceAccepted === 0 ? (
            <View style={{ marginLeft: wp(5.5), marginRight: wp(5.5) }}>
              <TouchableOpacity
                onPress={() => this.refs.departmentDropdown.onPress()}
                style={{
                  marginTop: hp(2),
                  height: hp(6),
                  justifyContent: "center",
                  fontFamily: AppStyles.fontFamilyRegular,
                  borderWidth: hp(0.2),
                  borderColor: AppColors.backgroundGray,
                  borderRadius: hp(1),
                  width: wp(90),
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Dropdown
                  ref={"departmentDropdown"}
                  label=""
                  textColor={AppColors.blackColor}
                  itemColor={AppColors.blackColor}
                  fontFamily={AppStyles.fontFamilyRegular}
                  dropdownPosition={-5}
                  dropdownOffset={{ top: hp(2), left: wp(1.8) }}
                  itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                  rippleCentered={false}
                  dropdownMargins={{ min: 8, max: 16 }}
                  baseColor={"transparent"}
                  value={strings("shared.selectInsurance")}
                  onChangeText={(value, index, data) =>
                    this.selectInsurance(index, data)
                  }
                  pickerStyle={{
                    width: wp(89),
                    height: hp(20),
                  }}
                  containerStyle={{
                    width: wp(80),
                    marginTop: Platform.OS === "ios" ? hp(0.8) : 0,
                    justifyContent: "center",
                  }}
                  data={this.state.insuranceListForDropdown}
                />
                <Image
                  resizeMode={"contain"}
                  style={{ height: hp(2.5), width: hp(2.5) }}
                  source={require("../../assets/images/arrow_down.png")}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: verticalScale(50),
              borderWidth: 0,
              borderColor: AppColors.blackColor,
            }}
          >
            <SHButtonDefault
              btnText={strings("shared.clearAll")}
              btnTextColor={AppColors.textGray}
              btnType={"border-only"}
              style={{ margin: moderateScale(5) }}
              btnPressBackground="transparent"
              onBtnClick={() => this.clearFilters()}
            />

            <SHButtonDefault
              btnText={strings("shared.applyFilter")}
              btnType={"normal"}
              style={{ margin: moderateScale(5) }}
              onBtnClick={() => this.apply()}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  selectInsurance(index, data) {
    AppUtils.console(
      "selectedIns",
      data[index]._id,
      " name",
      data[index].companyName
    );
    AppUtils.insuranceId = data[index]._id;
    // this.setState({ selectedInsuranceId: data[index]._id, selectedInsurance: data[index].companyName })
  }

  clearFilters() {
    this.setState({ showFilters: false });
    AppUtils.insuranceId = "";
    AppUtils.maxDistance = 5;
    AppUtils.insuranceAccepted = 2;
    Actions.refresh({ range: false, filtersSet: false });
    Actions.HomeScreenDash();
  }

  apply() {
    this.setState({ showFilters: false });
    Actions.refresh({ range: false, filtersSet: true });
  }

  renderIOS() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <View style={{ flexDirection: "column" }}>
        <ElevatedView
          elevation={0}
          style={[styles.headerStyleIOS, { flexDirection: "row" }]}
        >
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => Actions.MainScreen()}
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: "center",
            }}
          >
            <Image
              style={{
                height: hp(4.5),
                width: hp(4.5),
                marginTop: AppUtils.isX ? 16 + 18 : 16,
                marginLeft: wp(3),
                tintColor: AppColors.blackColor,
              }}
              source={require("../../assets/images/house_call.png")}
            />
          </TouchableHighlight>
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: "center",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.headerText}>{this.props.title}</Text>
            {this.props.location != undefined && this.props.location != "" ? (
              <Text style={styles.LocationText} numberOfLines={1}>
                {this.props.location}
              </Text>
            ) : (
              <View />
            )}
          </View>
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: "flex-end",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableHighlight
              onPress={() => this.openFilter()}
              underlayColor="transparent"
            >
              <Image
                onPress={() => this.openFilter()}
                style={{
                  marginTop: AppUtils.isX ? 16 + 18 : 16,
                  height: hp(4),
                  marginRight: moderateScale(15),
                  width: hp(4),
                }}
                source={require("../../assets/images/filter.png")}
              />
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.openSettings()}
              underlayColor="transparent"
              style={{ marginRight: 8 }}
            >
              <Image
                style={{
                  height: hp(4),
                  marginTop: AppUtils.isX ? 16 + 18 : 16,
                  width: hp(4),
                }}
                source={require("../../assets/images/setting.png")}
              />
            </TouchableHighlight>
          </View>
        </ElevatedView>
        {this.state.showFilters ? this.openFilters() : <ElevatedView />}
      </View>
    );
  }

  openListing() {
    //Actions.ClinicListing();
  }

  renderAndroid() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <View style={{ flexDirection: "column" }}>
        <ElevatedView
          elevation={0}
          style={[styles.headerStyle, { flexDirection: "row" }]}
        >
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => Actions.MainScreen()}
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              paddingTop: AppUtils.isX ? 16 + 18 : 0,
              justifyContent: "center",
            }}
          >
            <Image
              style={{
                height: hp(5),
                width: moderateScale(23),
                marginLeft: wp(3),
                tintColor: AppColors.blackColor,
              }}
              source={require("../../assets/images/house_call.png")}
            />
          </TouchableHighlight>
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: "center",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.headerText}>{this.props.title}</Text>
            {this.props.location != undefined && this.props.location != "" ? (
              <Text style={styles.LocationText} numberOfLines={1}>
                {this.props.location}
              </Text>
            ) : (
              <View />
            )}
          </View>
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: "flex-end",
              flexDirection: "row",
              alignItems: "center",
              paddingTop: AppUtils.isX ? 16 + 18 : 0,
            }}
          >
            <TouchableHighlight
              onPress={() => this.openFilter()}
              underlayColor="transparent"
            >
              <Image
                onPress={() => this.openFilter()}
                style={{
                  height: hp(4),
                  marginRight: moderateScale(15),
                  width: moderateScale(30),
                }}
                source={require("../../assets/images/filter.png")}
              />
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.openSettings()}
              underlayColor="transparent"
              style={{ marginRight: 8 }}
            >
              <Image
                style={{ height: hp(4), width: moderateScale(30) }}
                source={require("../../assets/images/setting.png")}
              />
            </TouchableHighlight>
          </View>
        </ElevatedView>
        {this.state.showFilters ? this.openFilters() : <ElevatedView />}
      </View>
    );
  }

  // renderAndroid() {
  //     const cellWidth = AppUtils.screenWidth / 3;
  //     return (
  //         <View style={{flexDirection: 'column'}}>
  //
  //             <ElevatedView style={styles.headerStyle} elevation={5}>
  //                 <TouchableHighlight underlayColor="transparent"
  //                     onPress={() => Actions.MainScreen()}
  //                       style={{width: cellWidth,
  //                           height: (AppUtils.headerHeight),
  //                           justifyContent: 'center'}} >
  //                     <Image
  //                         style={{
  //                             height: moderateScale(30),
  //                             marginLeft: moderateScale(15),
  //                             width: moderateScale(30)
  //                         }}
  //                         source={require('../../assets/images/blackarrow.png')}
  //                     />
  //                 </TouchableHighlight>
  //                 <View style={{width: cellWidth, marginLeft: AppUtils.isIphone ? 0 : moderateScale(50)}}>
  //                     <Text style={styles.headerText}>{this.props.title}</Text>
  //                     <Text style={styles.LocationText} numberOfLines={1}>{this.props.location}</Text>
  //                 </View>
  //                 <TouchableHighlight style={{width: cellWidth}} onPress={() => this.openFilter()} underlayColor="transparent">
  //                     <Image onPress={() => this.openFilter()}
  //                            style={{
  //                                height: moderateScale(30),
  //                                marginRight: moderateScale(15),
  //                                width: moderateScale(30)
  //                            }}
  //                            source={require('../../assets/images/filter.png')}
  //                     />
  //                 </TouchableHighlight>
  //                 <TouchableHighlight onPress={() => this.openSettings()} underlayColor="transparent">
  //                     <Image
  //                         style={{height: moderateScale(30), width: moderateScale(30)}}
  //                         source={require('../../assets/images/setting.png')}
  //                     />
  //                 </TouchableHighlight>
  //
  //             </ElevatedView>
  //             {(this.state.showFilters) ?
  //                 this.openFilters() : <ElevatedView/>}
  //         </View>
  //
  //     )
  // }
}

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 5,
    flexDirection: "row",
  },
  headerStyleIOS: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
  },
  headerText: {
    color: AppColors.blackColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: AppUtils.isX
      ? 16 + 18
      : Platform.OS === "ios"
      ? 20
      : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  LocationText: {
    color: AppColors.textGray,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    textAlign: "center",
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(12),
    width: moderateScale(200),
  },
  distance: {
    fontSize: 20,
    textAlign: "right",
    marginTop: 20,
    color: AppColors.blackColor,
  },
});

export default TabHeader;
